import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/order.service';

// Get order by tracking token (public)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const order = await orderService.getOrderByTrackingToken(token);

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Return limited public info
        return NextResponse.json({
            success: true,
            data: {
                orderNumber: order.orderNumber,
                status: order.status,
                createdAt: order.createdAt,
                total: order.total,
                shippingCity: order.shippingCity,
                shippingGovernorate: order.shippingGovernorate,
                trackingNumber: order.trackingNumber,
                trackingUrl: order.trackingUrl,
                estimatedDelivery: order.estimatedDelivery,
                deliveredAt: order.deliveredAt,
                statusHistory: order.statusHistory,
                items: order.items.map(item => ({
                    productName: item.productName,
                    variantName: item.variantName,
                    quantity: item.quantity,
                })),
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch order';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
