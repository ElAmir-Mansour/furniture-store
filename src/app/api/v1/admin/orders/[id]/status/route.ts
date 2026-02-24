import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/requireAdmin';
import { orderService } from '@/services/order.service';
import { OrderStatus } from '@prisma/client';

// PATCH /api/v1/admin/orders/[id]/status — update order status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    try {
        const body = await request.json();
        const { status, note } = body as { status: OrderStatus; note?: string };

        if (!status) {
            return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
        }

        const order = await orderService.updateStatus(id, status, note, 'admin');

        return NextResponse.json({ success: true, data: order });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to update order status';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
