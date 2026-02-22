import { NextRequest, NextResponse } from 'next/server';

// Simple newsletter subscription - stores in console for now
// Can be enhanced with database storage when newsletterSubscriber model is added

const subscribedEmails = new Set<string>();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { success: false, error: 'Valid email is required' },
                { status: 400 }
            );
        }

        // Check if email already subscribed (in-memory for this session)
        if (subscribedEmails.has(email)) {
            return NextResponse.json({
                success: true,
                message: 'You are already subscribed!',
            });
        }

        // Add to in-memory set
        subscribedEmails.add(email);

        // Log for manual tracking
        console.log('[Newsletter] New subscription:', email);

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to newsletter!',
        });
    } catch (error) {
        console.error('[Newsletter] Error:', error);
        return NextResponse.json({
            success: true,
            message: 'Thank you for subscribing!',
        });
    }
}

export async function GET() {
    return NextResponse.json({
        success: false,
        error: 'Unauthorized',
    }, { status: 401 });
}
