import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Register new user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, phone } = body;

        if (!email || !password || !name) {
            return NextResponse.json(
                { success: false, error: 'Email, password and name are required' },
                { status: 400 }
            );
        }

        const user = await authService.register({ email, password, name, phone });

        // Set auth cookie
        const cookieStore = await cookies();
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
        const message = error instanceof Error ? error.message : 'Registration failed';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}
