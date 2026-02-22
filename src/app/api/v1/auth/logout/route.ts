import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Logout user
export async function POST() {
    try {
        const cookieStore = await cookies();

        // Clear both cookies
        cookieStore.delete('userId');
        cookieStore.delete('guestUuid');

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Logout failed' },
            { status: 500 }
        );
    }
}
