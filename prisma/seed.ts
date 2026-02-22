import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.orderStatusHistory.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.address.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.promoCode.deleteMany();
    await prisma.homeLayout.deleteMany();

    console.log('✓ Cleared existing data');

    // Create Categories
    const livingRoom = await prisma.category.create({
        data: {
            name: 'Living Room',
            nameAr: 'غرفة المعيشة',
            slug: 'living-room',
            description: 'Sofas, coffee tables, and accent pieces for your living space',
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
            sortOrder: 1,
        },
    });

    const bedroom = await prisma.category.create({
        data: {
            name: 'Bedroom',
            nameAr: 'غرفة النوم',
            slug: 'bedroom',
            description: 'Beds, nightstands, and dressers for restful nights',
            image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
            sortOrder: 2,
        },
    });

    const dining = await prisma.category.create({
        data: {
            name: 'Dining Room',
            nameAr: 'غرفة الطعام',
            slug: 'dining-room',
            description: 'Dining tables, chairs, and buffets for family gatherings',
            image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600',
            sortOrder: 3,
        },
    });

    const office = await prisma.category.create({
        data: {
            name: 'Home Office',
            nameAr: 'المكتب المنزلي',
            slug: 'home-office',
            description: 'Desks, chairs, and storage for productive workspaces',
            image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600',
            sortOrder: 4,
        },
    });

    console.log('✓ Created 4 categories');

    // Create Products
    const products = [
        // Living Room Products
        {
            name: 'Milano Velvet Sofa',
            nameAr: 'أريكة ميلانو مخملية',
            slug: 'milano-velvet-sofa',
            description: 'Luxurious 3-seater velvet sofa with solid wood legs. Perfect for modern living rooms.',
            descriptionAr: 'أريكة مخملية فاخرة بثلاثة مقاعد مع أرجل خشبية صلبة. مثالية لغرف المعيشة الحديثة.',
            price: 24500,
            comparePrice: 28000,
            material: 'Velvet, Solid Wood',
            categoryId: livingRoom.id,
            tags: ['velvet', 'modern', 'bestseller'],
            isFeatured: true,
            images: [
                { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', isPrimary: true },
                { url: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=800', isPrimary: false },
            ],
            variants: [
                { name: 'Forest Green', sku: 'SOF-MIL-GRN', color: 'Green', stock: 12, priceAdj: 0 },
                { name: 'Navy Blue', sku: 'SOF-MIL-BLU', color: 'Blue', stock: 8, priceAdj: 500 },
                { name: 'Burgundy', sku: 'SOF-MIL-BUR', color: 'Red', stock: 5, priceAdj: 500 },
            ],
        },
        {
            name: 'Nordic Coffee Table',
            nameAr: 'طاولة قهوة نوردية',
            slug: 'nordic-coffee-table',
            description: 'Minimalist Scandinavian design coffee table with storage shelf.',
            descriptionAr: 'طاولة قهوة بتصميم اسكندنافي بسيط مع رف تخزين.',
            price: 4800,
            material: 'Oak Wood, Metal',
            categoryId: livingRoom.id,
            tags: ['scandinavian', 'minimalist'],
            isFeatured: true,
            images: [
                { url: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800', isPrimary: true },
            ],
            variants: [
                { name: 'Natural Oak', sku: 'TBL-NOR-OAK', color: 'Natural', stock: 20, priceAdj: 0 },
                { name: 'Walnut', sku: 'TBL-NOR-WAL', color: 'Brown', stock: 15, priceAdj: 800 },
            ],
        },
        {
            name: 'Luxe Accent Chair',
            nameAr: 'كرسي لوكس',
            slug: 'luxe-accent-chair',
            description: 'Statement accent chair with curved back and gold-finished legs.',
            descriptionAr: 'كرسي مميز بظهر منحني وأرجل ذهبية اللون.',
            price: 8900,
            comparePrice: 10500,
            material: 'Linen, Metal',
            categoryId: livingRoom.id,
            tags: ['accent', 'luxury'],
            isFeatured: true,
            images: [
                { url: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800', isPrimary: true },
            ],
            variants: [
                { name: 'Cream', sku: 'CHR-LUX-CRM', color: 'Cream', stock: 10, priceAdj: 0 },
                { name: 'Blush Pink', sku: 'CHR-LUX-PNK', color: 'Pink', stock: 6, priceAdj: 0 },
            ],
        },
        // Bedroom Products
        {
            name: 'Royal King Bed Frame',
            nameAr: 'إطار سرير ملكي',
            slug: 'royal-king-bed-frame',
            description: 'Elegant upholstered bed frame with tufted headboard. Fits king-size mattress.',
            descriptionAr: 'إطار سرير أنيق منجد برأسية مبطنة. يناسب مرتبة بحجم كينج.',
            price: 18500,
            material: 'Fabric, Engineered Wood',
            categoryId: bedroom.id,
            tags: ['upholstered', 'king-size'],
            isFeatured: true,
            images: [
                { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', isPrimary: true },
            ],
            variants: [
                { name: 'Light Gray', sku: 'BED-ROY-GRY', color: 'Gray', stock: 8, priceAdj: 0 },
                { name: 'Charcoal', sku: 'BED-ROY-CHL', color: 'Charcoal', stock: 5, priceAdj: 0 },
            ],
        },
        {
            name: 'Vienna Nightstand',
            nameAr: 'منضدة فيينا',
            slug: 'vienna-nightstand',
            description: 'Modern nightstand with two soft-close drawers and brass handles.',
            descriptionAr: 'منضدة حديثة بدرجين ناعمي الإغلاق ومقابض نحاسية.',
            price: 3200,
            material: 'MDF, Brass',
            categoryId: bedroom.id,
            tags: ['modern', 'storage'],
            images: [
                { url: 'https://images.unsplash.com/photo-1551298370-9d3d53a4e2d9?w=800', isPrimary: true },
            ],
            variants: [
                { name: 'White', sku: 'TBL-VIE-WHT', color: 'White', stock: 25, priceAdj: 0 },
                { name: 'Black', sku: 'TBL-VIE-BLK', color: 'Black', stock: 20, priceAdj: 0 },
            ],
        },
        // Dining Products
        {
            name: 'Marble Dining Table',
            nameAr: 'طاولة طعام رخامية',
            slug: 'marble-dining-table',
            description: 'Stunning 6-seater dining table with genuine marble top and steel base.',
            descriptionAr: 'طاولة طعام مذهلة لستة أشخاص بسطح رخامي أصلي وقاعدة فولاذية.',
            price: 32000,
            comparePrice: 38000,
            material: 'Marble, Stainless Steel',
            categoryId: dining.id,
            tags: ['marble', 'luxury', 'bestseller'],
            isFeatured: true,
            images: [
                { url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800', isPrimary: true },
            ],
            variants: [
                { name: 'White Marble', sku: 'TBL-MAR-WHT', color: 'White', stock: 4, priceAdj: 0 },
                { name: 'Black Marble', sku: 'TBL-MAR-BLK', color: 'Black', stock: 3, priceAdj: 2000 },
            ],
        },
        {
            name: 'Wishbone Dining Chair Set',
            nameAr: 'طقم كراسي ويشبون',
            slug: 'wishbone-dining-chair-set',
            description: 'Set of 4 iconic wishbone-style chairs with woven cord seats.',
            descriptionAr: 'طقم من 4 كراسي بتصميم ويشبون الأيقوني مع مقاعد منسوجة.',
            price: 12500,
            material: 'Beechwood, Natural Cord',
            categoryId: dining.id,
            tags: ['set', 'classic'],
            isFeatured: true,
            images: [
                { url: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800', isPrimary: true },
            ],
            variants: [
                { name: 'Natural', sku: 'CHR-WIS-NAT', color: 'Natural', stock: 10, priceAdj: 0 },
                { name: 'Black', sku: 'CHR-WIS-BLK', color: 'Black', stock: 8, priceAdj: 1000 },
            ],
        },
        // Office Products
        {
            name: 'Executive Desk',
            nameAr: 'مكتب تنفيذي',
            slug: 'executive-desk',
            description: 'Large executive desk with cable management and integrated drawers.',
            descriptionAr: 'مكتب تنفيذي كبير مع إدارة الكابلات وأدراج مدمجة.',
            price: 14500,
            material: 'Walnut Veneer, Metal',
            categoryId: office.id,
            tags: ['workspace', 'executive'],
            isFeatured: true,
            images: [
                { url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800', isPrimary: true },
            ],
            variants: [
                { name: 'Walnut', sku: 'DSK-EXC-WAL', color: 'Brown', stock: 6, priceAdj: 0 },
                { name: 'White Oak', sku: 'DSK-EXC-OAK', color: 'Natural', stock: 4, priceAdj: 1500 },
            ],
        },
    ];

    for (const productData of products) {
        const { images, variants, ...data } = productData;

        const product = await prisma.product.create({
            data: {
                ...data,
                dimensions: { width: 180, depth: 85, height: 80 } as any,
            },
        });

        // Create images
        for (let i = 0; i < images.length; i++) {
            await prisma.productImage.create({
                data: {
                    productId: product.id,
                    thumbnailUrl: images[i].url.replace('w=800', 'w=200'),
                    standardUrl: images[i].url,
                    zoomUrl: images[i].url.replace('w=800', 'w=1600'),
                    isPrimary: images[i].isPrimary,
                    sortOrder: i,
                },
            });
        }

        // Create variants
        for (const variant of variants) {
            await prisma.productVariant.create({
                data: {
                    productId: product.id,
                    ...variant,
                },
            });
        }
    }

    console.log(`✓ Created ${products.length} products with variants`);

    // Create Promo Codes
    await prisma.promoCode.createMany({
        data: [
            {
                code: 'WELCOME10',
                description: '10% off your first order',
                discountType: 'PERCENT',
                discountValue: 10,
                maxUsesPerUser: 1,
                startsAt: new Date(),
            },
            {
                code: 'FURNITURE20',
                description: '20% off orders over 10,000 EGP',
                discountType: 'PERCENT',
                discountValue: 20,
                minCartValue: 10000,
                maxDiscountAmount: 5000,
                startsAt: new Date(),
            },
            {
                code: 'FREESHIP',
                description: 'Free shipping on all orders',
                discountType: 'FIXED',
                discountValue: 100,
                startsAt: new Date(),
            },
        ],
    });

    console.log('✓ Created 3 promo codes');

    // Create Home Layout
    await prisma.homeLayout.createMany({
        data: [
            {
                section: 'hero',
                title: 'Design Your Perfect Space',
                titleAr: 'صمم مساحتك المثالية',
                config: {
                    subtitle: 'New Collection 2024',
                    backgroundImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920',
                    ctaText: 'Shop Now',
                    ctaLink: '/products',
                } as any,
                sortOrder: 1,
            },
            {
                section: 'category_carousel',
                title: 'Shop by Category',
                titleAr: 'تسوق حسب الفئة',
                config: { showAll: true, limit: 4 } as any,
                sortOrder: 2,
            },
            {
                section: 'featured',
                title: 'Featured Collection',
                titleAr: 'مجموعة مميزة',
                config: { limit: 8 } as any,
                sortOrder: 3,
            },
        ],
    });

    console.log('✓ Created home layout configuration');

    console.log('\n🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
