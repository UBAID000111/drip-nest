import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Package,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

import { getProducts } from '../services/productService';
import { Product } from '../types';
import { SafeImage } from '../components/common/SafeImage';

const WHATSAPP_NUMBER = '918218167743';

export const WholesalePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const result = await getProducts({
        onlyActive: true,
        limitCount: 100,
        sortBy: 'newest',
      });

      const wholesaleProducts = result.products.filter((product) => {
        const wholesalePrice = Number(product.wholesalePrice);

        return (
          product.status === 'active' &&
          product.wholesalePrice !== null &&
          product.wholesalePrice !== undefined &&
          Number.isFinite(wholesalePrice) &&
          wholesalePrice > 0
        );
      });

      setProducts(wholesaleProducts);
    } catch (err) {
      console.error('Wholesale products loading failed:', err);
      setError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';
      const category = product.categoryName?.toLowerCase() || '';

      return (
        name.includes(term) ||
        description.includes(term) ||
        category.includes(term)
      );
    });
  }, [products, searchTerm]);

  const getMinimumQuantity = (product: Product) => {
    const quantity = Number(product.minimumWholesaleQuantity);

    return Number.isFinite(quantity) && quantity > 0
      ? Math.ceil(quantity)
      : 1;
  };

  const getProductImage = (product: Product): string => {
    const images = product.images;

    if (!images || images.length === 0) return '';

    const firstImage = images[0];

    if (typeof firstImage === 'string') {
      return firstImage;
    }

    return '';
  };

  const getWhatsAppLink = (product: Product) => {
    const message = [
      'Hello DripNest, I am interested in a wholesale order.',
      '',
      `Product: ${product.name}`,
      `Wholesale price: ₹${Number(product.wholesalePrice).toLocaleString('en-IN')}`,
      `Minimum order quantity: ${getMinimumQuantity(product)}`,
      '',
      'Please share availability, bulk pricing and shipping details.',
    ].join('\n');

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="min-h-screen bg-[#F8F5EF] text-[#252A24]">
      {/* Hero */}
      <section className="bg-[#234737] text-[#F8F5EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#D8C8AC] mb-4">
            DripNest Wholesale
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight max-w-3xl">
            Thoughtful products.
            <br />
            Better bulk buying.
          </h1>

          <p className="mt-5 max-w-2xl text-sm sm:text-base lg:text-lg leading-7 text-white/80">
            Discover handcrafted wooden homeware and decor for retailers,
            resellers, businesses and bulk buyers.
          </p>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              'Hello DripNest, I would like to enquire about wholesale orders.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 mt-7 px-6 py-3 rounded-md bg-[#F8F5EF] text-[#234737] font-semibold text-sm hover:bg-white transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Enquire for Bulk Orders
          </a>
        </div>
      </section>

      {/* Product listing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#234737]">
              Wholesale Collection
            </h2>

            <p className="mt-2 text-sm text-[#252A24]/65">
              {loading
                ? 'Loading wholesale products...'
                : `${filteredProducts.length} ${
                    filteredProducts.length === 1 ? 'product' : 'products'
                  } available`}
            </p>
          </div>

          <div className="text-sm text-[#684631]">
            <Package className="inline-block w-4 h-4 mr-1.5" />
            Bulk order enquiries welcome
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#684631]" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search wholesale products..."
            aria-label="Search wholesale products"
            className="w-full rounded-xl border border-[#E8DDCB] bg-white py-4 pl-12 pr-4 text-base outline-none transition focus:border-[#234737] focus:ring-2 focus:ring-[#234737]/10"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[#E8DDCB] bg-white animate-pulse"
              >
                <div className="aspect-square bg-[#EAE5DC]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 rounded bg-[#EAE5DC] w-3/4" />
                  <div className="h-4 rounded bg-[#EAE5DC] w-1/2" />
                  <div className="h-10 rounded bg-[#EAE5DC]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600" />

            <h3 className="mt-4 text-xl font-semibold text-red-700">
              Wholesale products could not be loaded.
            </h3>

            <p className="mt-2 text-sm text-red-600">
              Please check your connection and try again.
            </p>

            <button
              type="button"
              onClick={() => void loadProducts()}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#234737] px-5 py-3 text-white font-medium hover:bg-[#1A3529] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-[#E8DDCB] bg-white px-5 py-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-[#234737]/50" />

            <h3 className="mt-4 font-serif text-2xl text-[#234737]">
              {searchTerm
                ? 'No matching products found'
                : 'Wholesale collection coming soon'}
            </h3>

            <p className="mt-2 text-sm text-[#252A24]/65">
              {searchTerm
                ? 'Try another product name or clear your search.'
                : 'Wholesale prices will appear here when products are configured in the admin panel.'}
            </p>

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-5 text-sm font-semibold text-[#234737] underline underline-offset-4"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Products */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const wholesalePrice = Number(product.wholesalePrice);
              const minimumQuantity = getMinimumQuantity(product);
              const image = getProductImage(product);

              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-[#E8DDCB] bg-white transition-shadow hover:shadow-lg"
                >
                  <Link
                    to={`/product/${product.slug}`}
                    className="relative block aspect-square overflow-hidden bg-[#F1EDE5]"
                    aria-label={`View ${product.name}`}
                  >
                    {image ? (
                      <SafeImage
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-12 w-12 text-[#234737]/30" />
                      </div>
                    )}

                    <span className="absolute left-2 top-2 rounded-full bg-[#234737] px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-white">
                      Wholesale
                    </span>
                  </Link>

                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <p className="mb-1 text-[10px] sm:text-xs uppercase tracking-wider text-[#684631]/75">
                      {product.categoryName || 'DripNest'}
                    </p>

                    <Link
                      to={`/product/${product.slug}`}
                      className="line-clamp-2 min-h-10 text-sm sm:text-base font-semibold text-[#252A24] hover:text-[#234737]"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-3">
                      <p className="text-[10px] sm:text-xs text-[#252A24]/55">
                        Wholesale price
                      </p>

                      <p className="text-xl sm:text-2xl font-semibold text-[#234737]">
                        ₹{wholesalePrice.toLocaleString('en-IN')}
                      </p>

                      <p className="mt-1 text-xs text-[#252A24]/65">
                        Minimum order: {minimumQuantity} units
                      </p>
                    </div>

                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto pt-4"
                    >
                      <span className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#234737] px-2 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#1A3529]">
                        <MessageCircle className="h-4 w-4 shrink-0" />
                        Enquire on WhatsApp
                      </span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Bulk order contact section */}
      <section className="border-t border-[#E8DDCB] bg-[#F1EADF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#234737] text-white">
            <MessageCircle className="h-7 w-7" />
          </div>

          <h2 className="mt-7 font-serif text-3xl sm:text-5xl text-[#234737]">
            Planning a bulk order?
          </h2>

          <p className="mt-5 text-base sm:text-lg leading-8 text-[#252A24]/70">
            Contact DripNest to discuss quantities, product availability,
            shipping and your wholesale requirements.
          </p>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              'Hello DripNest, I would like to discuss a wholesale order. Please share your bulk pricing and availability.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-[#234737] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1A3529]"
          >
            Contact Us on WhatsApp
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
};

export default WholesalePage;