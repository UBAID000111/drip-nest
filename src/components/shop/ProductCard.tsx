import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stockQuantity <= 0;

  // Calculate discount percentage only if valid compareAtPrice > price
  const hasValidDiscount =
    product.compareAtPrice &&
    product.compareAtPrice > product.price;

  const discountPercentage = hasValidDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : null;

  const handleCardClick = (e: React.MouseEvent) => {
    if (onProductClick) {
      e.preventDefault();
      onProductClick(product);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white border border-[#EFE6D7] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      {/* Product Image Area */}
      <Link
        to={`/product/${product.slug}`}
        onClick={handleCardClick}
        className="relative block aspect-[4/3] sm:aspect-square bg-[#F8F5EF] overflow-hidden cursor-pointer"
      >
        <SafeImage
          src={product.images?.[0]}
          alt={product.name}
          categoryName={product.categoryName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Status / Discount Labels - Clean unboxed text or minimal marker */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {hasValidDiscount && (
            <span className="bg-[#684631] text-[#F8F5EF] text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs">
              {discountPercentage}% Off
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-[#252A24]/90 text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Add overlay button on hover (desktop) */}
        {!isOutOfStock && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="hidden sm:flex absolute bottom-3 right-3 items-center gap-1.5 px-3 py-2 bg-[#234737] text-white text-xs font-medium rounded-md shadow-md opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:bg-[#1A3529]"
            aria-label={`Add ${product.name} to bag`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category - Clean unboxed metadata */}
          <div className="text-[11px] uppercase tracking-wider text-[#684631] font-semibold mb-1 truncate">
            {product.categoryName || 'Handcrafted'}
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-base sm:text-lg font-semibold text-[#252A24] leading-snug line-clamp-1 group-hover:text-[#234737] transition-colors">
            <Link to={`/product/${product.slug}`} onClick={handleCardClick}>
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Pricing & Stock baseline */}
        <div className="mt-3 pt-3 border-t border-[#F8F5EF] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold tabular-nums text-[#234737]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {hasValidDiscount && (
              <span className="text-xs line-through tabular-nums text-[#252A24]/40">
                ₹{product.compareAtPrice!.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="text-[11px] text-[#252A24]/60 font-medium">
            {isOutOfStock ? (
              <span className="text-red-700">Sold Out</span>
            ) : (
              <span className="text-[#234737]">In Stock</span>
            )}
          </div>
        </div>

        {/* Mobile Add to Bag Button */}
        <div className="mt-3 sm:hidden">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="w-full py-2 px-3 bg-[#234737] text-[#F8F5EF] text-xs font-semibold rounded disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
};
