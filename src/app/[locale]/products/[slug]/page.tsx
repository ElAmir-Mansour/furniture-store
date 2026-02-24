'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { toggleWishlist, isInWishlist } from '@/lib/wishlist';

interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    color?: string;
    material?: string;
    size?: string;
    stock: number;
    priceAdj: number;
    imageUrl?: string;
}

interface ProductImage {
    id: string;
    thumbnailUrl: string;
    standardUrl: string;
    zoomUrl: string;
    isPrimary: boolean;
}

interface Product {
    id: string;
    name: string;
    nameAr?: string;
    slug: string;
    description: string;
    descriptionAr: string;
    price: number;
    comparePrice?: number;
    category: { id: string; name: string; slug: string };
    images: ProductImage[];
    variants: ProductVariant[];
    material?: string;
    dimensions?: { width?: number; depth?: number; height?: number } | string;
    tags: string[];
}

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [inWishlist, setInWishlist] = useState(false);

    useEffect(() => { fetchProduct(); }, [slug]);

    useEffect(() => {
        if (product) {
            setInWishlist(isInWishlist(product.id));
            const handler = () => setInWishlist(isInWishlist(product.id));
            window.addEventListener('wishlistUpdated', handler);
            return () => window.removeEventListener('wishlistUpdated', handler);
        }
    }, [product]);

    async function fetchProduct() {
        try {
            const res = await fetch(`/api/v1/products/${slug}`);
            const data = await res.json();
            if (data.success) {
                setProduct(data.data.product);
                setRelatedProducts(data.data.relatedProducts || []);
                if (data.data.product.variants?.length > 0) setSelectedVariant(data.data.product.variants[0]);
                if (data.data.product.images?.length > 0) {
                    setSelectedImage(
                        data.data.product.images.find((img: ProductImage) => img.isPrimary) || data.data.product.images[0]
                    );
                }
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddToCart() {
        if (!selectedVariant) return;
        setAddingToCart(true);
        try {
            const res = await fetch(`/api/v1/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variantId: selectedVariant.id, quantity }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Added to cart!');
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                toast.error(data.error || 'Failed to add to cart');
            }
        } catch {
            toast.error('Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    }

    function handleWishlist() {
        if (!product) return;
        toggleWishlist({
            id: product.id, slug: product.slug, name: product.name,
            price: Number(product.price), image: product.images[0]?.standardUrl || '',
        });
    }

    /* Loading */
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f7f5f2', paddingTop: '120px', paddingBottom: '80px' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 'max(4vw, 32px)' }}>
                        <div style={{ aspectRatio: '1', background: 'linear-gradient(90deg,#ede9e3 25%,#e5e0d8 50%,#ede9e3 75%)', borderRadius: '20px', animation: 'pulse 1.5s infinite' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[2, 4, 1, 3, 2].map((w, i) => (
                                <div key={i} style={{ height: i === 3 ? '80px' : '24px', width: `${w * 20}%`, background: 'linear-gradient(90deg,#ede9e3 25%,#e5e0d8 50%,#ede9e3 75%)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ minHeight: '100vh', background: '#f7f5f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px', paddingTop: '100px' }}>
                <div style={{ fontSize: '4rem' }}>🛋️</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: '#1a1a2e' }}>Product not found</h1>
                <Link href="/products" style={{ background: '#1a1a2e', color: 'white', padding: '12px 28px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
                    Back to Products
                </Link>
            </div>
        );
    }

    const currentPrice = Number(product.price) + (selectedVariant ? Number(selectedVariant.priceAdj) : 0);
    const hasDiscount = product.comparePrice && Number(product.comparePrice) > Number(product.price);
    const outOfStock = selectedVariant ? selectedVariant.stock === 0 : true;

    return (
        <div style={{ minHeight: '100vh', background: '#f7f5f2', paddingTop: '100px', paddingBottom: '80px' }}>

            {/* Breadcrumb */}
            <div className="container" style={{ marginBottom: '32px' }}>
                <nav style={{ fontSize: '0.875rem', color: '#9ca3af', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#1a1a2e'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                    >Home</Link>
                    <span>/</span>
                    <Link href="/products" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#1a1a2e'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                    >Products</Link>
                    <span>/</span>
                    <Link href={`/products?category=${product.category.slug}`} style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#1a1a2e'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                    >{product.category.name}</Link>
                    <span>/</span>
                    <span style={{ color: '#1a1a2e', fontWeight: 500 }}>{product.name}</span>
                </nav>
            </div>

            {/* Main Grid */}
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 'max(4vw, 32px)', alignItems: 'start' }}>

                    {/* Images Column */}
                    <div>
                        {/* Main Image */}
                        <div style={{ position: 'relative', aspectRatio: '1', borderRadius: '20px', overflow: 'hidden', background: '#ede9e3', marginBottom: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Image
                                src={selectedImage?.zoomUrl || selectedImage?.standardUrl || 'https://via.placeholder.com/800'}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: 'cover' }}
                            />
                            {hasDiscount && (
                                <span style={{ position: 'absolute', top: '16px', left: '16px', padding: '4px 12px', background: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', zIndex: 10 }}>
                                    Sale
                                </span>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                                {product.images.map(image => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImage(image)}
                                        style={{
                                            position: 'relative', width: '88px', height: '88px', flexShrink: 0,
                                            borderRadius: '12px', overflow: 'hidden', border: '2px solid',
                                            borderColor: selectedImage?.id === image.id ? '#c9a959' : 'transparent',
                                            boxShadow: selectedImage?.id === image.id ? '0 0 0 2px rgba(201,169,89,0.3)' : 'none',
                                            cursor: 'pointer', background: '#ede9e3', padding: 0, transition: 'all 0.2s',
                                        }}
                                    >
                                        <Image src={image.thumbnailUrl} alt="" fill sizes="88px" style={{ objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Column */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Category badge */}
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c9a959', fontWeight: 700, marginBottom: '12px', display: 'block' }}>
                            {product.category.name}
                        </span>

                        {/* Name */}
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,3vw,2.75rem)', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px', lineHeight: 1.15 }}>
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: '#1a1a2e' }}>
                                {currentPrice.toLocaleString()} EGP
                            </span>
                            {hasDiscount && (
                                <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#9ca3af', textDecoration: 'line-through' }}>
                                    {Number(product.comparePrice).toLocaleString()} EGP
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: 1.8, fontWeight: 300, marginBottom: '32px' }}>
                            {product.description}
                        </p>

                        {/* Variants */}
                        {product.variants.length > 1 && (
                            <div style={{ marginBottom: '28px' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                                    Options
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {product.variants.map(variant => {
                                        const isSelected = selectedVariant?.id === variant.id;
                                        const oos = variant.stock === 0;
                                        return (
                                            <button
                                                key={variant.id}
                                                onClick={() => !oos && setSelectedVariant(variant)}
                                                disabled={oos}
                                                style={{
                                                    padding: '10px 20px', border: '2px solid', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
                                                    cursor: oos ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                                                    borderColor: isSelected ? '#1a1a2e' : '#e5e7eb',
                                                    background: isSelected ? '#1a1a2e' : 'white',
                                                    color: isSelected ? 'white' : oos ? '#9ca3af' : '#1a1a2e',
                                                    opacity: oos ? 0.5 : 1,
                                                    boxShadow: isSelected ? '0 4px 12px rgba(26,26,46,0.2)' : 'none',
                                                }}
                                            >
                                                {variant.name}{oos && ' (Out of Stock)'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Stock Status */}
                        {selectedVariant && (
                            <div style={{
                                padding: '12px 18px', borderRadius: '10px', marginBottom: '24px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: selectedVariant.stock > 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                            }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: selectedVariant.stock > 0 ? '#10b981' : '#ef4444' }}>
                                    {selectedVariant.stock > 0
                                        ? `✓ In Stock (${selectedVariant.stock} available)`
                                        : '✕ Out of Stock'}
                                </span>
                            </div>
                        )}

                        {/* Qty + Add to Cart + Wishlist */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', alignItems: 'stretch', flexWrap: 'wrap' }}>
                            {/* Quantity stepper */}
                            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: 'white', flexShrink: 0 }}>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    style={{ width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f7f5f2'; e.currentTarget.style.color = '#1a1a2e'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
                                >
                                    −
                                </button>
                                <span style={{ width: '44px', textAlign: 'center', fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(selectedVariant?.stock || 10, quantity + 1))}
                                    style={{ width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f7f5f2'; e.currentTarget.style.color = '#1a1a2e'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to Cart */}
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart || outOfStock}
                                style={{
                                    flex: 1, minWidth: '160px', padding: '0 24px', height: '52px', background: (addingToCart || outOfStock) ? '#9ca3af' : '#1a1a2e',
                                    color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem',
                                    cursor: (addingToCart || outOfStock) ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s, transform 0.1s', letterSpacing: '0.02em',
                                    boxShadow: outOfStock ? 'none' : '0 4px 14px rgba(26,26,46,0.25)',
                                }}
                                onMouseEnter={e => { if (!addingToCart && !outOfStock) { e.currentTarget.style.background = '#c9a959'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                onMouseLeave={e => { if (!addingToCart && !outOfStock) { e.currentTarget.style.background = '#1a1a2e'; e.currentTarget.style.transform = 'none'; } }}
                            >
                                {addingToCart ? 'Adding...' : outOfStock ? 'Out of Stock' : '🛒 Add to Cart'}
                            </button>

                            {/* Wishlist */}
                            <button
                                onClick={handleWishlist}
                                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                style={{
                                    width: '52px', height: '52px', border: '2px solid', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                                    cursor: 'pointer', background: inWishlist ? '#fef2f2' : 'white',
                                    borderColor: inWishlist ? '#fecaca' : '#e5e7eb',
                                    color: inWishlist ? '#ef4444' : '#6b7280',
                                    transition: 'all 0.2s', flexShrink: 0,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = inWishlist ? '#fecaca' : '#e5e7eb'; e.currentTarget.style.color = inWishlist ? '#ef4444' : '#6b7280'; }}
                            >
                                {inWishlist ? '❤️' : '♡'}
                            </button>
                        </div>

                        {/* Product Details */}
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '28px' }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
                                Product Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
                                {product.material && (
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '2px' }}>Material</span>
                                        <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.875rem' }}>{product.material}</span>
                                    </div>
                                )}
                                {product.dimensions && (
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '2px' }}>Dimensions</span>
                                        <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.875rem' }}>
                                            {typeof product.dimensions === 'string'
                                                ? product.dimensions
                                                : `${product.dimensions.width || 0} × ${product.dimensions.depth || 0} × ${product.dimensions.height || 0} cm`}
                                        </span>
                                    </div>
                                )}
                                {selectedVariant?.sku && (
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '2px' }}>SKU</span>
                                        <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.875rem' }}>{selectedVariant.sku}</span>
                                    </div>
                                )}
                                {product.category && (
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '2px' }}>Category</span>
                                        <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.875rem' }}>{product.category.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section style={{ background: 'white', marginTop: '80px', padding: '60px 0', borderTop: '1px solid #e5e7eb' }}>
                    <div className="container">
                        <div className="section-header">
                            <span className="section-subtitle">You May Also Like</span>
                            <h2 className="section-title">Related Products</h2>
                        </div>
                        <div className="grid grid-4">
                            {relatedProducts.slice(0, 4).map((item) => (
                                <RelatedCard key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

function RelatedCard({ item }: { item: { id: string; name: string; slug: string; price: number; images: { standardUrl: string }[] } }) {
    const [hovered, setHovered] = useState(false);
    return (
        <Link
            href={`/products/${item.slug}`}
            style={{
                textDecoration: 'none', display: 'block', background: 'white', borderRadius: '16px',
                overflow: 'hidden', border: '1px solid #e5e7eb',
                transform: hovered ? 'translateY(-4px)' : 'none',
                boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{ position: 'relative', aspectRatio: '1', background: '#f7f5f2', overflow: 'hidden' }}>
                <Image
                    src={item.images?.[0]?.standardUrl || 'https://via.placeholder.com/400'}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    style={{ objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.5s' }}
                />
            </div>
            <div style={{ padding: '16px', textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: '#1a1a2e', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                </h3>
                <span style={{ fontWeight: 700, color: '#c9a959' }}>
                    {Number(item.price).toLocaleString()} EGP
                </span>
            </div>
        </Link>
    );
}
