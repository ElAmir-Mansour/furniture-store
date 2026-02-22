import prisma from '@/lib/prisma';
import { Product, ProductVariant, Prisma } from '@prisma/client';
import {
    ProductWithDetails,
    CreateProductRequest,
    ProductFilters,
    PaginatedResponse
} from '@/types';
import slugify from 'slugify';

export class ProductService {
    // Create a new product
    async createProduct(data: CreateProductRequest): Promise<Product> {
        const slug = slugify(data.name, { lower: true, strict: true });

        // Check for duplicate slug
        const existing = await prisma.product.findUnique({
            where: { slug },
        });

        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        return prisma.product.create({
            data: {
                name: data.name,
                nameAr: data.nameAr,
                slug: finalSlug,
                description: data.description,
                descriptionAr: data.descriptionAr,
                price: data.price,
                comparePrice: data.comparePrice,
                dimensions: data.dimensions as unknown as Prisma.InputJsonValue,
                weight: data.weight,
                material: data.material,
                categoryId: data.categoryId,
                tags: data.tags || [],
                isFeatured: data.isFeatured || false,
            },
        });
    }

    // Get product by slug with full details
    async getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
        const product = await prisma.product.findUnique({
            where: { slug, isActive: true },
            include: {
                category: true,
                images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                },
                variants: {
                    where: { isActive: true },
                    orderBy: { name: 'asc' },
                },
            },
        });

        if (product) {
            // Increment view count
            await prisma.product.update({
                where: { id: product.id },
                data: { viewCount: { increment: 1 } },
            });
        }

        return product as ProductWithDetails | null;
    }

    // Get product by ID
    async getProductById(id: string): Promise<ProductWithDetails | null> {
        return prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                },
                variants: {
                    where: { isActive: true },
                },
            },
        }) as Promise<ProductWithDetails | null>;
    }

    // Get products with filters and pagination
    async getProducts(
        filters: ProductFilters,
        page: number = 1,
        pageSize: number = 12
    ): Promise<PaginatedResponse<ProductWithDetails>> {
        const where: Prisma.ProductWhereInput = {
            isActive: true,
        };

        // Apply filters
        if (filters.categoryId) {
            // Include subcategories
            const categoryIds = await this.getCategoryAndChildren(filters.categoryId);
            where.categoryId = { in: categoryIds };
        }

        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.price = {};
            if (filters.minPrice !== undefined) {
                where.price.gte = filters.minPrice;
            }
            if (filters.maxPrice !== undefined) {
                where.price.lte = filters.maxPrice;
            }
        }

        if (filters.material) {
            where.material = filters.material;
        }

        if (filters.tags && filters.tags.length > 0) {
            where.tags = { hasSome: filters.tags };
        }

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { nameAr: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        // Determine sort order
        let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

        switch (filters.sortBy) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
            case 'popular':
                orderBy = { viewCount: 'desc' };
                break;
        }

        const [items, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    images: {
                        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                        take: 1,
                    },
                    variants: {
                        where: { isActive: true },
                        take: 1,
                    },
                },
                orderBy,
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.product.count({ where }),
        ]);

        return {
            items: items as ProductWithDetails[],
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    // Get featured products
    async getFeaturedProducts(limit: number = 8): Promise<ProductWithDetails[]> {
        return prisma.product.findMany({
            where: { isActive: true, isFeatured: true },
            include: {
                category: true,
                images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                    take: 2,
                },
                variants: {
                    where: { isActive: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        }) as Promise<ProductWithDetails[]>;
    }

    // Get new arrivals
    async getNewArrivals(limit: number = 8): Promise<ProductWithDetails[]> {
        return prisma.product.findMany({
            where: { isActive: true },
            include: {
                category: true,
                images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                    take: 2,
                },
                variants: {
                    where: { isActive: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        }) as Promise<ProductWithDetails[]>;
    }

    // Get products by category
    async getProductsByCategory(
        categoryId: string,
        limit: number = 12
    ): Promise<ProductWithDetails[]> {
        const categoryIds = await this.getCategoryAndChildren(categoryId);

        return prisma.product.findMany({
            where: {
                isActive: true,
                categoryId: { in: categoryIds },
            },
            include: {
                category: true,
                images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                    take: 2,
                },
                variants: {
                    where: { isActive: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        }) as Promise<ProductWithDetails[]>;
    }

    // Get related products
    async getRelatedProducts(productId: string, limit: number = 4): Promise<ProductWithDetails[]> {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) return [];

        return prisma.product.findMany({
            where: {
                isActive: true,
                id: { not: productId },
                OR: [
                    { categoryId: product.categoryId },
                    { tags: { hasSome: product.tags } },
                ],
            },
            include: {
                category: true,
                images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                    take: 1,
                },
                variants: {
                    where: { isActive: true },
                    take: 1,
                },
            },
            orderBy: { viewCount: 'desc' },
            take: limit,
        }) as Promise<ProductWithDetails[]>;
    }

    // Add product variant
    async addVariant(productId: string, data: Omit<ProductVariant, 'id' | 'productId'>): Promise<ProductVariant> {
        return prisma.productVariant.create({
            data: {
                ...data,
                productId,
            },
        });
    }

    // Update variant stock
    async updateVariantStock(variantId: string, quantity: number): Promise<ProductVariant> {
        return prisma.productVariant.update({
            where: { id: variantId },
            data: { stock: quantity },
        });
    }

    // Decrement variant stock
    async decrementStock(variantId: string, quantity: number): Promise<ProductVariant> {
        return prisma.productVariant.update({
            where: { id: variantId },
            data: { stock: { decrement: quantity } },
        });
    }

    // Check stock availability
    async checkStock(variantId: string, quantity: number): Promise<boolean> {
        const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
        });

        return variant ? variant.stock >= quantity : false;
    }

    // Get category and all its children IDs
    private async getCategoryAndChildren(categoryId: string): Promise<string[]> {
        const categories = await prisma.category.findMany({
            where: {
                OR: [
                    { id: categoryId },
                    { parentId: categoryId },
                ],
            },
            select: { id: true },
        });

        return categories.map(c => c.id);
    }

    // Add product images
    async addProductImages(
        productId: string,
        images: { thumbnailUrl: string; standardUrl: string; zoomUrl: string; altText?: string }[]
    ) {
        const imageData = images.map((img, index) => ({
            productId,
            thumbnailUrl: img.thumbnailUrl,
            standardUrl: img.standardUrl,
            zoomUrl: img.zoomUrl,
            altText: img.altText || null,
            isPrimary: index === 0,
            sortOrder: index,
        }));

        return prisma.productImage.createMany({
            data: imageData,
        });
    }

    // Update product
    async updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
        const updateData: Prisma.ProductUpdateInput = {};

        if (data.name) {
            updateData.name = data.name;
            updateData.slug = slugify(data.name, { lower: true, strict: true });
        }
        if (data.nameAr) updateData.nameAr = data.nameAr;
        if (data.description) updateData.description = data.description;
        if (data.descriptionAr) updateData.descriptionAr = data.descriptionAr;
        if (data.price !== undefined) updateData.price = data.price;
        if (data.comparePrice !== undefined) updateData.comparePrice = data.comparePrice;
        if (data.dimensions) updateData.dimensions = data.dimensions as unknown as Prisma.InputJsonValue;
        if (data.weight !== undefined) updateData.weight = data.weight;
        if (data.material) updateData.material = data.material;
        if (data.categoryId) updateData.category = { connect: { id: data.categoryId } };
        if (data.tags) updateData.tags = data.tags;
        if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

        return prisma.product.update({
            where: { id },
            data: updateData,
        });
    }

    // Delete product (soft delete)
    async deleteProduct(id: string): Promise<Product> {
        return prisma.product.update({
            where: { id },
            data: { isActive: false },
        });
    }
}

export const productService = new ProductService();
export default productService;
