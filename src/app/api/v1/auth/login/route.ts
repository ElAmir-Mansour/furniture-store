import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { cartService } from '@/services/cart.service';
import { cookies } from 'next/headers';

// Login user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await authService.login(email, password);

        // Check for guest cart and transfer
        const cookieStore = await cookies();
        const guestUuid = cookieStore.get('guestUuid')?.value;

        if (guestUuid) {
            const guestUser = await authService.getOrCreateGuestUser(guestUuid);
            await cartService.transferGuestCart(guestUser.id, user.id);
            cookieStore.delete('guestUuid');
        }

        // Set auth cookie
        cookieStore.set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return NextResponse.json({
            success: true,
            data: {
                user: authService.toAuthUser(user),
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        return NextResponse.json(
            { success: false, error: message },
            { status: 401 }
        );
    }
}
