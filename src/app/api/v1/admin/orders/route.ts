import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/requireAdmin';
import { orderService } from '@/services/order.service';

// GET /api/v1/admin/orders — all orders with optional status filter
export async function GET(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    try {
        const sp = request.nextUrl.searchParams;
        const status = sp.get('status') as Parameters<typeof orderService.getAllOrders>[0]['status'] | null;
        const search = sp.get('search') || undefined;
        const page = Number(sp.get('page')) || 1;
        const pageSize = Number(sp.get('pageSize')) || 50;

        const result = await orderService.getAllOrders(
            { ...(status ? { status } : {}), search },
            page,
            pageSize
        );

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to fetch orders';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
