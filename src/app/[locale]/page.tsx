'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import QuickViewModal from '@/components/QuickViewModal';
import { toggleWishlist, isInWishlist } from '@/lib/wishlist';



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
  variants: { stock: number }[];
}

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewSlug, setQuickViewSlug] = useState<string | null>(null);

  const localePath = (path: string) => `/${locale}${path}`;

  useEffect(() => {
    fetchHomeData();
  }, []);

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
    <div className="min-h-screen flex flex-col">
      <QuickViewModal productSlug={quickViewSlug} onClose={() => setQuickViewSlug(null)} />

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center bg-cover bg-center overflow-hidden pt-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e]/90 via-[#1a1a2e]/70 to-[#1a1a2e]/40 z-0"></div>
        <div className="container relative z-10 max-w-[1400px] mx-auto px-6">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 bg-[#c9a959] text-[#1a1a2e] text-xs font-bold uppercase tracking-[0.1em] rounded-full mb-6">
              {t('home.heroSubtitle')}
            </span>
            <h1 className="font-display text-white text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              {t('home.heroTitle').split(' ').slice(0, 2).join(' ')}<br />
              {t('home.heroTitle').split(' ').slice(2).join(' ')}
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
              {t('home.heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={localePath('/products')}
                className="inline-flex items-center justify-center px-8 py-4 bg-[#c9a959] text-[#1a1a2e] font-bold rounded-lg hover:bg-[#d4b86a] hover:shadow-[0_0_20px_rgba(201,169,89,0.3)] transition-all duration-300"
                style={{ textDecoration: 'none' }}
              >
                {t('home.shopNow')}
              </Link>
              <Link
                href={localePath('/categories')}
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-[#1a1a2e] transition-all duration-300"
                style={{ textDecoration: 'none' }}
              >
                {t('home.exploreCategories')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24">
        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-[#c9a959] text-xs font-bold uppercase tracking-[0.15em] mb-2">
              {t('home.explore')}
            </span>
            <h2 className="font-display text-[#1a1a2e] text-3xl md:text-4xl lg:text-5xl font-bold">
              {t('home.shopByCategory')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="aspect-square bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-pulse rounded-2xl" />
              ))
            ) : (
              categories.slice(0, 4).map((category) => (
                <CategoryCard key={category.id} category={category} locale={locale} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-[#f7f5f2]">
        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-[#c9a959] text-xs font-bold uppercase tracking-[0.15em] mb-2">
              {t('home.curatedSelection')}
            </span>
            <h2 className="font-display text-[#1a1a2e] text-3xl md:text-4xl lg:text-5xl font-bold">
              {t('home.featuredCollection')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  onQuickView={() => setQuickViewSlug(product.slug)}
                />
              ))
            )}
          </div>
          <div className="text-center mt-16">
            <Link
              href={localePath('/products')}
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-[#1a1a2e] text-[#1a1a2e] font-bold rounded-lg hover:bg-[#1a1a2e] hover:text-white transition-all duration-300"
              style={{ textDecoration: 'none' }}
            >
              {t('home.viewAllProducts')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <FeaturesSection />

      {/* Newsletter */}
      <NewsletterSection />

      {/* Footer */}
      <Footer locale={locale} />
    </div>
  );
}

function CategoryCard({ category, locale }: { category: Category; locale: string }) {
  const t = useTranslations('home');
  return (
    <Link
      href={`/${locale}/products?category=${category.slug}`}
      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer block"
      style={{ textDecoration: 'none' }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 transition-all duration-300 group-hover:from-black/80 group-hover:via-black/30"></div>
      <Image
        src={category.image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600'}
        alt={category.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-display text-2xl font-bold mb-1 drop-shadow-md">{category.name}</h3>
        <span className="text-sm text-white/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
          {t('viewCollection')} &rarr;
        </span>
      </div>
    </Link>
  );
}

function ProductCard({ product, locale, onQuickView }: { product: Product; locale: string; onQuickView: () => void }) {
  const t = useTranslations('common');
  const [inWishlist, setInWishlist] = useState(false);

  const price = Number(product.price);
  const comparePrice = Number(product.comparePrice);
  const hasDiscount = comparePrice > price;
  const discountPercent = hasDiscount ? Math.round((1 - price / comparePrice) * 100) : 0;

  useEffect(() => {
    setInWishlist(isInWishlist(product.id));
    const handleUpdate = () => setInWishlist(isInWishlist(product.id));
    window.addEventListener('wishlistUpdated', handleUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleUpdate);
  }, [product.id]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: price,
      image: product.images[0]?.standardUrl || '',
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView();
  };

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 block"
      style={{ textDecoration: 'none' }}
    >
      <div className="relative aspect-square overflow-hidden bg-[#f7f5f2]">
        <Image
          src={product.images[0]?.standardUrl || 'https://via.placeholder.com/400'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {hasDiscount && (
          <span className="absolute top-4 left-4 px-2 py-1 bg-[#c9a959] text-[10px] sm:text-xs font-bold text-[#1a1a2e] rounded-md shadow-sm z-10">
            -{discountPercent}%
          </span>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={handleWishlistClick}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${inWishlist
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-white text-[#1a1a2e] hover:bg-gray-50 hover:text-[#c9a959]'
              }`}
            aria-label="Add to wishlist"
          >
            <HeartIcon filled={inWishlist} />
          </button>
          <button
            onClick={handleQuickView}
            className="w-10 h-10 bg-white text-[#1a1a2e] rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 hover:text-[#c9a959] transition-colors"
            aria-label="Quick view"
          >
            <EyeIcon />
          </button>
        </div>
      </div>

      <div className="p-6">
        <span className="block text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mb-1">
          {product.category?.name}
        </span>
        <h3 className="font-display text-lg font-bold text-gray-900 mb-2 truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#c9a959]">
            {price.toLocaleString()} {t('egp')}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {comparePrice.toLocaleString()} {t('egp')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="aspect-square bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-pulse" />
      <div className="p-6">
        <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

function FeaturesSection() {
  const t = useTranslations('features');
  const features = [
    { icon: <TruckIcon />, title: t('freeShipping'), description: t('freeShippingDesc') },
    { icon: <ShieldIcon />, title: t('warranty'), description: t('warrantyDesc') },
    { icon: <RefreshIcon />, title: t('returns'), description: t('returnsDesc') },
    { icon: <SupportIcon />, title: t('support'), description: t('supportDesc') },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="text-center p-8 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-6 bg-[#f7f5f2] rounded-full flex items-center justify-center text-[#c9a959]">
                {feature.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const t = useTranslations('newsletter');
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
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-24 bg-[#1a1a2e] text-center">
      <div className="container max-w-[1400px] mx-auto px-6">
        <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">
          {t('title')}
        </h2>
        <p className="text-white/70 max-w-lg mx-auto mb-10 text-lg">
          {t('description')}
        </p>

        {status === 'success' ? (
          <div className="inline-flex py-4 px-6 bg-emerald-500/20 text-emerald-400 rounded-xl font-medium items-center justify-center">
            ✓ {t('success')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder={t('placeholder')}
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:border-[#c9a959] focus:ring-1 focus:ring-[#c9a959] transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-[#c9a959] text-[#1a1a2e] font-bold rounded-xl hover:bg-[#d4b86a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? t('sending') : t.raw('subscribe') || 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  return (
    <footer className="bg-[#0f0f1a] pt-24 pb-12">
      <div className="container max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <h3 className="font-display text-2xl text-white font-bold mb-6 tracking-tight">
              {locale === 'ar' ? 'فيرنتشر' : 'FURNITURE'}<span className="text-[#c9a959]">.</span>
            </h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {t('description')}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">{tNav('quickLinks')}</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: tCommon('shop'), href: '/products' },
                { label: tCommon('categories'), href: '/categories' },
                { label: tCommon('about'), href: '/about' },
                { label: tCommon('contact'), href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={`/${locale}${link.href}`} className="text-white/60 hover:text-[#c9a959] text-sm transition-colors" style={{ textDecoration: 'none' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">{tNav('customerService')}</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: tNav('faq'), href: '/faq' },
                { label: tNav('shipping'), href: '/shipping' },
                { label: tNav('returns'), href: '/returns' },
                { label: tNav('trackOrder'), href: '/track' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={`/${locale}${link.href}`} className="text-white/60 hover:text-[#c9a959] text-sm transition-colors" style={{ textDecoration: 'none' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">{tNav('contactInfo')}</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex gap-3 text-white/60 text-sm">
                <span className="text-xl">📍</span>
                <span>{t('address')}</span>
              </li>
              <li className="flex gap-3 text-white/60 text-sm">
                <span className="text-xl">📞</span>
                <span>{t('phone')}</span>
              </li>
              <li className="flex gap-3 text-white/60 text-sm">
                <span className="text-xl">✉️</span>
                <span>{t('email')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            {t('copyright')}
          </p>
          <div className="flex gap-4">
            <span className="text-white/40 text-xs font-bold tracking-widest uppercase border border-white/20 px-3 py-1 rounded-md">
              Secure Checkout by Paymob
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Icons
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
