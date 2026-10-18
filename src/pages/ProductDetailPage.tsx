import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  Check,
  ShieldAlert,
  Sparkles,
  Star,
  MessageSquarePlus,
} from 'lucide-react';

import { Product, Review } from '../types';
import {
  getProductBySlug,
  getRelatedProducts,
} from '../services/productService';
import { getApprovedReviews } from '../services/reviewService';
import { useCart } from '../context/CartContext';
import { SafeImage } from '../components/common/SafeImage';
import { ProductCard } from '../components/shop/ProductCard';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { ReviewFormModal } from '../components/reviews/ReviewFormModal';
import {
  createProductOrderWhatsAppUrl,
  WhatsAppIcon,
  ORDER_WHATSAPP_PHONE,
} from '../utils/whatsapp';

const SITE_URL = 'https://dripnest.site';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!slug) {
        setProduct(null);
        setError('Product not found in the DripNest catalog.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setProduct(null);
      setSelectedImageIndex(0);
      setQuantity(1);
      setAddedMessage(null);

      try {
        const prod = await getProductBySlug(slug);

        if (cancelled) return;

        if (!prod) {
          setError('Product not found in the DripNest catalog.');
          setLoading(false);
          return;
        }

        setProduct(prod);

        const [related, reviewData] = await Promise.all([
          getRelatedProducts(prod.categoryId, prod.id, 4),
          getApprovedReviews(prod.id),
        ]);

        if (cancelled) return;

        setRelatedProducts(related);
        setProductReviews(reviewData.reviews);
        setAverageRating(reviewData.averageRating);
        setTotalReviews(reviewData.totalReviews);
      } catch (err) {
        console.error('Error loading product details:', err);

        if (!cancelled) {
          setError('Failed to load product details.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-[#EFE6D7]/60 rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-[#EFE6D7] rounded w-1/4" />
            <div className="h-8 bg-[#EFE6D7] rounded w-3/4" />
            <div className="h-6 bg-[#EFE6D7] rounded w-1/3" />
            <div className="h-24 bg-[#EFE6D7]/60 rounded w-full" />
            <div className="h-12 bg-[#EFE6D7] rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="font-serif text-3xl font-semibold text-[#252A24]">
          Product Unavailable
        </h2>

        <p className="text-sm text-[#252A24]/70 max-w-md mx-auto leading-relaxed">
          {error ||
            'This handcrafted item may have been moved or removed from our catalog.'}
        </p>

        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity <= 0;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [''];

  const currentImage = images[selectedImageIndex] || images[0];

  const hasValidDiscount =
    Boolean(product.compareAtPrice) &&
    product.compareAtPrice! > product.price;

  const discountPercentage = hasValidDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) /
          product.compareAtPrice!) *
          100
      )
    : null;

  const productUrl = `${SITE_URL}/product/${encodeURIComponent(slug || '')}`;

  const productDescription = (
    product.description?.trim() ||
    `Discover ${product.name} at DripNest Decor. Explore handcrafted wooden homeware and lifestyle essentials.`
  ).replace(/\s+/g, ' ').slice(0, 300);

  const productImage = product.images?.[0];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: productDescription,
    url: productUrl,
    ...(productImage ? { image: [productImage] } : {}),
    brand: {
      '@type': 'Brand',
      name: 'DripNest',
    },
    category: product.categoryName,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: Number(product.price).toFixed(2),
      availability: isOutOfStock
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(totalReviews > 0 && averageRating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: averageRating,
            reviewCount: totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const res = addToCart(product, quantity);

    if (res.success) {
      setAddedMessage(`Added ${quantity} to your shopping bag.`);
      setTimeout(() => setAddedMessage(null), 4000);
    } else if (res.message) {
      setAddedMessage(res.message);
    }
  };

  return (
    <>
        <title>{`${product.name} | DripNest Decor`}</title>

        <meta name="description" content={productDescription.slice(0, 155)} />
        <meta name="robots" content="index, follow" />

        <link rel="canonical" href={productUrl} />

        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="DripNest Decor" />
        <meta property="og:title" content={`${product.name} | DripNest Decor`} />
        <meta property="og:description" content={productDescription} />
        <meta property="og:url" content={productUrl} />

        {productImage && (
          <meta property="og:image" content={productImage} />
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${product.name} | DripNest Decor`}
        />
        <meta name="twitter:description" content={productDescription} />

        {productImage && (
          <meta name="twitter:image" content={productImage} />
        )}

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-16">
        {/* Breadcrumb navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-[#252A24]/70"
        >
          <Link to="/" className="hover:text-[#234737]">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/shop" className="hover:text-[#234737]">
            Shop
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to={`/category/${product.categoryId}`}
            className="hover:text-[#234737] truncate max-w-[140px]"
          >
            {product.categoryName}
          </Link>
          <span aria-hidden="true">/</span>
          <span
            aria-current="page"
            className="text-[#252A24] font-medium truncate max-w-[180px]"
          >
            {product.name}
          </span>
        </nav>

        {/* Product details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Product gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square bg-[#F8F5EF] rounded-xl overflow-hidden border border-[#EFE6D7] shadow-xs">
              <SafeImage
                src={currentImage}
                alt={`${product.name} - DripNest Decor`}
                categoryName={product.categoryName}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {isOutOfStock && (
                <div className="absolute top-4 left-4 bg-[#252A24]/90 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded">
                  Out of Stock
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#234737] shadow-sm'
                        : 'border-[#EFE6D7] opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                    aria-pressed={selectedImageIndex === idx}
                  >
                    <SafeImage
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      categoryName={product.categoryName}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purchase information */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#684631] font-semibold block mb-1">
                {product.categoryName}
              </span>

              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#234737] leading-tight">
                {product.name}
              </h1>

              {totalReviews > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  <div className="flex items-center text-[#684631]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(averageRating)
                            ? 'fill-[#684631] text-[#684631]'
                            : 'text-[#EFE6D7]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold tabular-nums text-[#234737]">
                    {averageRating}
                  </span>
                  <span className="text-[#252A24]/60">
                    ({totalReviews} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="p-4 bg-white border border-[#EFE6D7] rounded-lg space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold tabular-nums text-[#234737]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>

                {hasValidDiscount && (
                  <>
                    <span className="text-base line-through tabular-nums text-[#252A24]/40">
                      ₹{product.compareAtPrice!.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-[#684631] uppercase">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              <div className="text-[11px] text-[#252A24]/60">
                Inclusive of all applicable taxes under GSTIN: 07AMVPU8369D1Z5
              </div>
            </div>

            {/* Stock status */}
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#252A24]/70">Availability:</span>

              {isOutOfStock ? (
                <span className="text-red-700 font-semibold">
                  Out of Stock
                </span>
              ) : (
                <span className="text-[#234737] font-semibold">
                  In Stock ({product.stockQuantity} available)
                </span>
              )}
            </div>

            {!isOutOfStock && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#684631]">
                    Quantity
                  </span>

                  <div className="flex items-center border border-[#EFE6D7] bg-white rounded-md">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(Math.max(1, quantity - 1))
                      }
                      className="px-3 py-2 text-sm hover:bg-[#F8F5EF]"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>

                    <span className="px-4 text-sm font-semibold tabular-nums text-[#252A24]">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          Math.min(product.stockQuantity, quantity + 1)
                        )
                      }
                      disabled={quantity >= product.stockQuantity}
                      className="px-3 py-2 text-sm hover:bg-[#F8F5EF] disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <a
                  href={createProductOrderWhatsAppUrl(product, quantity)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs uppercase tracking-widest font-bold rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-current shrink-0 transition-transform group-hover:scale-110" />
                  <span>
                    Order Now on WhatsApp ({ORDER_WHATSAPP_PHONE})
                  </span>
                </a>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 bg-[#234737] text-[#F8F5EF] text-xs uppercase tracking-widest font-semibold rounded-md hover:bg-[#1A3529] transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Bag</span>
                </button>

                {addedMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{addedMessage}</span>
                  </div>
                )}
              </div>
            )}

            {isOutOfStock && (
              <div className="pt-2">
                <a
                  href={createProductOrderWhatsAppUrl(product, 1)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs uppercase tracking-widest font-bold rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-current shrink-0" />
                  <span>
                    Inquire / Pre-Order on WhatsApp ({ORDER_WHATSAPP_PHONE})
                  </span>
                </a>
              </div>
            )}

            {/* Specifications */}
            <div className="border-t border-[#EFE6D7] pt-6 space-y-4 text-xs">
              <div>
                <h2 className="font-semibold text-xs uppercase tracking-wider text-[#684631] mb-1">
                  Description
                </h2>
                <p className="text-sm text-[#252A24]/80 leading-relaxed whitespace-pre-line">
                  {product.description ||
                    'Thoughtfully handcrafted wooden homeware.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3 rounded border border-[#EFE6D7]">
                  <span className="block text-[10px] uppercase tracking-wider text-[#684631] font-semibold">
                    Material
                  </span>
                  <span className="text-xs font-medium text-[#252A24]">
                    {product.material || 'Solid Hardwood'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded border border-[#EFE6D7]">
                  <span className="block text-[10px] uppercase tracking-wider text-[#684631] font-semibold">
                    Dimensions
                  </span>
                  <span className="text-xs font-medium text-[#252A24]">
                    {product.dimensions || 'Standard artisanal size'}
                  </span>
                </div>
              </div>

              {product.careInstructions && (
                <div className="bg-white p-3 rounded border border-[#EFE6D7] space-y-1">
                  <span className="block text-[10px] uppercase tracking-wider text-[#684631] font-semibold">
                    Care Instructions
                  </span>
                  <p className="text-xs text-[#252A24]/80 leading-relaxed">
                    {product.careInstructions}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2.5 p-3 bg-[#EFE6D7]/40 rounded-md text-[11px] text-[#252A24]/80">
                <Sparkles className="w-4 h-4 text-[#684631] shrink-0 mt-0.5" />
                <span>
                  Each piece features authentic wood-grain markings and subtle
                  natural variations celebrating genuine artisan handiwork.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer reviews */}
        <section className="border-t border-[#EFE6D7] pt-12 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#234737]">
                Customer Reviews for {product.name}
              </h2>
              <p className="text-xs text-[#252A24]/70 mt-1">
                Read authentic feedback from customers who have styled this
                item in their home.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529]"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Review this Product</span>
            </button>
          </div>

          {productReviews.length === 0 ? (
            <div className="bg-white border border-[#EFE6D7] rounded-lg p-8 text-center max-w-md mx-auto space-y-3">
              <p className="text-sm text-[#252A24]/70">
                No reviews yet for this specific handcrafted item.
              </p>

              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="text-xs font-semibold uppercase tracking-wider text-[#234737] underline"
              >
                Be the first to leave a review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productReviews.map((rev) => (
                <ReviewCard key={rev.id} review={rev} />
              ))}
            </div>
          )}
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-[#EFE6D7] pt-12 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#234737]">
                Related Wooden Essentials
              </h2>

              <Link
                to={`/category/${product.categoryId}`}
                className="text-xs uppercase tracking-wider font-semibold text-[#684631] hover:text-[#234737]"
              >
                More in this Category
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}

        {/* Review modal */}
        <ReviewFormModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          productId={product.id}
          productName={product.name}
          onReviewSubmitted={async () => {
            const revData = await getApprovedReviews(product.id);
            setProductReviews(revData.reviews);
            setAverageRating(revData.averageRating);
            setTotalReviews(revData.totalReviews);
          }}
        />
      </div>
    </>
  );
};