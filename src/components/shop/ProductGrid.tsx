import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  error?: string | null;
  onRetry?: () => void;
  onProductClick?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  error,
  onRetry,
  onProductClick,
}) => {
  // Error state
  if (error && products.length === 0) {
    return (
      <div className="py-16 px-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-semibold text-[#252A24] mb-2">
          Unable to Load Collection
        </h3>
        <p className="text-sm text-[#252A24]/70 mb-6">
          {error || 'We encountered a momentary issue connecting to the catalog. Please try refreshing.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  // Initial Loading Skeleton
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#EFE6D7] rounded-lg p-3 sm:p-4 animate-pulse space-y-3"
          >
            <div className="aspect-[4/3] sm:aspect-square bg-[#EFE6D7]/60 rounded-md" />
            <div className="h-3 bg-[#EFE6D7]/80 rounded w-1/3" />
            <div className="h-4 bg-[#EFE6D7] rounded w-3/4" />
            <div className="flex justify-between pt-2">
              <div className="h-4 bg-[#EFE6D7] rounded w-1/4" />
              <div className="h-3 bg-[#EFE6D7]/60 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (!loading && products.length === 0) {
    return (
      <div className="py-20 px-4 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-[#234737] mb-2">
          Our collection is taking shape.
        </h3>
        <p className="text-sm text-[#252A24]/70 leading-relaxed mb-6">
          Please check back soon. Handcrafted wooden pieces are continuously seasoned and shaped in small batches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* 2 columns on mobile, 3-4 columns on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
          />
        ))}
      </div>

      {/* Pagination Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#234737] text-[#234737] hover:bg-[#234737] hover:text-[#F8F5EF] text-xs uppercase tracking-widest font-semibold rounded-md transition-all duration-200 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading more pieces...</span>
              </>
            ) : (
              <span>Load More Products</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
