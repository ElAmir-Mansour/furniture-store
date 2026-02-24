import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/requireAdmin';
import { promoService } from '@/services/promo.service';

// GET /api/v1/admin/promos — list all promo codes
export async function GET() {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    try {
        const promos = await promoService.listPromoCodes(false);
        return NextResponse.json({ success: true, data: promos });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to fetch promos';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}

// POST /api/v1/admin/promos — create a new promo code
export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    try {
        const body = await request.json();

        const { code, description, discountType, discountValue, minCartValue, maxDiscountAmount, maxUses, startsAt, expiresAt } = body;

        if (!code || !discountType || discountValue === undefined) {
            return NextResponse.json(
                { success: false, error: 'Code, discountType, and discountValue are required' },
                { status: 400 }
            );
        }

        const promo = await promoService.createPromoCode({
            code,
            description: description || '',
            discountType,
            discountValue: Number(discountValue),
            minCartValue: minCartValue ? Number(minCartValue) : undefined,
            maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
            maxUses: maxUses ? Number(maxUses) : undefined,
            startsAt: startsAt ? new Date(startsAt) : new Date(),
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        });

        return NextResponse.json({ success: true, data: promo }, { status: 201 });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to create promo code';
        return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
}
