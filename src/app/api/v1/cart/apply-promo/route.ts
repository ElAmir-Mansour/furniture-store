import { NextRequest, NextResponse } from 'next/server';
import { promoService } from '@/services/promo.service';
import { cartService } from '@/services/cart.service';
import { authService } from '@/services/auth.service';
import { cookies } from 'next/headers';

// Apply promo code
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;
        const guestUuid = cookieStore.get('guestUuid')?.value;

        let currentUserId: string | undefined;
        let isGuest = false;

        if (userId) {
            currentUserId = userId;
        } else if (guestUuid) {
            const guestUser = await authService.getOrCreateGuestUser(guestUuid);
            currentUserId = guestUser.id;
            isGuest = true;
        }

        if (!currentUserId) {
            return NextResponse.json(
                { success: false, error: 'No session found' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Promo code is required' },
                { status: 400 }
            );
        }

        // Get current cart
        const cart = await cartService.getCart(currentUserId, isGuest);

        if (cart.items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Your cart is empty' },
                { status: 400 }
            );
        }

        // Validate promo code
        const result = await promoService.validatePromoCode(code, cart, currentUserId);

        return NextResponse.json({
            success: result.valid,
            data: result.valid ? {
                discount: result.discount,
                message: result.message,
                code: {
                    code: result.code?.code,
                    discountType: result.code?.discountType,
                    discountValue: result.code?.discountValue,
                },
            } : undefined,
            error: result.valid ? undefined : result.message,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to apply promo code';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}
