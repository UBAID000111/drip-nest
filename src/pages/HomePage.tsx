import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Star,
  MessageSquarePlus,
  Package,
  MessageCircle,
} from 'lucide-react';

import { Product, Category, Review, StoreSettings } from '../types';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { getApprovedReviews } from '../services/reviewService';
import { getStoreSettings } from '../services/settingsService';

import { ProductGrid } from '../components/shop/ProductGrid';
import { FilterBar } from '../components/shop/FilterBar';
import { ProductDetailModal } from '../components/shop/ProductDetailModal';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { ReviewFormModal } from '../components/reviews/ReviewFormModal';
import { SafeImage } from '../components/common/SafeImage';
import { Seo } from '../components/common/Seo';

// Category fallback images
const CATEGORY_IMAGES: Record<string, string> = {
  'kitchen-and-home-accessories':
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',

  drinkware:
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80',

  dining:
    'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=800&q=80',

  'home-decor':
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',

  accessories:
    'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
};

// Hero and brand story images
const CRAFT_IMAGES = {
  artisanalLiving:
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=85',

  woodcraft:
    'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85',
};

const getCategoryImage = (category: Category): string => {
  return (
    category.imageUrl ||
    CATEGORY_IMAGES[category.slug] ||
    CATEGORY_IMAGES[category.id] ||
    CATEGORY_IMAGES['home-decor']
  );
};

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [productError, setProductError] = useState<string | null>(null);

  // Product filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'newest' | 'priceAsc' | 'priceDesc' | 'name'
  >('newest');

  const [onlyInStock, setOnlyInStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const collectionRef = useRef<HTMLDivElement>(null);
  const craftRef = useRef<HTMLDivElement>(null);

  // Load initial store data
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [loadedSettings, loadedCats] = await Promise.all([
          getStoreSettings(),
          getCategories(true),
        ]);

        setSettings(loadedSettings);

        // Display default categories if Firestore has none
        if (loadedCats.length === 0) {
          const defaultCats: Category[] = [
            {
              id: 'kitchen-and-home-accessories',
              name: 'Kitchen and Home Accessories',
              slug: 'kitchen-and-home-accessories',
              description:
                'Artisanal wooden cutting boards, tissue holders, knife blocks, and natural kitchen storage designed for daily utility.',
              sortOrder: 1,
              active: true,
            },
            {
              id: 'drinkware',
              name: 'Drinkware',
              slug: 'drinkware',
              description:
                'Sculpted wooden tumblers, coasters, artisanal tea saucers, and drinking vessels handcrafted with natural walnut & teak.',
              sortOrder: 2,
              active: true,
            },
            {
              id: 'dining',
              name: 'Dining',
              slug: 'dining',
              description:
                'Hand-carved wooden platters, salad servers, dining bowls, and textured centerpieces that elevate every meal.',
              sortOrder: 3,
              active: true,
            },
            {
              id: 'home-decor',
              name: 'Home Decor',
              slug: 'home-decor',
              description:
                'Organic wooden candle stands, decorative sculptures, pedestal risers, and handcrafted accents bringing nature into your living spaces.',
              sortOrder: 4,
              active: true,
            },
            {
              id: 'accessories',
              name: 'Accessories',
              slug: 'accessories',
              description:
                'Catch-all trays, minimalist desk organizers, keepsake boxes, and wooden accents created for refined living.',
              sortOrder: 5,
              active: true,
            },
          ];

          setCategories(defaultCats);
        } else {
          setCategories(loadedCats);
        }

        // Load approved reviews
        const reviewData = await getApprovedReviews();

        setReviews(reviewData.reviews.slice(0, 3));
        setAverageRating(reviewData.averageRating);
        setTotalReviews(reviewData.totalReviews);
      } catch (err) {
        console.warn('Initial data loading note:', err);
      }
    }

    loadInitialData();
  }, []);

  // Fetch products when filters change
  const fetchProductList = async (isNewQuery = true) => {
    if (isNewQuery) {
      setLoadingProducts(true);
      setProductError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await getProducts({
        categoryId:
          selectedCategory === 'all' ? undefined : selectedCategory,
        sortBy,
        limitCount: 12,
        lastVisibleDoc: isNewQuery ? null : lastVisible,
        onlyActive: true,
        searchTerm: searchTerm.trim() || undefined,
      });

      let fetched = res.products;

      if (onlyInStock) {
        fetched = fetched.filter((product) => product.stockQuantity > 0);
      }

      if (isNewQuery) {
        setProducts(fetched);
      } else {
        setProducts((previous) => [...previous, ...fetched]);
      }

      setLastVisible(res.lastVisible);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProductError('Unable to load collection from Firestore.');
    } finally {
      setLoadingProducts(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProductList(true);
  }, [selectedCategory, sortBy, onlyInStock, searchTerm]);

  const scrollToCollection = () => {
    collectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCraft = () => {
    craftRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const heroHeadline =
    settings?.homepage?.heroHeadline || 'Nature, Crafted for Your Home.';

  const heroSubtitle =
    settings?.homepage?.heroSubtitle ||
    'Thoughtfully handcrafted wooden essentials that bring warmth, character, and timeless beauty to everyday living.';

  const primaryCtaText =
    settings?.homepage?.primaryCtaText || 'Explore the Collection';

  const secondaryCtaText =
    settings?.homepage?.secondaryCtaText || 'Discover Our Craft';

  return (
    <div className="space-y-20 sm:space-y-28">
      <Seo
        title="Wooden Handicrafts & Home Decor Online India | DripNest Decor"
        description="Shop handcrafted wooden handicraft items, wooden home decor, roti boxes, serving trays and kitchen essentials. Handmade in India by DripNest Decor."
        path="/"
      />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#F8F5EF] pt-8 sm:pt-14 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Editorial Headline & Actions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#684631]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Handcrafted Homeware & Living</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#234737] leading-[1.12] text-balance">
                {heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-[#252A24]/80 leading-relaxed max-w-xl">
                {heroSubtitle}
              </p>

              {/* Call-to-action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  type="button"
                  onClick={scrollToCollection}
                  className="px-7 py-3.5 bg-[#234737] text-[#F8F5EF] text-xs uppercase tracking-widest font-semibold rounded-md hover:bg-[#1A3529] transition-all shadow-xs flex items-center justify-center gap-2.5 group"
                >
                  <span>{primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={scrollToCraft}
                  className="px-6 py-3.5 border border-[#234737] text-[#234737] hover:bg-[#234737]/5 text-xs uppercase tracking-widest font-semibold rounded-md transition-colors text-center"
                >
                  {secondaryCtaText}
                </button>
              </div>

              {/* Craft Highlights */}
              <div className="pt-6 border-t border-[#EFE6D7] grid grid-cols-3 gap-4 text-xs text-[#252A24]/70">
                <div>
                  <span className="block font-serif text-base font-semibold text-[#234737]">
                    100% Solid
                  </span>
                  <span>Natural Hardwood</span>
                </div>

                <div>
                  <span className="block font-serif text-base font-semibold text-[#234737]">
                    Food-Safe
                  </span>
                  <span>Natural Finishes</span>
                </div>

                <div>
                  <span className="block font-serif text-base font-semibold text-[#234737]">
                    Enduring
                  </span>
                  <span>Tactile Living</span>
                </div>
              </div>
            </div>

            {/* Hero Image: Artisanal Wooden Living */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-xl overflow-hidden shadow-xl border border-[#EFE6D7] bg-[#EFE6D7]">
                <SafeImage
                  src={
                    settings?.homepage?.heroImageUrl ||
                    CRAFT_IMAGES.artisanalLiving
                  }
                  alt="Artisanal Wooden Living — handcrafted wooden trays, tumblers and tableware"
                  fallbackText="Artisanal Wooden Living"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/90 backdrop-blur-md rounded-lg border border-white/40 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-semibold text-[#234737]">
                      Artisanal Wooden Living
                    </span>
                    <span className="text-[11px] text-[#252A24]/70">
                      Trays · Drinkware · Dining · Accents
                    </span>
                  </div>

                  <Link
                    to="/shop"
                    className="text-xs font-semibold text-[#684631] hover:text-[#234737] inline-flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-1">
              Curated Taxonomy
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#234737]">
              Explore by Category
            </h2>
          </div>

          <Link
            to="/shop"
            className="text-xs uppercase tracking-wider font-semibold text-[#234737] hover:text-[#684631] inline-flex items-center gap-1.5"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group cursor-pointer bg-white border border-[#EFE6D7] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] bg-[#EFE6D7] overflow-hidden">
                <img
                  src={getCategoryImage(cat)}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(event) => {
                    const image = event.currentTarget;
                    image.onerror = null;
                    image.src = CATEGORY_IMAGES['home-decor'];
                  }}
                />
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#252A24] group-hover:text-[#234737] transition-colors leading-snug">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-[#252A24]/70 mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F8F5EF] flex items-center justify-between text-xs font-semibold text-[#234737]">
                  <span>Shop Category</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Product Collection */}
      <section
        ref={collectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4"
      >
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block">
            Crafted for Everyday Living
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#234737]">
            Made for Everyday Living
          </h2>

          <p className="text-sm sm:text-base text-[#252A24]/75">
            Explore wooden essentials designed to add warmth and character to
            your home.
          </p>
        </div>

        <FilterBar
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onlyInStock={onlyInStock}
          onToggleInStock={setOnlyInStock}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <ProductGrid
          products={products}
          loading={loadingProducts}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={() => fetchProductList(false)}
          error={productError}
          onRetry={() => fetchProductList(true)}
          onProductClick={(product) => setSelectedProduct(product)}
        />
      </section>

      {/* 4. Wholesale Collection Banner */}
      <section className="mx-4 sm:mx-6 lg:mx-auto max-w-7xl overflow-hidden rounded-2xl border border-[#DED3C1] bg-[#EFE6D7]/60">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Wholesale Content */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#D8C8AC] bg-white/70 px-3 py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-[#684631]">
              <Package className="h-4 w-4" />
              <span>For Retailers & Bulk Buyers</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-[#234737]">
              Buying in Bulk?
              <br />
              <span className="italic">Let's Grow Together.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm sm:text-base leading-7 text-[#252A24]/75">
              Discover the DripNest Wholesale Collection. Explore special
              wholesale prices on selected wooden homeware, handcrafted
              essentials and decor for your business.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs sm:text-sm text-[#234737]">
              <div className="flex items-start gap-2">
                <Package className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Bulk order enquiries</span>
              </div>

              <div className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Direct WhatsApp support</span>
              </div>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                to="/wholesale"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#234737] px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#F8F5EF] transition-colors hover:bg-[#1A3529]"
              >
                Explore Wholesale
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={`https://wa.me/918218167743?text=${encodeURIComponent(
                  'Hello DripNest, I am interested in wholesale and bulk orders. Please share product availability and pricing.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#234737] px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#234737] transition-colors hover:bg-white/60"
              >
                <MessageCircle className="h-4 w-4" />
                Enquire Now
              </a>
            </div>

            <p className="mt-4 text-xs text-[#252A24]/55">
              Wholesale prices and minimum order quantities vary by product.
            </p>
          </div>

          {/* Wholesale Visual */}
          <div className="relative min-h-[240px] sm:min-h-[340px] lg:min-h-full bg-[#D8C8AC]">
            <SafeImage
              src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=85"
              alt="Natural wooden homeware and decor for wholesale buyers"
              fallbackText="DripNest Wholesale Collection"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#172D22]/70 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/80">
                DripNest Business
              </p>
              <p className="mt-2 font-serif text-2xl sm:text-3xl text-white">
                Thoughtful Products.
                <br />
                Better Bulk Buying.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Brand Story: DripNest Woodcraft & Timeless Living */}
      <section
        ref={craftRef}
        className="bg-[#EFE6D7]/50 border-y border-[#EFE6D7] py-16 sm:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Woodcraft Story Image */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-[#DED3C1] bg-[#EFE6D7]">
                <SafeImage
                  src={CRAFT_IMAGES.woodcraft}
                  alt="DripNest Woodcraft & Timeless Living — handcrafted wooden home accessories"
                  fallbackText="DripNest Woodcraft & Timeless Living"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/90 backdrop-blur-md rounded-lg border border-white/40 shadow-xs">
                  <span className="block text-xs font-semibold text-[#234737]">
                    DripNest Woodcraft
                  </span>
                  <span className="text-[11px] text-[#252A24]/70">
                    Timeless Living · Natural Character
                  </span>
                </div>
              </div>
            </div>

            {/* Story Text */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block">
                Our Craft Philosophy
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#234737] leading-tight">
                {settings?.homepage?.brandStoryHeading ||
                  'Everyday Objects. Natural Character.'}
              </h2>

              <p className="text-base text-[#252A24]/80 leading-relaxed">
                {settings?.homepage?.brandStoryContent ||
                  'At DripNest, we honor the organic character of wood. Each handcrafted piece carries distinct grain variations, tactile warmth, and balanced form designed to bring calm and beauty to everyday routines—from mindful morning coffee to shared family dinners.'}
              </p>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#234737] hover:text-[#684631] transition-colors"
                >
                  <span>Read More About Our Craft</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-1">
              Customer Experiences
            </span>

            <div className="flex items-center gap-3">
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#234737]">
                Words of Warmth
              </h2>

              {totalReviews > 0 && (
                <div className="flex items-center gap-1 bg-white border border-[#EFE6D7] px-2.5 py-1 rounded-md text-xs">
                  <Star className="w-3.5 h-3.5 fill-[#684631] text-[#684631]" />

                  <span className="font-bold tabular-nums text-[#234737]">
                    {averageRating}
                  </span>

                  <span className="text-[#252A24]/60">
                    ({totalReviews})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>

            <Link
              to="/reviews"
              className="text-xs uppercase tracking-wider font-semibold text-[#234737] hover:underline"
            >
              All Reviews
            </Link>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white border border-[#EFE6D7] rounded-xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center mx-auto">
              <Star className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-semibold text-[#234737]">
              Be the First to Share Your Experience
            </h3>

            <p className="text-sm text-[#252A24]/75">
              Have you welcomed DripNest handcrafted wooden homeware into your
              space? We would love to hear how it feels in your daily living.
            </p>

            <div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="px-6 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] transition-colors"
              >
                Submit First Review
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>

      {/* Review Submission Modal */}
      <ReviewFormModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onReviewSubmitted={async () => {
          const reviewData = await getApprovedReviews();
          setReviews(reviewData.reviews.slice(0, 3));
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};