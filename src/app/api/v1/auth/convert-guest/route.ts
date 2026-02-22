import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { cookies } from 'next/headers';

// Convert guest to registered user (Lazy Registration)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const guestUuid = cookieStore.get('guestUuid')?.value;
        const userId = cookieStore.get('userId')?.value;

        // Check if there's a guest session
        if (!guestUuid && !userId) {
            return NextResponse.json(
                { success: false, error: 'No guest session found' },
                { status: 400 }
            );
        }

        // If already logged in, check if user is a guest
        if (userId) {
            const existingUser = await authService.getUserById(userId);
            if (existingUser && existingUser.role !== 'GUEST') {
                return NextResponse.json(
                    { success: false, error: 'User is already registered' },
                    { status: 400 }
                );
            }
        }

        const targetGuestUuid = guestUuid || (await authService.getUserById(userId!))?.guestUuid;

        if (!targetGuestUuid) {
            return NextResponse.json(
                { success: false, error: 'Invalid guest session' },
                { status: 400 }
            );
        }

        const user = await authService.convertGuestToUser(targetGuestUuid, { email, password, name });

        // Clear guest cookie and set user cookie
        cookieStore.delete('guestUuid');
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
                message: 'Account created successfully',
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Conversion failed';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}
