import { NextRequest, NextResponse } from 'next/server';
import { cartService } from '@/services/cart.service';
import { authService } from '@/services/auth.service';
import { cookies } from 'next/headers';

// Helper to get user context
async function getUserContext() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    const guestUuid = cookieStore.get('guestUuid')?.value;

    if (userId) {
        return { userId, isGuest: false };
    }

    if (guestUuid) {
        const guestUser = await authService.getOrCreateGuestUser(guestUuid);
        return { userId: guestUser.id, isGuest: true };
    }

    throw new Error('No session found');
}

// Update cart item quantity
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ variantId: string }> }
) {
    try {
        const { variantId } = await params;
        const { userId, isGuest } = await getUserContext();
        const body = await request.json();

        const { quantity } = body;

        if (quantity === undefined) {
            return NextResponse.json(
                { success: false, error: 'Quantity is required' },
                { status: 400 }
            );
        }

        const cart = await cartService.updateCartItem(userId, variantId, quantity, isGuest);

        return NextResponse.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update cart';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}

// Remove item from cart
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ variantId: string }> }
) {
    try {
        const { variantId } = await params;
        const { userId, isGuest } = await getUserContext();

        const cart = await cartService.removeFromCart(userId, variantId, isGuest);

        return NextResponse.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to remove from cart';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}
