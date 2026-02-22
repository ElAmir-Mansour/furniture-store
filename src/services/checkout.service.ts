import prisma from '@/lib/prisma';
import paymob from '@/lib/paymob';
import { cartService } from './cart.service';
import { promoService } from './promo.service';
import { productService } from './product.service';
import { emailService } from './EmailService';
import { Order, OrderStatus, Address } from '@prisma/client';
import { CheckoutInitRequest, CheckoutSession, AddressData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class CheckoutService {
    // Initialize checkout
    async initializeCheckout(
        userId: string,
        data: CheckoutInitRequest,
        isGuest: boolean = false
    ): Promise<CheckoutSession> {
        // Validate and get cart
        const { valid, cart, removedItems } = await cartService.validateCart(userId, isGuest);

        if (!valid || cart.items.length === 0) {
            throw new Error(
                removedItems.length > 0
                    ? `Some items are no longer available: ${removedItems.join(', ')}`
                    : 'Your cart is empty'
            );
        }

        // Get or create address
        let address: Address | null = null;

        if (data.addressId) {
            address = await prisma.address.findUnique({
                where: { id: data.addressId },
            });

            if (!address || (address.userId !== userId)) {
                throw new Error('Address not found');
            }
        } else if (data.newAddress) {
            address = await this.createAddress(userId, data.newAddress);
        } else {
            throw new Error('Please provide a delivery address');
        }

        // Calculate totals
        let subtotal = cart.subtotal;
        let discount = 0;
        let promoCodeId: string | null = null;

        // Apply promo code
        if (data.promoCode) {
            const promoResult = await promoService.validatePromoCode(
                data.promoCode,
                cart,
                userId
            );

            if (promoResult.valid && promoResult.code) {
                discount = promoResult.discount || 0;
                promoCodeId = promoResult.code.id;
            }
        }

        // Calculate shipping (can be enhanced with location-based pricing)
        const shippingCost = this.calculateShipping(address.governorate);

        const total = subtotal - discount + shippingCost;

        // Generate order number
        const orderNumber = this.generateOrderNumber();

        // Create order in PENDING status
        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId,
                status: 'PENDING',
                subtotal,
                discount,
                shippingCost,
                total,
                promoCodeId,
                paymentMethod: data.paymentMethod,
                shippingName: address.fullName,
                shippingPhone: address.phone,
                shippingStreet: address.street,
                shippingBuilding: address.building,
                shippingCity: address.city,
                shippingGovernorate: address.governorate,
                shippingPostalCode: address.postalCode,
                shippingLat: address.lat,
                shippingLng: address.lng,
                customerNote: data.customerNote,
                items: {
                    create: cart.items.map((item) => ({
                        variantId: item.variantId,
                        productName: item.variant.product.name,
                        variantName: item.variant.name,
                        quantity: item.quantity,
                        unitPrice: Number(item.variant.product.price) + Number(item.variant.priceAdj),
                        total: item.itemTotal,
                    })),
                },
                statusHistory: {
                    create: {
                        status: 'PENDING',
                        note: 'Order created',
                    },
                },
            },
        });

        // Handle payment based on method
        let paymobOrderId: number | undefined;
        let iframeUrl: string | undefined;
        let redirectUrl: string | undefined;

        if (data.paymentMethod === 'card') {
            // Initialize Paymob card payment
            const billingData = this.createBillingData(address);
            const items = cart.items.map((item) => ({
                name: item.variant.product.name,
                amount_cents: Math.round(item.itemTotal * 100),
                description: item.variant.name,
                quantity: item.quantity,
            }));

            const paymobResult = await paymob.initiatePayment(
                total,
                billingData,
                items,
                order.id
            );

            paymobOrderId = paymobResult.orderId;
            iframeUrl = paymobResult.iframeUrl;

            // Update order with Paymob order ID
            await prisma.order.update({
                where: { id: order.id },
                data: { paymobOrderId: paymobResult.orderId.toString() },
            });
        } else if (data.paymentMethod === 'wallet' && data.walletNumber) {
            // Initialize Paymob wallet payment
            const billingData = this.createBillingData(address);

            const paymobResult = await paymob.initiateMobileWalletPayment(
                total,
                billingData,
                data.walletNumber,
                order.id
            );

            paymobOrderId = paymobResult.orderId;
            redirectUrl = paymobResult.redirectUrl;

            await prisma.order.update({
                where: { id: order.id },
                data: { paymobOrderId: paymobResult.orderId.toString() },
            });
        } else if (data.paymentMethod === 'cod') {
            // Cash on delivery - mark as processing immediately
            await this.updateOrderStatus(order.id, 'PROCESSING', 'Cash on delivery order');
        }

        return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            total,
            paymentMethod: data.paymentMethod,
            paymobOrderId,
            iframeUrl,
            redirectUrl,
        };
    }

    // Process Paymob callback
    async processPaymentCallback(data: Record<string, string | number | boolean>, hmac: string): Promise<{
        success: boolean;
        orderId?: string;
        message: string;
    }> {
        // Verify HMAC
        if (!paymob.verifyHmac(data, hmac)) {
            return { success: false, message: 'Invalid signature' };
        }

        const success = data.success === true || data.success === 'true';
        const paymobOrderId = String(data.order);
        const transactionId = String(data.id);

        // Find order by Paymob order ID
        const order = await prisma.order.findFirst({
            where: { paymobOrderId },
            include: { items: true },
        });

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        if (success) {
            // Validate stock before confirming
            for (const item of order.items) {
                const hasStock = await productService.checkStock(item.variantId, item.quantity);
                if (!hasStock) {
                    // Cancel order if stock unavailable
                    await this.updateOrderStatus(order.id, 'CANCELLED', 'Insufficient stock');
                    return { success: false, orderId: order.id, message: 'Item no longer available' };
                }
            }

            // Update order status
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymobTransactionId: transactionId,
                    isPaid: true,
                    paidAt: new Date(),
                },
            });

            await this.updateOrderStatus(order.id, 'PAID', 'Payment confirmed');

            // Decrement stock
            for (const item of order.items) {
                await productService.decrementStock(item.variantId, item.quantity);
            }

            // Increment promo code usage
            if (order.promoCodeId) {
                await promoService.incrementUsage(order.promoCodeId);
            }

            // Clear cart
            await cartService.clearCart(order.userId, false);

            // Send order confirmation email
            await this.sendOrderConfirmationEmail(order.id);

            return { success: true, orderId: order.id, message: 'Payment successful' };
        } else {
            await this.updateOrderStatus(order.id, 'CANCELLED', 'Payment failed');
            return { success: false, orderId: order.id, message: 'Payment failed' };
        }
    }

    // Update order status
    async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order> {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
        });

        await prisma.orderStatusHistory.create({
            data: {
                orderId,
                status,
                note,
                createdBy: 'system',
            },
        });

        // Trigger email notifications based on status
        await this.triggerEmailNotification(orderId, status);

        return order;
    }

    // Create address helper
    async createAddress(userId: string, data: AddressData): Promise<Address> {
        // If setting as default, remove default from others
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        return prisma.address.create({
            data: {
                userId,
                label: data.label,
                fullName: data.fullName,
                phone: data.phone,
                street: data.street,
                building: data.building,
                floor: data.floor,
                apartment: data.apartment,
                city: data.city,
                governorate: data.governorate,
                postalCode: data.postalCode,
                lat: data.lat,
                lng: data.lng,
                isDefault: data.isDefault || false,
            },
        });
    }

    // Calculate shipping based on governorate
    calculateShipping(governorate: string): number {
        // Shipping rates in EGP
        const rates: Record<string, number> = {
            'Cairo': 50,
            'Giza': 50,
            'Alexandria': 70,
            'default': 100,
        };

        return rates[governorate] || rates['default'];
    }

    // Generate order number
    private generateOrderNumber(): string {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = uuidv4().split('-')[0].toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }

    // Create billing data for Paymob
    private createBillingData(address: Address) {
        const nameParts = address.fullName.split(' ');
        return {
            first_name: nameParts[0] || 'Customer',
            last_name: nameParts.slice(1).join(' ') || 'Customer',
            email: 'customer@example.com', // Should come from user
            phone_number: address.phone,
            street: address.street,
            building: address.building || 'N/A',
            floor: address.floor || 'N/A',
            apartment: address.apartment || 'N/A',
            city: address.city,
            state: address.governorate,
            country: 'EG',
            postal_code: address.postalCode || '00000',
        };
    }

    // Get checkout success data
    async getOrderConfirmation(orderId: string, trackingToken?: string): Promise<Order & { showConversionPrompt: boolean }> {
        const order = await prisma.order.findFirst({
            where: trackingToken
                ? { trackingToken }
                : { id: orderId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    include: {
                                        images: { take: 1 },
                                    },
                                },
                            },
                        },
                    },
                },
                user: true,
            },
        });

        if (!order) {
            throw new Error('Order not found');
        }

        const showConversionPrompt = order.user.role === 'GUEST';

        return { ...order, showConversionPrompt };
    }

    // Send order confirmation email
    private async sendOrderConfirmationEmail(orderId: string) {
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    items: true,
                    user: true,
                },
            });

            if (!order || !order.user.email) return;

            await emailService.sendOrderConfirmation({
                orderNumber: order.orderNumber,
                customerName: order.user.name || 'Customer',
                customerEmail: order.user.email,
                trackingToken: order.trackingToken,
                items: order.items.map((item) => ({
                    productName: item.productName,
                    variantName: item.variantName,
                    quantity: item.quantity,
                    price: Number(item.total),
                })),
                subtotal: Number(order.subtotal),
                discount: Number(order.discount),
                shippingFee: Number(order.shippingCost),
                total: Number(order.total),
                shippingAddress: {
                    street: order.shippingStreet,
                    city: order.shippingCity,
                    governorate: order.shippingGovernorate,
                },
            });
        } catch (error) {
            console.error('[CheckoutService] Failed to send confirmation email:', error);
        }
    }

    // Trigger email based on status change
    private async triggerEmailNotification(orderId: string, status: OrderStatus) {
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    items: true,
                    user: true,
                },
            });

            if (!order || !order.user.email) return;

            const orderData = {
                orderNumber: order.orderNumber,
                customerName: order.user.name || 'Customer',
                customerEmail: order.user.email,
                trackingToken: order.trackingToken,
                items: order.items.map((item) => ({
                    productName: item.productName,
                    variantName: item.variantName,
                    quantity: item.quantity,
                    price: Number(item.total),
                })),
                subtotal: Number(order.subtotal),
                discount: Number(order.discount),
                shippingFee: Number(order.shippingCost),
                total: Number(order.total),
                shippingAddress: {
                    street: order.shippingStreet,
                    city: order.shippingCity,
                    governorate: order.shippingGovernorate,
                },
                estimatedDelivery: '2-4 business days',
            };

            // Send appropriate email based on status
            switch (status) {
                case 'SHIPPED':
                    await emailService.sendOrderShipped(orderData);
                    break;
                case 'DELIVERED':
                    await emailService.sendOrderDelivered(orderData);
                    break;
                // PAID status handled by sendOrderConfirmationEmail
            }
        } catch (error) {
            console.error('[CheckoutService] Failed to send status email:', error);
        }
    }
}

export const checkoutService = new CheckoutService();
export default checkoutService;
