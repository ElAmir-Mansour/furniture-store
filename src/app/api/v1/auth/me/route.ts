import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Get current user / Create guest session
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;
        const guestUuid = cookieStore.get('guestUuid')?.value;

        // If logged in
        if (userId) {
            const user = await authService.getUserById(userId);
            if (user) {
                return NextResponse.json({
                    success: true,
                    data: {
                        user: authService.toAuthUser(user),
                        isGuest: false,
                    },
                });
            }
        }

        // If guest session exists
        if (guestUuid) {
            const guestUser = await authService.getOrCreateGuestUser(guestUuid);
            return NextResponse.json({
                success: true,
                data: {
                    user: authService.toAuthUser(guestUser),
                    isGuest: true,
                },
            });
        }

        // Create new guest session
        const guestSession = await authService.createGuestSession();

        cookieStore.set('guestUuid', guestSession.guestUuid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        const user = await authService.getUserById(guestSession.userId);

        return NextResponse.json({
            success: true,
            data: {
                user: user ? authService.toAuthUser(user) : null,
                isGuest: true,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get session';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
