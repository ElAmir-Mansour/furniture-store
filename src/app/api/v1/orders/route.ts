import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/order.service';
import { cookies } from 'next/headers';

// Get user orders
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Please login to view orders' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const page = Number(searchParams.get('page')) || 1;
        const pageSize = Number(searchParams.get('pageSize')) || 10;
        const status = searchParams.get('status') as any;

        const orders = await orderService.getUserOrders(
            userId,
            { status },
            page,
            pageSize
        );

        return NextResponse.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch orders';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
