import { User, Product, ProductVariant, Category, Order, Address, PromoCode, OrderStatus, UserRole, DiscountType } from '@prisma/client';

// ==================== API Response Types ====================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ==================== Auth Types ====================

export interface GuestSession {
    guestUuid: string;
    userId: string;
    createdAt: Date;
}

export interface AuthUser {
    id: string;
    email: string | null;
    name: string | null;
    role: UserRole;
    isGuest: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

export interface ConvertGuestRequest {
    email: string;
    password: string;
    name?: string;
}

// ==================== Product Types ====================

export interface ProductWithDetails extends Product {
    category: Category;
    images: ProductImageData[];
    variants: ProductVariant[];
}

export interface ProductImageData {
    id: string;
    thumbnailUrl: string;
    standardUrl: string;
    zoomUrl: string;
    altText: string | null;
    isPrimary: boolean;
    sortOrder: number;
}

export interface ProductDimensions {
    height: number;
    width: number;
    depth: number;
    unit: 'cm' | 'in' | 'm';
}

export interface CreateProductRequest {
    name: string;
    nameAr?: string;
    description: string;
    descriptionAr?: string;
    price: number;
    comparePrice?: number;
    dimensions?: ProductDimensions;
    weight?: number;
    material?: string;
    categoryId: string;
    tags?: string[];
    isFeatured?: boolean;
}

export interface ProductFilters {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    material?: string;
    tags?: string[];
    search?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

// ==================== Cart Types ====================

export interface CartItemWithDetails {
    id: string;
    variantId: string;
    quantity: number;
    variant: ProductVariant & {
        product: Product & {
            images: ProductImageData[];
        };
    };
    itemTotal: number;
}

export interface Cart {
    items: CartItemWithDetails[];
    subtotal: number;
    itemCount: number;
}

export interface AddToCartRequest {
    variantId: string;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

// ==================== Address Types ====================

export interface AddressData {
    label?: string;
    fullName: string;
    phone: string;
    street: string;
    building?: string;
    floor?: string;
    apartment?: string;
    city: string;
    governorate: string;
    postalCode?: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
}

export interface GeocodingResult {
    lat: number;
    lng: number;
    displayName: string;
    street?: string;
    city?: string;
    governorate?: string;
}

// ==================== Checkout Types ====================

export interface CheckoutInitRequest {
    addressId?: string;
    newAddress?: AddressData;
    promoCode?: string;
    paymentMethod: 'card' | 'wallet' | 'cod';
    walletNumber?: string;
    customerNote?: string;
}

export interface CheckoutSession {
    orderId: string;
    orderNumber: string;
    total: number;
    paymentMethod: string;
    paymobOrderId?: number;
    iframeUrl?: string;
    redirectUrl?: string;
}

// ==================== Order Types ====================

export interface OrderWithDetails extends Order {
    items: OrderItemWithProduct[];
    user: Pick<User, 'id' | 'name' | 'email'>;
    promoCode?: PromoCode | null;
    statusHistory: OrderStatusHistoryItem[];
}

export interface OrderItemWithProduct {
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    variant: ProductVariant & {
        product: Product;
    };
}

export interface OrderStatusHistoryItem {
    id: string;
    status: OrderStatus;
    note: string | null;
    createdAt: Date;
}

export interface OrderFilters {
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
}

// ==================== Promo Code Types ====================

export interface ValidatePromoResult {
    valid: boolean;
    code?: PromoCode;
    discount?: number;
    message?: string;
}

export interface CreatePromoCodeRequest {
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minCartValue?: number;
    maxDiscountAmount?: number;
    maxUses?: number;
    maxUsesPerUser?: number;
    excludedCategories?: string[];
    excludedProducts?: string[];
    startsAt?: Date;
    expiresAt?: Date;
}

// ==================== Home Layout Types ====================

export type HomeSectionType = 'hero' | 'category_carousel' | 'featured' | 'banner' | 'products_grid';

export interface HeroConfig {
    slides: {
        imageUrl: string;
        title?: string;
        subtitle?: string;
        buttonText?: string;
        buttonLink?: string;
    }[];
    autoplay?: boolean;
    interval?: number;
}

export interface CategoryCarouselConfig {
    title?: string;
    categoryIds?: string[];
    showAll?: boolean;
    limit?: number;
}

export interface FeaturedConfig {
    title?: string;
    categoryId?: string;
    productIds?: string[];
    limit?: number;
}

export interface BannerConfig {
    imageUrl: string;
    link?: string;
    height?: number;
}

export interface ProductsGridConfig {
    title?: string;
    filter: 'newest' | 'popular' | 'sale' | 'category';
    categoryId?: string;
    limit?: number;
    columns?: number;
}

export interface HomeSection {
    id: string;
    section: HomeSectionType;
    title?: string;
    titleAr?: string;
    config: HeroConfig | CategoryCarouselConfig | FeaturedConfig | BannerConfig | ProductsGridConfig;
    sortOrder: number;
}

// ==================== Image Processing Types ====================

export interface ProcessedImage {
    thumbnail: string;
    standard: string;
    zoom: string;
}

export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

// ==================== Egypt Specific Types ====================

export const EGYPTIAN_GOVERNORATES = [
    'Cairo',
    'Giza',
    'Alexandria',
    'Dakahlia',
    'Red Sea',
    'Beheira',
    'Fayoum',
    'Gharbia',
    'Ismailia',
    'Menofia',
    'Minya',
    'Qalyubia',
    'New Valley',
    'Suez',
    'Aswan',
    'Asyut',
    'Beni Suef',
    'Port Said',
    'Damietta',
    'Sharkia',
    'South Sinai',
    'Kafr El Sheikh',
    'Matrouh',
    'Luxor',
    'Qena',
    'North Sinai',
    'Sohag',
] as const;

export type EgyptianGovernorate = typeof EGYPTIAN_GOVERNORATES[number];

// ==================== Re-exports ====================

export type { User, Product, ProductVariant, Category, Order, Address, PromoCode, OrderStatus, UserRole, DiscountType };
