'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    description?: string;
    images: { thumbnailUrl: string; standardUrl: string }[];
    category: { name: string };
    variants: { id: string; name: string; stock: number }[];
}

interface QuickViewModalProps {
    productSlug: string | null;
    onClose: () => void;
}

export default function QuickViewModal({ productSlug, onClose }: QuickViewModalProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (!productSlug) {
            setProduct(null);
            return;
        }

        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/v1/products/${productSlug}`);
                const data = await res.json();
                if (data.success) {
                    setProduct(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productSlug]);

    useEffect(() => {
        if (productSlug) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [productSlug]);

    const handleAddToCart = async () => {
        if (!product || !product.variants[0]) return;

        setAdding(true);
        try {
            const res = await fetch('/api/v1/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variantId: product.variants[0].id,
                    quantity,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setAdded(true);
                setTimeout(() => {
                    onClose();
                    setAdded(false);
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setAdding(false);
        }
    };

    if (!productSlug) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: 800,
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                maxHeight: '90vh',
                display: 'flex',
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 32,
                        height: 32,
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        zIndex: 10,
                    }}
                >
                    ✕
                </button>

                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            border: '3px solid #e5e7eb',
                            borderTopColor: '#b8860b',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                        }} />
                    </div>
                ) : product ? (
                    <>
                        {/* Image */}
                        <div style={{
                            width: '50%',
                            background: '#f9fafb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src={product.images[0]?.standardUrl || '/placeholder.jpg'}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        </div>

                        {/* Details */}
                        <div style={{
                            width: '50%',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <span style={{
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: '#b8860b',
                                marginBottom: '8px',
                            }}>
                                {product.category?.name}
                            </span>

                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                margin: '0 0 16px',
                            }}>
                                {product.name}
                            </h2>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b8860b' }}>
                                    {Number(product.price).toLocaleString()} EGP
                                </span>
                                {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                                    <span style={{
                                        fontSize: '1rem',
                                        color: '#9ca3af',
                                        textDecoration: 'line-through',
                                    }}>
                                        {Number(product.comparePrice).toLocaleString()} EGP
                                    </span>
                                )}
                            </div>

                            <p style={{
                                color: '#6b7280',
                                fontSize: '0.875rem',
                                lineHeight: 1.6,
                                marginBottom: '24px',
                                flex: 1,
                            }}>
                                {product.description?.slice(0, 200) || 'Premium quality furniture piece designed for comfort and style.'}
                                {product.description && product.description.length > 200 ? '...' : ''}
                            </p>

                            {/* Quantity */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Quantity:</span>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}>
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '1.25rem',
                                        }}
                                    >
                                        −
                                    </button>
                                    <span style={{ width: 40, textAlign: 'center', fontWeight: 500 }}>
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '1.25rem',
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={adding || added}
                                    style={{
                                        flex: 1,
                                        padding: '14px 24px',
                                        background: added ? '#10b981' : '#1f2937',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: adding ? 'wait' : 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {added ? '✓ Added to Cart' : adding ? 'Adding...' : 'Add to Cart'}
                                </button>
                                <Link
                                    href={`/products/${product.slug}`}
                                    onClick={onClose}
                                    style={{
                                        padding: '14px 24px',
                                        background: 'transparent',
                                        color: '#1f2937',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                        <p style={{ color: '#6b7280' }}>Product not found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
