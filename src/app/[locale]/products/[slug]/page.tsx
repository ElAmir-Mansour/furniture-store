'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

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

    useEffect(() => {
        fetchProduct();
    }, [slug]);

    async function fetchProduct() {
        try {
            const res = await fetch(`/api/v1/products/${slug}`);
            const data = await res.json();

            if (data.success) {
                setProduct(data.data.product);
                setRelatedProducts(data.data.relatedProducts || []);

                if (data.data.product.variants?.length > 0) {
                    setSelectedVariant(data.data.product.variants[0]);
                }
                if (data.data.product.images?.length > 0) {
                    setSelectedImage(data.data.product.images.find((img: ProductImage) => img.isPrimary) || data.data.product.images[0]);
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
            const res = await fetch('/api/v1/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variantId: selectedVariant.id,
                    quantity,
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Added to cart!');
            } else {
                toast.error(data.error || 'Failed to add to cart');
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setAddingToCart(false);
        }
    }

    if (loading) {
        return (
            <div style={{ paddingTop: '120px', minHeight: '100vh' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2xl)' }}>
                        <div className="skeleton" style={{ aspectRatio: '1', borderRadius: '12px' }} />
                        <div>
                            <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 16 }} />
                            <div className="skeleton" style={{ height: 40, width: '80%', marginBottom: 16 }} />
                            <div className="skeleton" style={{ height: 32, width: '30%', marginBottom: 24 }} />
                            <div className="skeleton" style={{ height: 100, width: '100%', marginBottom: 24 }} />
                            <div className="skeleton" style={{ height: 56, width: '100%' }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ paddingTop: '120px', minHeight: '100vh', textAlign: 'center' }}>
                <div className="container">
                    <h1>Product not found</h1>
                    <Link href="/products" className="btn btn-primary" style={{ marginTop: 24 }}>
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    const currentPrice = Number(product.price) + (selectedVariant ? Number(selectedVariant.priceAdj) : 0);
    const hasDiscount = product.comparePrice && Number(product.comparePrice) > Number(product.price);

    return (
        <div style={{ paddingTop: '100px' }}>
            {/* Breadcrumb */}
            <div className="container" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <nav style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                    <span style={{ margin: '0 8px' }}>/</span>
                    <Link href="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Products</Link>
                    <span style={{ margin: '0 8px' }}>/</span>
                    <Link href={`/category/${product.category.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {product.category.name}
                    </Link>
                    <span style={{ margin: '0 8px' }}>/</span>
                    <span style={{ color: 'var(--color-text)' }}>{product.name}</span>
                </nav>
            </div>

            {/* Product Details */}
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3xl)' }}>
                    {/* Images */}
                    <div>
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f7f5f2] mb-4">
                            <Image
                                src={selectedImage?.zoomUrl || selectedImage?.standardUrl || 'https://via.placeholder.com/800'}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                            />
                            {hasDiscount && (
                                <span style={{
                                    position: 'absolute',
                                    top: 16,
                                    left: 16,
                                    padding: '6px 12px',
                                    background: 'var(--color-error)',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    borderRadius: 'var(--radius-sm)',
                                }}>
                                    Sale
                                </span>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', overflowX: 'auto' }}>
                                {product.images.map((image) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImage(image)}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 'var(--radius-md)',
                                            overflow: 'hidden',
                                            border: selectedImage?.id === image.id ? '2px solid var(--color-secondary)' : '2px solid transparent',
                                            cursor: 'pointer',
                                            padding: 0,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Image
                                            src={image.thumbnailUrl}
                                            alt=""
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <span style={{
                            display: 'inline-block',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--color-secondary)',
                            marginBottom: 'var(--spacing-sm)',
                        }}>
                            {product.category.name}
                        </span>

                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                            marginBottom: 'var(--spacing-lg)',
                        }}>
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <span style={{
                                fontSize: '2rem',
                                fontWeight: 600,
                                color: 'var(--color-secondary)',
                            }}>
                                {currentPrice.toLocaleString()} EGP
                            </span>
                            {hasDiscount && (
                                <span style={{
                                    marginLeft: 12,
                                    fontSize: '1.25rem',
                                    color: 'var(--color-text-muted)',
                                    textDecoration: 'line-through',
                                }}>
                                    {Number(product.comparePrice).toLocaleString()} EGP
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p style={{
                            color: 'var(--color-text-muted)',
                            lineHeight: 1.8,
                            marginBottom: 'var(--spacing-xl)',
                        }}>
                            {product.description}
                        </p>

                        {/* Variants */}
                        {product.variants.length > 1 && (
                            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    marginBottom: 'var(--spacing-sm)',
                                }}>
                                    Options
                                </label>
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant)}
                                            disabled={variant.stock === 0}
                                            style={{
                                                padding: '10px 20px',
                                                border: selectedVariant?.id === variant.id
                                                    ? '2px solid var(--color-primary)'
                                                    : '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-md)',
                                                background: selectedVariant?.id === variant.id
                                                    ? 'var(--color-primary)'
                                                    : 'transparent',
                                                color: selectedVariant?.id === variant.id
                                                    ? 'white'
                                                    : 'var(--color-text)',
                                                cursor: variant.stock > 0 ? 'pointer' : 'not-allowed',
                                                opacity: variant.stock === 0 ? 0.5 : 1,
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {variant.name}
                                            {variant.stock === 0 && ' (Out of stock)'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                            {/* Quantity selector */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '1.25rem',
                                    }}
                                >
                                    −
                                </button>
                                <span style={{
                                    width: 48,
                                    textAlign: 'center',
                                    fontWeight: 500,
                                }}>
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(Math.min(selectedVariant?.stock || 10, quantity + 1))}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '1.25rem',
                                    }}
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to Cart button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart || !selectedVariant || selectedVariant.stock === 0}
                                className="btn btn-primary btn-lg"
                                style={{ flex: 1 }}
                            >
                                {addingToCart ? 'Adding...' : 'Add to Cart'}
                            </button>

                            {/* Wishlist */}
                            <button
                                style={{
                                    width: 56,
                                    height: 56,
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                }}
                            >
                                ♡
                            </button>
                        </div>

                        {/* Stock status */}
                        {selectedVariant && (
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: selectedVariant.stock > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--spacing-xl)',
                            }}>
                                <span style={{
                                    color: selectedVariant.stock > 0 ? 'var(--color-success)' : 'var(--color-error)',
                                    fontWeight: 500,
                                }}>
                                    {selectedVariant.stock > 0
                                        ? `✓ In Stock (${selectedVariant.stock} available)`
                                        : '✕ Out of Stock'
                                    }
                                </span>
                            </div>
                        )}

                        {/* Details */}
                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-xl)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Product Details</h3>
                            <table style={{ width: '100%', fontSize: '0.875rem' }}>
                                <tbody>
                                    {product.material && (
                                        <tr>
                                            <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>Material</td>
                                            <td style={{ padding: '8px 0' }}>{product.material}</td>
                                        </tr>
                                    )}
                                    {product.dimensions && (
                                        <tr>
                                            <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>Dimensions</td>
                                            <td style={{ padding: '8px 0' }}>
                                                {typeof product.dimensions === 'string'
                                                    ? product.dimensions
                                                    : `${product.dimensions.width || 0} × ${product.dimensions.depth || 0} × ${product.dimensions.height || 0} cm`
                                                }
                                            </td>
                                        </tr>
                                    )}
                                    {selectedVariant?.sku && (
                                        <tr>
                                            <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>SKU</td>
                                            <td style={{ padding: '8px 0' }}>{selectedVariant.sku}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
                    <div className="container">
                        <div className="section-header">
                            <span className="section-subtitle">You May Also Like</span>
                            <h2 className="section-title">Related Products</h2>
                        </div>
                        <div className="grid grid-4">
                            {relatedProducts.slice(0, 4).map((item: any) => (
                                <Link
                                    key={item.id}
                                    href={`/products/${item.slug}`}
                                    className="product-card"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div className="relative aspect-square bg-[#f7f5f2]">
                                        <Image
                                            src={item.images?.[0]?.standardUrl || 'https://via.placeholder.com/400'}
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 25vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="product-card-content">
                                        <h3 className="product-card-title">{item.name}</h3>
                                        <span className="product-card-price-current">
                                            {Number(item.price).toLocaleString()} EGP
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
