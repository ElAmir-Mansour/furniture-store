import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/requireAdmin';
import prisma from '@/lib/prisma';

// PATCH /api/v1/admin/promos/[id] — toggle active state or update
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    try {
        const body = await request.json();

        const promo = await prisma.promoCode.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({ success: true, data: promo });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to update promo code';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}

// DELETE /api/v1/admin/promos/[id] — delete promo code
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    try {
        await prisma.promoCode.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to delete promo code';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
