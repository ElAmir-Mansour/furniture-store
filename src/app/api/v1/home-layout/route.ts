import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get home layout configuration (admin only - for editing)
export async function GET() {
    // Check admin authentication
    const { requireAdmin } = await import('@/middleware/requireAdmin');
    const auth = await requireAdmin();
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const layouts = await prisma.homeLayout.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });

        // Expand section data based on type
        const sections = await Promise.all(
            layouts.map(async (layout) => {
                let data = null;

                switch (layout.section) {
                    case 'hero':
                        data = layout.config;
                        break;

                    case 'category_carousel':
                        const config = layout.config as { categoryIds?: string[]; showAll?: boolean; limit?: number };
                        if (config.showAll) {
                            data = await prisma.category.findMany({
                                where: { isActive: true, parentId: null },
                                orderBy: { sortOrder: 'asc' },
                                take: config.limit || 10,
                            });
                        } else if (config.categoryIds) {
                            data = await prisma.category.findMany({
                                where: { id: { in: config.categoryIds }, isActive: true },
                            });
                        }
                        break;

                    case 'featured':
                        const featuredConfig = layout.config as { productIds?: string[]; categoryId?: string; limit?: number };
                        if (featuredConfig.productIds) {
                            data = await prisma.product.findMany({
                                where: { id: { in: featuredConfig.productIds }, isActive: true },
                                include: {
                                    images: { take: 1, orderBy: { isPrimary: 'desc' } },
                                    variants: { take: 1, where: { isActive: true } },
                                },
                            });
                        } else if (featuredConfig.categoryId) {
                            data = await prisma.product.findMany({
                                where: { categoryId: featuredConfig.categoryId, isActive: true },
                                include: {
                                    images: { take: 1, orderBy: { isPrimary: 'desc' } },
                                    variants: { take: 1, where: { isActive: true } },
                                },
                                take: featuredConfig.limit || 8,
                            });
                        } else {
                            data = await prisma.product.findMany({
                                where: { isActive: true, isFeatured: true },
                                include: {
                                    images: { take: 1, orderBy: { isPrimary: 'desc' } },
                                    variants: { take: 1, where: { isActive: true } },
                                },
                                take: featuredConfig.limit || 8,
                            });
                        }
                        break;

                    case 'products_grid':
                        const gridConfig = layout.config as { filter?: string; categoryId?: string; limit?: number };
                        const where: Record<string, unknown> = { isActive: true };

                        if (gridConfig.filter === 'sale') {
                            where.comparePrice = { not: null };
                        } else if (gridConfig.filter === 'category' && gridConfig.categoryId) {
                            where.categoryId = gridConfig.categoryId;
                        }

                        const orderBy = gridConfig.filter === 'popular'
                            ? { viewCount: 'desc' as const }
                            : { createdAt: 'desc' as const };

                        data = await prisma.product.findMany({
                            where,
                            include: {
                                images: { take: 1, orderBy: { isPrimary: 'desc' } },
                                variants: { take: 1, where: { isActive: true } },
                            },
                            orderBy,
                            take: gridConfig.limit || 12,
                        });
                        break;

                    case 'banner':
                        data = layout.config;
                        break;
                }

                return {
                    id: layout.id,
                    section: layout.section,
                    title: layout.title,
                    titleAr: layout.titleAr,
                    data,
                    sortOrder: layout.sortOrder,
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: { sections },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch home layout';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
