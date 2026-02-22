import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/product.service';

// Get product by slug
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const product = await productService.getProductBySlug(slug);

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Get related products
        const relatedProducts = await productService.getRelatedProducts(product.id);

        return NextResponse.json({
            success: true,
            data: {
                product,
                relatedProducts,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch product';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// Update product (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    // Check admin authentication
    const { requireAdmin } = await import('@/middleware/requireAdmin');
    const auth = await requireAdmin();
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const { slug } = await params;
        const body = await request.json();

        // Get product ID from slug
        const existingProduct = await productService.getProductBySlug(slug);
        if (!existingProduct) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        const product = await productService.updateProduct(existingProduct.id, body);

        return NextResponse.json({
            success: true,
            data: product,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update product';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}

// Delete product (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    // Check admin authentication
    const { requireAdmin } = await import('@/middleware/requireAdmin');
    const auth = await requireAdmin();
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const { slug } = await params;

        const existingProduct = await productService.getProductBySlug(slug);
        if (!existingProduct) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        await productService.deleteProduct(existingProduct.id);

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete product';
        return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
        );
    }
}
