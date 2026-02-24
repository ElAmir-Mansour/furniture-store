import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/requireAdmin';
import { orderService } from '@/services/order.service';
import prisma from '@/lib/prisma';

export async function GET() {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [stats, recentOrders, lowStock] = await Promise.all([
            orderService.getOrderStats(),
            orderService.getRecentOrders(5),
            prisma.productVariant.count({ where: { stock: { lt: 10, gt: 0 } } }),
        ]);

        // Today's revenue
        const todayRevenue = await prisma.order.aggregate({
            where: {
                createdAt: { gte: startOfDay },
                status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
            },
            _sum: { total: true },
        });

        // Today's order count
        const todayOrders = await prisma.order.count({
            where: { createdAt: { gte: startOfDay } },
        });

        return NextResponse.json({
            success: true,
            data: {
                todayOrders,
                todayRevenue: Number(todayRevenue._sum.total) || 0,
                pendingOrders: stats.pendingOrders,
                totalRevenue: stats.totalRevenue,
                lowStockItems: lowStock,
                recentOrders,
            },
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
