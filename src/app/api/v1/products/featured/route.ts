import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/product.service';

// Get featured products
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = Number(searchParams.get('limit')) || 8;

        const products = await productService.getFeaturedProducts(limit);

        return NextResponse.json({
            success: true,
            data: products,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch featured products';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
