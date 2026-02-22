import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * Middleware to require admin authentication for API routes
 * Returns the session if user is admin, otherwise returns error response
 */
export async function requireAdmin() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return {
            authorized: false as const,
            response: NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            ),
        };
    }

    const user = session.user as { id: string; role: string };

    if (user.role !== 'ADMIN') {
        return {
            authorized: false as const,
            response: NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            ),
        };
    }

    return {
        authorized: true as const,
        session,
        userId: user.id,
    };
}
