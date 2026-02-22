import prisma from '@/lib/prisma';
import { Order, OrderStatus } from '@prisma/client';
import { OrderWithDetails, OrderFilters, PaginatedResponse } from '@/types';

export class OrderService {
    // Get user orders
    async getUserOrders(
        userId: string,
        filters: OrderFilters = {},
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<OrderWithDetails>> {
        const where: Record<string, unknown> = { userId };

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                (where.createdAt as Record<string, unknown>).gte = filters.startDate;
            }
            if (filters.endDate) {
                (where.createdAt as Record<string, unknown>).lte = filters.endDate;
            }
        }

        const [items, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                    user: { select: { id: true, name: true, email: true } },
                    promoCode: true,
                    statusHistory: {
                        orderBy: { createdAt: 'desc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.order.count({ where }),
        ]);

        return {
            items: items as unknown as OrderWithDetails[],
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    // Get order by ID
    async getOrderById(orderId: string, userId?: string): Promise<OrderWithDetails | null> {
        const where: Record<string, unknown> = { id: orderId };

        if (userId) {
            where.userId = userId;
        }

        return prisma.order.findFirst({
            where,
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    include: {
                                        images: { take: 1 },
                                    },
                                },
                            },
                        },
                    },
                },
                user: { select: { id: true, name: true, email: true } },
                promoCode: true,
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        }) as unknown as Promise<OrderWithDetails | null>;
    }

    // Get order by tracking token (public)
    async getOrderByTrackingToken(token: string): Promise<OrderWithDetails | null> {
        return prisma.order.findUnique({
            where: { trackingToken: token },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    include: {
                                        images: { take: 1 },
                                    },
                                },
                            },
                        },
                    },
                },
                user: { select: { id: true, name: true, email: true } },
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        }) as unknown as Promise<OrderWithDetails | null>;
    }

    // Update order status (admin)
    async updateStatus(
        orderId: string,
        status: OrderStatus,
        note?: string,
        adminId?: string
    ): Promise<Order> {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
            },
        });

        await prisma.orderStatusHistory.create({
            data: {
                orderId,
                status,
                note,
                createdBy: adminId || 'admin',
            },
        });

        return order;
    }

    // Add tracking info
    async addTrackingInfo(
        orderId: string,
        trackingNumber: string,
        trackingUrl?: string,
        estimatedDelivery?: Date
    ): Promise<Order> {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                trackingNumber,
                trackingUrl,
                estimatedDelivery,
                status: 'SHIPPED',
            },
        });

        await prisma.orderStatusHistory.create({
            data: {
                orderId,
                status: 'SHIPPED',
                note: `Tracking number: ${trackingNumber}`,
            },
        });

        return order;
    }

    // Cancel order
    async cancelOrder(orderId: string, userId: string, reason?: string): Promise<Order> {
        const order = await prisma.order.findFirst({
            where: { id: orderId, userId },
        });

        if (!order) {
            throw new Error('Order not found');
        }

        // Can only cancel if PENDING or PAID
        if (!['PENDING', 'PAID'].includes(order.status)) {
            throw new Error('Cannot cancel order at this stage');
        }

        return this.updateStatus(orderId, 'CANCELLED', reason || 'Cancelled by customer', userId);
    }

    // Get order statistics (admin)
    async getOrderStats() {
        const [
            totalOrders,
            pendingOrders,
            processingOrders,
            deliveredOrders,
            totalRevenue,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'PROCESSING' } }),
            prisma.order.count({ where: { status: 'DELIVERED' } }),
            prisma.order.aggregate({
                where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
                _sum: { total: true },
            }),
        ]);

        return {
            totalOrders,
            pendingOrders,
            processingOrders,
            deliveredOrders,
            totalRevenue: Number(totalRevenue._sum.total) || 0,
        };
    }

    // Get recent orders (admin)
    async getRecentOrders(limit: number = 10): Promise<OrderWithDetails[]> {
        return prisma.order.findMany({
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
                user: { select: { id: true, name: true, email: true } },
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        }) as unknown as Promise<OrderWithDetails[]>;
    }

    // Get all orders (admin)
    async getAllOrders(
        filters: OrderFilters & { search?: string } = {},
        page: number = 1,
        pageSize: number = 20
    ): Promise<PaginatedResponse<OrderWithDetails>> {
        const where: Record<string, unknown> = {};

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                (where.createdAt as Record<string, unknown>).gte = filters.startDate;
            }
            if (filters.endDate) {
                (where.createdAt as Record<string, unknown>).lte = filters.endDate;
            }
        }

        if (filters.search) {
            where.OR = [
                { orderNumber: { contains: filters.search, mode: 'insensitive' } },
                { shippingName: { contains: filters.search, mode: 'insensitive' } },
                { shippingPhone: { contains: filters.search } },
            ];
        }

        const [items, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: true,
                    user: { select: { id: true, name: true, email: true } },
                    statusHistory: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.order.count({ where }),
        ]);

        return {
            items: items as unknown as OrderWithDetails[],
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
}

export const orderService = new OrderService();
export default orderService;
