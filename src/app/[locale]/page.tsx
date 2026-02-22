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
      <section className="relative min-h-[90vh] flex items-center bg-[#f7f5f2] overflow-hidden pt-20">
        <div className="container max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div className="max-w-2xl animate-fade-in-up order-2 lg:order-1 pb-16 lg:pb-0">
              <span className="inline-block px-4 py-1.5 bg-[#c9a959]/10 text-[#c9a959] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] rounded-full mb-8">
                {t('home.heroSubtitle')}
              </span>
              <h1 className="font-display text-[#1a1a2e] text-4xl md:text-5xl lg:text-7xl font-medium leading-[1.1] mb-6 tracking-tight">
                {t('home.heroTitle').split(' ').slice(0, 2).join(' ')}<br />
                <span className="text-gray-500 italic font-light">{t('home.heroTitle').split(' ').slice(2).join(' ')}</span>
              </h1>
              <p className="text-gray-600 text-base md:text-lg mb-10 max-w-lg leading-relaxed font-light">
                {t('home.heroDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Link
                  href={localePath('/products')}
                  className="inline-flex items-center justify-center px-10 py-4 bg-[#1a1a2e] text-white text-sm tracking-wide uppercase font-medium rounded-none hover:bg-[#c9a959] transition-all duration-500 w-full sm:w-auto"
                >
                  {t('home.shopNow')}
                </Link>
                <Link
                  href={localePath('/categories')}
                  className="inline-flex items-center justify-center text-[#1a1a2e] text-sm tracking-wide uppercase font-medium hover:text-[#c9a959] transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[1px] after:bg-[#c9a959] after:scale-x-0 origin-left hover:after:scale-x-100 after:transition-transform after:duration-300"
                >
                  {t('home.exploreCategories')}
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative aspect-[4/3] lg:aspect-[3/4] w-full order-1 lg:order-2">
              <div className="absolute inset-0 bg-[#c9a959]/5 rounded-bl-[100px] transform translate-x-4 translate-y-4"></div>
              <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80"
                alt="Premium Sofa"
                fill
                className="object-cover rounded-bl-[100px] shadow-2xl"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
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
      className="group relative aspect-[4/5] overflow-hidden cursor-pointer block"
      style={{ textDecoration: 'none' }}
    >
      <div className="absolute inset-0 bg-black/20 z-10 transition-colors duration-700 group-hover:bg-black/40"></div>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-80"></div>
      <Image
        src={category.image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600'}
        alt={category.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 z-20 text-white flex flex-col justify-end h-full">
        <h3 className="font-display text-2xl md:text-3xl font-medium mb-3 tracking-wide">{category.name}</h3>
        <div className="overflow-hidden">
          <span className="inline-block text-xs uppercase tracking-widest font-semibold border-b border-white/30 pb-1 transform translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            {t('viewCollection')}
          </span>
        </div>
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
      className="group block"
      style={{ textDecoration: 'none' }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f7f5f2] mb-6">
        <Image
          src={product.images[0]?.standardUrl || 'https://via.placeholder.com/400'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-95"
        />

        {hasDiscount && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-[#c9a959]/10 text-[#c9a959] text-[10px] font-bold uppercase tracking-widest z-10">
            -{discountPercent}%
          </span>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-75 z-10">
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

      <div className="flex flex-col items-center text-center">
        <span className="block text-[10px] text-gray-500 uppercase tracking-[0.15em] mb-2">
          {product.category?.name}
        </span>
        <h3 className="font-display text-lg font-medium text-[#1a1a2e] mb-2 transition-colors group-hover:text-[#c9a959]">
          {product.name}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">
            {price.toLocaleString()} {t('egp')}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
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
    <div className="block">
      <div className="aspect-[4/5] bg-[#f7f5f2] animate-pulse mb-6" />
      <div className="flex flex-col items-center">
        <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
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
    <section className="py-24 md:py-32 bg-white border-y border-gray-100">
      <div className="container max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {features.map((feature, i) => (
            <div key={i} className={`pt-8 sm:pt-0 ${i !== 0 ? 'sm:pl-8 lg:pl-12' : ''} flex flex-col items-start`}>
              <div className="mb-6 text-[#1a1a2e]">
                {feature.icon}
              </div>
              <h3 className="font-display text-lg font-medium text-[#1a1a2e] mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-light">
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
    <section className="py-24 md:py-32 bg-[#1a1a2e] text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
        <h2 className="font-display text-3xl md:text-5xl text-white font-medium mb-6 tracking-tight">
          {t('title')}
        </h2>
        <p className="text-white/70 max-w-lg mx-auto mb-12 text-base md:text-lg font-light">
          {t('description')}
        </p>

        {status === 'success' ? (
          <div className="inline-flex py-4 px-8 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-none font-medium items-center justify-center tracking-wide">
            ✓ {t('success')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-xl mx-auto">
            <input
              type="email"
              placeholder={t('placeholder')}
              className="flex-1 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 rounded-none rounded-t-xl sm:rounded-tr-none sm:rounded-l-xl focus:outline-none focus:border-[#c9a959] focus:bg-white/10 transition-all font-light"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-10 py-4 bg-[#c9a959] text-[#1a1a2e] font-medium tracking-wide uppercase text-sm rounded-none rounded-b-xl sm:rounded-bl-none sm:rounded-r-xl hover:bg-[#d4b86a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
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
    <footer className="bg-[#0a0a14] pt-24 pb-12">
      <div className="container max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
          <div className="lg:col-span-2 pr-0 lg:pr-12">
            <h3 className="font-display text-3xl text-white font-medium mb-8 tracking-tight">
              {locale === 'ar' ? 'فيرنتشر' : 'FURNITURE'}<span className="text-[#c9a959]">.</span>
            </h3>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm font-light">
              {t('description')}
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-8 tracking-wide uppercase text-xs">{tNav('quickLinks')}</h4>
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

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/30 text-xs font-light">
            {t('copyright')}
          </p>
          <div className="flex gap-6 items-center">
            <span className="text-white/30 text-[10px] font-medium tracking-[0.2em] uppercase">
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
