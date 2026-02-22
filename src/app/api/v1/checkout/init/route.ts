import { NextRequest, NextResponse } from 'next/server';
import { checkoutService } from '@/services/checkout.service';
import { authService } from '@/services/auth.service';
import { cookies } from 'next/headers';

// Initialize checkout
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
                { success: false, error: 'Please login or continue as guest' },
                { status: 401 }
            );
        }

        const body = await request.json();
        console.log('[Checkout API] Init payload:', JSON.stringify(body, null, 2));

        const checkoutSession = await checkoutService.initializeCheckout(
            currentUserId,
            body,
            isGuest
        );

        return NextResponse.json({
            success: true,
            data: checkoutSession,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Checkout initialization failed';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}
