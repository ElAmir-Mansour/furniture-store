import { NextRequest, NextResponse } from 'next/server';
import { checkoutService } from '@/services/checkout.service';

// Paymob payment callback
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const hmac = request.headers.get('hmac') || body.hmac || '';

        const result = await checkoutService.processPaymentCallback(body, hmac);

        if (result.success) {
            return NextResponse.json({
                success: true,
                data: {
                    orderId: result.orderId,
                    message: result.message,
                },
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.message,
                orderId: result.orderId,
            });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Payment processing failed';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}

// Handle GET for redirect-based callbacks
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const success = searchParams.get('success') === 'true';
    const orderId = searchParams.get('order') || searchParams.get('merchant_order_id');

    // Redirect to appropriate page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (success && orderId) {
        return NextResponse.redirect(`${baseUrl}/checkout/success?orderId=${orderId}`);
    } else {
        return NextResponse.redirect(`${baseUrl}/checkout/failed?orderId=${orderId}`);
    }
}
