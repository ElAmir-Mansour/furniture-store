'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: { thumbnailUrl: string }[];
    category: { name: string };
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const locale = useLocale();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        const searchProducts = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/v1/products?search=${encodeURIComponent(query)}&limit=8`);
                const data = await res.json();
                if (data.success) {
                    setResults(data.data.items || data.data);
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '10vh',
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
                maxWidth: 640,
                margin: '0 16px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
            }}>
                {/* Search Input */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                }}>
                    <SearchIcon />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products..."
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '1rem',
                            background: 'transparent',
                        }}
                    />
                    <button
                        onClick={onClose}
                        style={{
                            padding: '4px 12px',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            cursor: 'pointer',
                        }}
                    >
                        ESC
                    </button>
                </div>

                {/* Results */}
                <div style={{
                    maxHeight: '60vh',
                    overflowY: 'auto',
                }}>
                    {loading && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                            Searching...
                        </div>
                    )}

                    {!loading && query.length >= 2 && results.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                            No products found for "{query}"
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div style={{ padding: '8px' }}>
                            {results.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/${locale}/products/${product.slug}`}
                                    onClick={onClose}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <img
                                        src={product.images[0]?.thumbnailUrl || '/placeholder.jpg'}
                                        alt={product.name}
                                        style={{
                                            width: 48,
                                            height: 48,
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            background: '#f3f4f6',
                                        }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: 500 }}>{product.name}</p>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                                            {product.category?.name}
                                        </p>
                                    </div>
                                    <span style={{ fontWeight: 600, color: '#b8860b' }}>
                                        {Number(product.price).toLocaleString()} EGP
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && query.length < 2 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                            <p style={{ margin: 0 }}>Type to search products</p>
                            <p style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>
                                Try "sofa", "desk", or "chair"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SearchIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
    );
}
