'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import QuickViewModal from '@/components/QuickViewModal';
import { toggleWishlist, isInWishlist } from '@/lib/wishlist';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: { thumbnailUrl: string; standardUrl: string }[];
  category: { name: string };
  variants: { id: string; stock: number; name: string }[];
}

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewSlug, setQuickViewSlug] = useState<string | null>(null);

  const localePath = (path: string) => `/${locale}${path}`;

  useEffect(() => { fetchHomeData(); }, []);

  async function fetchHomeData() {
    try {
      const [categoriesRes, featuredRes] = await Promise.all([
        fetch('/api/v1/categories'),
        fetch('/api/v1/products/featured?limit=8'),
      ]);
      const categoriesData = await categoriesRes.json();
      const featuredData = await featuredRes.json();
      if (categoriesData.success) setCategories(categoriesData.data);
      if (featuredData.success) setFeaturedProducts(featuredData.data);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <QuickViewModal productSlug={quickViewSlug} onClose={() => setQuickViewSlug(null)} />

      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '48px', alignItems: 'center' }}>
            {/* Left Content */}
            <div className="hero-content animate-fadeInUp">
              <span className="hero-subtitle">{t('home.heroSubtitle')}</span>
              <h1 className="hero-title display-xl">
                {t('home.heroTitle').split(' ').slice(0, 2).join(' ')}<br />
                <span style={{ color: 'var(--color-secondary)', fontStyle: 'italic', fontWeight: 300 }}>
                  {t('home.heroTitle').split(' ').slice(2).join(' ')}
                </span>
              </h1>
              <p className="hero-description">{t('home.heroDescription')}</p>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href={localePath('/products')} className="btn btn-primary btn-lg">
                  {t('home.shopNow')}
                </Link>
                <Link href={localePath('/categories')} className="btn btn-outline btn-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {t('home.exploreCategories')}
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="animate-slideInRight" style={{ position: 'relative', aspectRatio: '3/4', width: '100%' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(201,169,89,0.1)', borderRadius: '0 0 0 100px', transform: 'translate(16px,16px)' }} />
              <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80"
                alt="Premium Sofa"
                fill
                style={{ objectFit: 'cover', borderRadius: '0 0 0 100px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">{t('home.explore')}</span>
            <h2 className="section-title">{t('home.shopByCategory')}</h2>
          </div>
          <div className="grid grid-4">
            {loading
              ? Array(4).fill(0).map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', background: 'linear-gradient(90deg,#ede9e3 25%,#e5e0d8 50%,#ede9e3 75%)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
              ))
              : categories.slice(0, 4).map((category) => (
                <CategoryCard key={category.id} category={category} locale={locale} />
              ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">{t('home.curatedSelection')}</span>
            <h2 className="section-title">{t('home.featuredCollection')}</h2>
          </div>
          <div className="grid grid-4">
            {loading
              ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  onQuickView={() => setQuickViewSlug(product.slug)}
                />
              ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '64px' }}>
            <Link href={localePath('/products')} className="btn btn-outline btn-lg" style={{ textDecoration: 'none' }}>
              {t('home.viewAllProducts')}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <FeaturesSection />

      {/* ─── Newsletter ─── */}
      <NewsletterSection />
    </div>
  );
}

/* ── Category Card ── */
function CategoryCard({ category, locale }: { category: Category; locale: string }) {
  const t = useTranslations('home');
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/${locale}/products?category=${category.slug}`}
      className="category-card group"
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={category.image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600'}
        alt={category.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{ objectFit: 'cover' }}
      />
      <div className="category-card-content">
        <h3 className="category-card-title">{category.name}</h3>
        <span style={{
          color: '#c9a959', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '10px',
          transform: hovered ? 'translateY(0)' : 'translateY(16px)',
          opacity: hovered ? 1 : 0,
          transition: 'all 0.3s',
          display: 'block',
          marginTop: '4px',
        }}>
          {t('viewCollection')}
        </span>
      </div>
    </Link>
  );
}

/* ── Product Card ── */
function ProductCard({ product, locale, onQuickView }: { product: Product; locale: string; onQuickView: () => void }) {
  const t = useTranslations('common');
  const [inWishlist, setInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistHovered, setWishlistHovered] = useState(false);

  const price = Number(product.price);
  const comparePrice = Number(product.comparePrice);
  const hasDiscount = comparePrice > price;
  const discountPercent = hasDiscount ? Math.round((1 - price / comparePrice) * 100) : 0;
  const firstVariant = product.variants?.[0];
  const inStock = product.variants?.some(v => v.stock > 0);

  useEffect(() => {
    setInWishlist(isInWishlist(product.id));
    const handleUpdate = () => setInWishlist(isInWishlist(product.id));
    window.addEventListener('wishlistUpdated', handleUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleUpdate);
  }, [product.id]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ id: product.id, slug: product.slug, name: product.name, price, image: product.images[0]?.standardUrl || '' });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView();
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant || !inStock) return;
    setAddingToCart(true);
    try {
      const res = await fetch(`/api/v1/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: firstVariant.id, quantity: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${product.name} added to cart!`);
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        toast.error(data.error || 'Failed to add to cart');
      }
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="product-card group"
      style={{ textDecoration: 'none' }}
    >
      <div className="product-card-image">
        <Image
          src={product.images[0]?.standardUrl || 'https://via.placeholder.com/400'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {hasDiscount && (
          <span className="product-card-badge">-{discountPercent}%</span>
        )}

        <div className="product-card-actions">
          <button
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
            onMouseEnter={() => setWishlistHovered(true)}
            onMouseLeave={() => setWishlistHovered(false)}
            style={{
              width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: inWishlist ? '#fef2f2' : (wishlistHovered ? '#f7f5f2' : 'white'),
              color: inWishlist ? '#ef4444' : '#1a1a2e',
            }}
          >
            <HeartIcon filled={inWishlist} />
          </button>
          <button
            onClick={handleQuickView}
            aria-label="Quick view"
            style={{
              width: '40px', height: '40px', background: 'white', color: '#1a1a2e', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f7f5f2'; e.currentTarget.style.color = '#c9a959'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#1a1a2e'; }}
          >
            <EyeIcon />
          </button>
        </div>
      </div>

      <div className="product-card-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <span className="product-card-category">{product.category?.name}</span>
        <h3 className="product-card-title" style={{ transition: 'color 0.2s' }}>{product.name}</h3>
        <div className="product-card-price">
          <span className="product-card-price-current">{price.toLocaleString()} {t('egp')}</span>
          {hasDiscount && (
            <span className="product-card-price-original">{comparePrice.toLocaleString()} {t('egp')}</span>
          )}
        </div>

        {inStock && firstVariant ? (
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            style={{
              marginTop: '12px', width: '100%', padding: '10px',
              background: addingToCart ? '#9ca3af' : '#1a1a2e', color: 'white',
              border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem',
              cursor: addingToCart ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              letterSpacing: '0.04em',
            }}
            onMouseEnter={e => { if (!addingToCart) e.currentTarget.style.background = '#c9a959'; }}
            onMouseLeave={e => { if (!addingToCart) e.currentTarget.style.background = '#1a1a2e'; }}
          >
            {addingToCart ? '...' : '🛒 Add to Cart'}
          </button>
        ) : (
          <span style={{ marginTop: '12px', fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Out of Stock
          </span>
        )}
      </div>
    </Link>
  );
}

/* ── Skeletons ── */
function ProductCardSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f3f4f6' }}>
      <div style={{ aspectRatio: '4/5', background: 'linear-gradient(90deg,#f7f5f2 25%,#ede9e3 50%,#f7f5f2 75%)', animation: 'pulse 1.5s infinite' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ height: '10px', width: '30%', background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '16px', width: '70%', background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '14px', width: '40%', background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
      </div>
    </div>
  );
}

/* ── Features Section ── */
function FeaturesSection() {
  const t = useTranslations('features');
  const features = [
    { icon: <TruckIcon />, title: t('freeShipping'), description: t('freeShippingDesc') },
    { icon: <ShieldIcon />, title: t('warranty'), description: t('warrantyDesc') },
    { icon: <RefreshIcon />, title: t('returns'), description: t('returnsDesc') },
    { icon: <SupportIcon />, title: t('support'), description: t('supportDesc') },
  ];

  return (
    <section className="section" style={{ background: 'white', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '48px 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '40px' }}>
          {features.map((feature, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <div style={{ marginBottom: '20px', color: '#1a1a2e' }}>{feature.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 500, color: '#1a1a2e', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6, fontWeight: 300 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Newsletter Section ── */
function NewsletterSection() {
  const t = useTranslations('newsletter');
  const tCommon = useTranslations('common');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/v1/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setEmail('');
        toast.success('Subscribed successfully!');
      } else {
        setStatus('error');
        toast.error(data.error || 'Subscription failed');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="section" style={{ background: 'var(--color-primary)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1, mixBlendMode: 'overlay' }} />
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,3rem)', color: 'white', fontWeight: 500, marginBottom: '20px', letterSpacing: '-0.02em' }}>
          {t('title')}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 48px', fontSize: '1rem', fontWeight: 300 }}>
          {t('description')}
        </p>

        {status === 'success' ? (
          <div style={{ display: 'inline-flex', padding: '16px 32px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', fontWeight: 500, alignItems: 'center', justifyContent: 'center', letterSpacing: '0.04em' }}>
            ✓ {t('success')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', maxWidth: '520px', margin: '0 auto', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder={t('placeholder')}
              style={{ flex: 1, minWidth: '200px', padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white', fontSize: '1rem', outline: 'none', backdropFilter: 'blur(4px)' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-secondary btn-lg"
              disabled={status === 'loading'}
              style={{ whiteSpace: 'nowrap' }}
            >
              {status === 'loading' ? t('sending') : tCommon('subscribe')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

// ── Icons ──
function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function SupportIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
}
