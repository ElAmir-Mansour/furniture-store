import prisma from '@/lib/prisma';
import { PromoCode, DiscountType } from '@prisma/client';
import { ValidatePromoResult, CreatePromoCodeRequest, Cart } from '@/types';

export class PromoService {
    // Validate promo code against cart
    async validatePromoCode(
        code: string,
        cart: Cart,
        userId?: string
    ): Promise<ValidatePromoResult> {
        const promoCode = await prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!promoCode) {
            return { valid: false, message: 'Invalid promo code' };
        }

        // Check if active
        if (!promoCode.isActive) {
            return { valid: false, message: 'This promo code is no longer active' };
        }

        // Check expiry
        if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
            return { valid: false, message: 'This promo code has expired' };
        }

        // Check start date
        if (promoCode.startsAt > new Date()) {
            return { valid: false, message: 'This promo code is not yet active' };
        }

        // Check usage limit
        if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
            return { valid: false, message: 'This promo code has reached its usage limit' };
        }

        // Check per-user limit
        if (userId && promoCode.maxUsesPerUser) {
            const userUsage = await prisma.order.count({
                where: {
                    userId,
                    promoCodeId: promoCode.id,
                    status: { not: 'CANCELLED' },
                },
            });

            if (userUsage >= promoCode.maxUsesPerUser) {
                return { valid: false, message: 'You have already used this promo code' };
            }
        }

        // Check minimum cart value
        if (promoCode.minCartValue && cart.subtotal < Number(promoCode.minCartValue)) {
            return {
                valid: false,
                message: `Minimum order amount is ${promoCode.minCartValue} EGP`,
            };
        }

        // Check excluded categories
        if (promoCode.excludedCategories.length > 0) {
            // Get category IDs from cart items
            const cartCategoryIds = await this.getCartCategoryIds(cart);
            const allExcluded = cartCategoryIds.every((catId) =>
                promoCode.excludedCategories.includes(catId)
            );

            if (allExcluded) {
                return {
                    valid: false,
                    message: 'This promo code is not valid for items in your cart',
                };
            }
        }

        // Check excluded products
        if (promoCode.excludedProducts.length > 0) {
            const cartProductIds = cart.items.map((item) => item.variant.product.id);
            const allExcluded = cartProductIds.every((prodId) =>
                promoCode.excludedProducts.includes(prodId)
            );

            if (allExcluded) {
                return {
                    valid: false,
                    message: 'This promo code is not valid for items in your cart',
                };
            }
        }

        // Calculate discount
        const discount = this.calculateDiscount(promoCode, cart.subtotal);

        return {
            valid: true,
            code: promoCode,
            discount,
            message: `Promo code applied! You save ${discount.toFixed(2)} EGP`,
        };
    }

    // Calculate discount amount
    calculateDiscount(promoCode: PromoCode, subtotal: number): number {
        let discount: number;

        if (promoCode.discountType === 'PERCENT') {
            discount = (subtotal * Number(promoCode.discountValue)) / 100;

            // Apply max discount cap
            if (promoCode.maxDiscountAmount) {
                discount = Math.min(discount, Number(promoCode.maxDiscountAmount));
            }
        } else {
            // FIXED discount
            discount = Number(promoCode.discountValue);
        }

        // Don't exceed subtotal
        return Math.min(discount, subtotal);
    }

    // Get category IDs from cart items
    private async getCartCategoryIds(cart: Cart): Promise<string[]> {
        const productIds = cart.items.map((item) => item.variant.product.id);

        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { categoryId: true },
        });

        return [...new Set(products.map((p) => p.categoryId))];
    }

    // Create promo code
    async createPromoCode(data: CreatePromoCodeRequest): Promise<PromoCode> {
        return prisma.promoCode.create({
            data: {
                code: data.code.toUpperCase(),
                description: data.description,
                discountType: data.discountType,
                discountValue: data.discountValue,
                minCartValue: data.minCartValue,
                maxDiscountAmount: data.maxDiscountAmount,
                maxUses: data.maxUses,
                maxUsesPerUser: data.maxUsesPerUser || 1,
                excludedCategories: data.excludedCategories || [],
                excludedProducts: data.excludedProducts || [],
                startsAt: data.startsAt || new Date(),
                expiresAt: data.expiresAt,
            },
        });
    }

    // Increment promo code usage
    async incrementUsage(promoCodeId: string): Promise<void> {
        await prisma.promoCode.update({
            where: { id: promoCodeId },
            data: { currentUses: { increment: 1 } },
        });
    }

    // Get promo code by code
    async getPromoCodeByCode(code: string): Promise<PromoCode | null> {
        return prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() },
        });
    }

    // List all promo codes (admin)
    async listPromoCodes(activeOnly: boolean = false) {
        const where = activeOnly ? { isActive: true } : {};

        return prisma.promoCode.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    // Deactivate promo code
    async deactivatePromoCode(id: string): Promise<PromoCode> {
        return prisma.promoCode.update({
            where: { id },
            data: { isActive: false },
        });
    }
}

export const promoService = new PromoService();
export default promoService;
