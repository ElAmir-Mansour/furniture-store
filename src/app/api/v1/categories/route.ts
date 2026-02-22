import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get all categories (with optional hierarchy)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const flat = searchParams.get('flat') === 'true';

        if (flat) {
            // Return flat list
            const categories = await prisma.category.findMany({
                where: { isActive: true },
                orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
            });

            return NextResponse.json({
                success: true,
                data: categories,
            });
        }

        // Return hierarchical structure
        const categories = await prisma.category.findMany({
            where: { isActive: true, parentId: null },
            include: {
                children: {
                    where: { isActive: true },
                    include: {
                        children: {
                            where: { isActive: true },
                        },
                    },
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch categories';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// Create category (admin only)
export async function POST(request: NextRequest) {
    // Check admin authentication
    const { requireAdmin } = await import('@/middleware/requireAdmin');
    const auth = await requireAdmin();
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const body = await request.json();
        const { name, nameAr, slug, description, image, parentId, sortOrder } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { success: false, error: 'Name and slug are required' },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                name,
                nameAr,
                slug,
                description,
                image,
                parentId,
                sortOrder: sortOrder || 0,
            },
        });

        return NextResponse.json({
            success: true,
            data: category,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create category';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}
