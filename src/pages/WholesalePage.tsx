
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Package,
  Search,
  ShoppingBag,
  MessageCircle,
  Truck,
  BadgePercent,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Product } from '../types';
import { getProducts } from '../services/productService';
import { SafeImage } from '../components/common/SafeImage';

const WHATSAPP_NUMBER = '918218167743';

export const WholesalePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const result = await getProducts();

        if (cancelled) return;

        const wholesaleProducts = result.filter(
          (product) =>
            product.status === 'active' &&
            typeof product.wholesalePrice === 'number' &&
            product.wholesalePrice > 0
        );

        setProducts(wholesaleProducts);
      } catch (err) {
        console.error('Failed to load wholesale products:', err);

        if (!cancelled) {
          setError(
            'Wholesale products could not be loaded. Please try again later.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  const getWhatsAppLink = (product: Product) => {
    const quantity = product.minimumWholesaleQuantity ?? 1;

    const message = [
      'Hello DripNest, I am interested in wholesale purchasing.',
      '',
      `Product: ${product.name}`,
      `Wholesale price shown: ${formatPrice(product.wholesalePrice!)}`,
      `Minimum quantity: ${quantity} pieces`,
      `Product link: ${window.location.origin}/product/${product.slug}`,
      '',
      'Please share bulk order details and shipping information.',
    ].join('\n');

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="min-h-screen bg-[#F8F5EF] text-[#252A24]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#234737] text-[#F8F5EF]">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-12 w-80 h-80 rounded-full border border-white" />
          <div className="absolute -top-12 -right-0 w-60 h-60 rounded-full border border-white" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full border border-white" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#D7C6A4] font-semibold">
              <BadgePercent className="w-4 h-4" />
              DripNest Wholesale
            </span>

            <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight">
              Beautiful craftsmanship.
              <span className="block text-[#D7C6A4]">
                Better bulk pricing.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7 text-white/75">
              Discover wooden homeware and handcrafted products at our listed
              wholesale rates. Explore products, check minimum order quantities,
              and contact us for bulk order assistance.
            </p>

            <a
              href="#wholesale-products"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#F8F5EF] px-5 py-3 text-sm font-semibold text-[#234737] hover:bg-white transition-colors"
            >
              Explore Wholesale Products
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-white/15 bg-white/5 rounded-lg p-4">
              <Package className="w-5 h-5 text-[#D7C6A4]" />
              <h2 className="mt-3 text-sm font-semibold">Bulk Orders</h2>
              <p className="mt-1 text-xs leading-5 text-white/65">
                Minimum quantities shown for eligible products.
              </p>
            </div>

            <div className="border border-white/15 bg-white/5 rounded-lg p-4">
              <BadgePercent className="w-5 h-5 text-[#D7C6A4]" />
              <h2 className="mt-3 text-sm font-semibold">Listed Wholesale Rates</h2>
              <p className="mt-1 text-xs leading-5 text-white/65">
                View the wholesale price set for each product.
              </p>
            </div>

            <div className="border border-white/15 bg-white/5 rounded-lg p-4">
              <Truck className="w-5 h-5 text-[#D7C6A4]" />
              <h2 className="mt-3 text-sm font-semibold">Bulk Order Assistance</h2>
              <p className="mt-1 text-xs leading-5 text-white/65">
                Contact us to discuss delivery and order details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product listing */}
      <section
        id="wholesale-products"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#684631]">
              Bulk buyer collection
            </p>

            <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[#234737]">
              Wholesale Products
            </h2>

            <p className="mt-2 text-sm text-[#252A24]/65">
              Explore products with wholesale pricing available.
            </p>
          </div>

          <div className="text-xs text-[#252A24]/60">
            {loading
              ? 'Loading products...'
              : `${filteredProducts.length} products available`}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-xl relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#684631]" />

          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wholesale products..."
            aria-label="Search wholesale products"
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#EFE6D7] rounded-md text-sm focus:outline-none focus:border-[#234737]"
          />
        </div>

        {loading && (
          <div className="py-20 flex flex-col items-center text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#234737]" />
            <p className="mt-4 text-sm text-[#252A24]/60">
              Loading wholesale collection...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="py-12 px-5 bg-red-50 border border-red-200 rounded-lg text-center">
            <AlertCircle className="w-7 h-7 text-red-600 mx-auto" />
            <p className="mt-3 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-md bg-[#234737] text-white text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="py-16 px-5 text-center border border-dashed border-[#D8CCB9] rounded-xl">
            <ShoppingBag className="w-10 h-10 mx-auto text-[#684631]/50" />

            <h3 className="mt-4 font-serif text-xl text-[#234737]">
              {searchQuery
                ? 'No matching products found'
                : 'Wholesale collection coming soon'}
            </h3>

            <p className="mt-2 max-w-md mx-auto text-sm leading-6 text-[#252A24]/65">
              {searchQuery
                ? 'Try another product name or category.'
                : 'Wholesale prices have not been added to any active products yet. Please check back soon.'}
            </p>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-5 text-sm font-semibold text-[#234737] underline underline-offset-4"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => {
              const wholesalePrice = product.wholesalePrice!;
              const minimumQuantity =
                product.minimumWholesaleQuantity ?? 1;

              return (
                <article
                  key={product.id}
                  className="group bg-white border border-[#EFE6D7] rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
                >
                  <Link
                    to={`/product/${product.slug}`}
                    className="relative block aspect-[4/5] bg-[#EFE6D7]/40 overflow-hidden"
                  >
                    {product.images?.[0] ? (
                      <SafeImage
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-[#684631]/40" />
                      </div>
                    )}

                    <span className="absolute top-2 left-2 px-2 py-1 rounded bg-[#234737] text-white text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold">
                      Wholesale
                    </span>
                  </Link>

                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-[#684631]/80">
                      {product.categoryName}
                    </p>

                    <Link to={`/product/${product.slug}`}>
                      <h3 className="mt-1.5 font-serif text-sm sm:text-base leading-snug text-[#234737] line-clamp-2 hover:underline underline-offset-4">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#252A24]/55">
                        Wholesale price / piece
                      </p>

                      <p className="mt-0.5 text-lg sm:text-xl font-semibold text-[#234737] tabular-nums">
                        {formatPrice(wholesalePrice)}
                      </p>

                      {typeof product.price === 'number' && (
                        <p className="mt-1 text-xs text-[#252A24]/55">
                          Retail: {formatPrice(product.price)}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 px-2.5 py-2 rounded-md bg-[#F8F5EF] text-xs text-[#252A24]/75">
                      Minimum order:{' '}
                      <span className="font-semibold text-[#234737]">
                        {minimumQuantity} {minimumQuantity === 1 ? 'piece' : 'pieces'}
                      </span>
                    </div>

                    <div className="mt-auto pt-4 flex flex-col gap-2">
                      <a
                        href={getWhatsAppLink(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-md bg-[#234737] text-white text-xs sm:text-sm font-semibold hover:bg-[#1A3529] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Enquire on WhatsApp
                      </a>

                      <Link
                        to={`/product/${product.slug}`}
                        className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-semibold text-[#234737] border border-[#EFE6D7] rounded-md hover:bg-[#F8F5EF] transition-colors"
                      >
                        View Product
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Wholesale enquiry CTA */}
      <section className="bg-[#EFE6D7]/60 border-t border-[#EFE6D7]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#234737] text-[#F8F5EF]">
            <MessageCircle className="w-5 h-5" />
          </span>

          <h2 className="mt-5 font-serif text-3xl text-[#234737]">
            Planning a bulk order?
          </h2>

          <p className="mt-3 max-w-xl mx-auto text-sm leading-6 text-[#252A24]/70">
            Contact DripNest to discuss quantities, product availability,
            shipping and your wholesale requirements.
          </p>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              'Hello DripNest, I would like to enquire about wholesale and bulk purchasing.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#234737] text-white rounded-md text-sm font-semibold hover:bg-[#1A3529] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Wholesale Team
          </a>
        </div>
      </section>
    </main>
  );
};
