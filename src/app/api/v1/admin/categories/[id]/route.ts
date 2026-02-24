import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/requireAdmin';
import prisma from '@/lib/prisma';

// PATCH /api/v1/admin/categories/[id] — update category
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    try {
        const body = await request.json();

        const category = await prisma.category.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to update category';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
