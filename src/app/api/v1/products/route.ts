import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/product.service';
import { ProductFilters } from '@/types';

// Get products with filters
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const filters: ProductFilters = {
            categoryId: searchParams.get('categoryId') || undefined,
            minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
            maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
            material: searchParams.get('material') || undefined,
            search: searchParams.get('search') || undefined,
            sortBy: (searchParams.get('sortBy') as ProductFilters['sortBy']) || undefined,
        };

        const tags = searchParams.get('tags');
        if (tags) {
            filters.tags = tags.split(',');
        }

        const page = Number(searchParams.get('page')) || 1;
        const pageSize = Number(searchParams.get('pageSize')) || 12;

        const result = await productService.getProducts(filters, page, pageSize);

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch products';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// Create product (admin only)
export async function POST(request: NextRequest) {
    // Check admin authentication
    const { requireAdmin } = await import('@/middleware/requireAdmin');
    const auth = await requireAdmin();
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const body = await request.json();

        const product = await productService.createProduct(body);

        return NextResponse.json({
            success: true,
            data: product,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create product';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}
