import prisma from '@/lib/prisma';
import { redis, cartHelpers } from '@/lib/redis';
import { Cart, CartItemWithDetails, AddToCartRequest } from '@/types';
import { Prisma } from '@prisma/client';

export class CartService {
    // Get cart for user (from database or Redis for guests)
    async getCart(userId: string, isGuest: boolean = false): Promise<Cart> {
        if (isGuest) {
            return this.getGuestCart(userId);
        }
        return this.getDatabaseCart(userId);
    }

    // Get cart from database (for registered users)
    private async getDatabaseCart(userId: string): Promise<Cart> {
        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: {
                variant: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    take: 1,
                                    orderBy: { isPrimary: 'desc' },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const items: CartItemWithDetails[] = cartItems.map((item) => ({
            id: item.id,
            variantId: item.variantId,
            quantity: item.quantity,
            variant: item.variant,
            itemTotal: Number(item.variant.product.price) + Number(item.variant.priceAdj) * item.quantity,
        }));

        const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return { items, subtotal, itemCount };
    }

    // Get cart from Redis (for guests)
    private async getGuestCart(userId: string): Promise<Cart> {
        const redisCart = await cartHelpers.getCart(userId);

        if (Object.keys(redisCart).length === 0) {
            return { items: [], subtotal: 0, itemCount: 0 };
        }

        const variantIds = Object.keys(redisCart);

        const variants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds }, isActive: true },
            include: {
                product: {
                    include: {
                        images: {
                            take: 1,
                            orderBy: { isPrimary: 'desc' },
                        },
                    },
                },
            },
        });

        const items: CartItemWithDetails[] = variants.map((variant) => {
            const quantity = redisCart[variant.id];
            return {
                id: `guest-${variant.id}`,
                variantId: variant.id,
                quantity,
                variant,
                itemTotal: (Number(variant.product.price) + Number(variant.priceAdj)) * quantity,
            };
        });

        const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return { items, subtotal, itemCount };
    }

    // Add item to cart
    async addToCart(userId: string, data: AddToCartRequest, isGuest: boolean = false): Promise<Cart> {
        // Validate variant exists and has stock
        const variant = await prisma.productVariant.findUnique({
            where: { id: data.variantId },
        });

        if (!variant || !variant.isActive) {
            throw new Error('Product variant not found');
        }

        if (variant.stock < data.quantity) {
            throw new Error('Insufficient stock');
        }

        if (isGuest) {
            await cartHelpers.addToCart(userId, data.variantId, data.quantity);
            await cartHelpers.setCartExpiry(userId);
        } else {
            await prisma.cartItem.upsert({
                where: {
                    userId_variantId: { userId, variantId: data.variantId },
                },
                update: {
                    quantity: { increment: data.quantity },
                },
                create: {
                    userId,
                    variantId: data.variantId,
                    quantity: data.quantity,
                },
            });
        }

        return this.getCart(userId, isGuest);
    }

    // Update cart item quantity
    async updateCartItem(
        userId: string,
        variantId: string,
        quantity: number,
        isGuest: boolean = false
    ): Promise<Cart> {
        if (quantity <= 0) {
            return this.removeFromCart(userId, variantId, isGuest);
        }

        // Validate stock
        const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
        });

        if (!variant) {
            throw new Error('Product variant not found');
        }

        if (variant.stock < quantity) {
            throw new Error('Insufficient stock');
        }

        if (isGuest) {
            await cartHelpers.setCartItem(userId, variantId, quantity);
        } else {
            await prisma.cartItem.update({
                where: {
                    userId_variantId: { userId, variantId },
                },
                data: { quantity },
            });
        }

        return this.getCart(userId, isGuest);
    }

    // Remove item from cart
    async removeFromCart(userId: string, variantId: string, isGuest: boolean = false): Promise<Cart> {
        if (isGuest) {
            await cartHelpers.removeFromCart(userId, variantId);
        } else {
            await prisma.cartItem.delete({
                where: {
                    userId_variantId: { userId, variantId },
                },
            });
        }

        return this.getCart(userId, isGuest);
    }

    // Clear entire cart
    async clearCart(userId: string, isGuest: boolean = false): Promise<void> {
        if (isGuest) {
            await cartHelpers.clearCart(userId);
        } else {
            await prisma.cartItem.deleteMany({
                where: { userId },
            });
        }
    }

    // Validate cart items (check stock, remove unavailable)
    async validateCart(userId: string, isGuest: boolean = false): Promise<{
        valid: boolean;
        cart: Cart;
        removedItems: string[];
    }> {
        const cart = await this.getCart(userId, isGuest);
        const removedItems: string[] = [];

        for (const item of cart.items) {
            const variant = await prisma.productVariant.findUnique({
                where: { id: item.variantId },
            });

            if (!variant || !variant.isActive || variant.stock < item.quantity) {
                await this.removeFromCart(userId, item.variantId, isGuest);
                removedItems.push(item.variant.product.name);
            }
        }

        const updatedCart = await this.getCart(userId, isGuest);

        return {
            valid: removedItems.length === 0,
            cart: updatedCart,
            removedItems,
        };
    }

    // Transfer guest cart to user cart (on login)
    async transferGuestCart(guestId: string, userId: string): Promise<void> {
        const guestCart = await cartHelpers.getCart(guestId);

        for (const [variantId, quantity] of Object.entries(guestCart)) {
            await prisma.cartItem.upsert({
                where: {
                    userId_variantId: { userId, variantId },
                },
                update: {
                    quantity: { increment: quantity },
                },
                create: {
                    userId,
                    variantId,
                    quantity,
                },
            });
        }

        await cartHelpers.clearCart(guestId);
    }

    // Get cart count
    async getCartCount(userId: string, isGuest: boolean = false): Promise<number> {
        if (isGuest) {
            const cart = await cartHelpers.getCart(userId);
            return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
        }

        const result = await prisma.cartItem.aggregate({
            where: { userId },
            _sum: { quantity: true },
        });

        return result._sum.quantity || 0;
    }
}

export const cartService = new CartService();
export default cartService;
