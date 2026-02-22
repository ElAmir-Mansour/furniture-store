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

    // Create new guest session
    const session = await authService.createGuestSession();
    cookieStore.set('guestUuid', session.guestUuid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
    });

    return { userId: session.userId, isGuest: true };
}

// Get cart
export async function GET() {
    try {
        const { userId, isGuest } = await getUserContext();
        const cart = await cartService.getCart(userId, isGuest);

        return NextResponse.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch cart';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// Add to cart
export async function POST(request: NextRequest) {
    try {
        const { userId, isGuest } = await getUserContext();
        const body = await request.json();

        const { variantId, quantity = 1 } = body;

        if (!variantId) {
            return NextResponse.json(
                { success: false, error: 'Variant ID is required' },
                { status: 400 }
            );
        }

        const cart = await cartService.addToCart(userId, { variantId, quantity }, isGuest);

        return NextResponse.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add to cart';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}

// Clear cart
export async function DELETE() {
    try {
        const { userId, isGuest } = await getUserContext();
        await cartService.clearCart(userId, isGuest);

        return NextResponse.json({
            success: true,
            message: 'Cart cleared',
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to clear cart';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
