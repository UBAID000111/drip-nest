import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { SafeImage } from '../common/SafeImage';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItemCount,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F8F5EF] flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#EFE6D7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#234737]" />
              <h2 className="font-serif text-xl font-semibold text-[#234737]">
                Shopping Bag ({totalItemCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full hover:bg-[#EFE6D7] text-[#252A24] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EFE6D7] flex items-center justify-center text-[#684631]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#252A24]">
                  Your bag is empty
                </h3>
                <p className="text-sm text-[#252A24]/70 max-w-xs">
                  Discover handcrafted wooden homeware, artisanal drinkware, and dining essentials made for your home.
                </p>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#234737] text-[#F8F5EF] text-xs uppercase tracking-wider font-medium rounded-md hover:bg-[#1A3529] transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[#EFE6D7]">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="py-4 flex gap-4">
                    <div className="w-20 h-20 shrink-0 bg-[#EFE6D7] rounded-md overflow-hidden">
                      <SafeImage
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        categoryName={product.categoryName}
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link
                            to={`/product/${product.slug}`}
                            onClick={closeCart}
                            className="text-sm font-semibold text-[#252A24] hover:text-[#234737] line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <span className="text-xs text-[#684631] font-mono">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-[#252A24]/40 hover:text-red-600 transition-colors p-1"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#EFE6D7] rounded-md bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 hover:bg-[#F8F5EF] text-[#252A24] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold tabular-nums text-[#252A24]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={quantity >= product.stockQuantity}
                            className="p-1 hover:bg-[#F8F5EF] text-[#252A24] disabled:opacity-30 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-medium tabular-nums text-[#234737]">
                          ₹{(product.price * quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#EFE6D7] bg-[#EFE6D7]/40 space-y-4">
              <div className="flex items-center justify-between text-base font-medium">
                <span className="text-[#252A24]">Subtotal</span>
                <span className="font-serif text-xl font-bold tabular-nums text-[#234737]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-[#252A24]/70">
                Taxes calculated at billing (GSTIN: 07AMVPU8369D1Z5). Handcrafted in natural wood.
              </p>

              <div className="space-y-2">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#234737] text-[#F8F5EF] text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] transition-colors"
                >
                  <span>Review Bag & Order</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={closeCart}
                  className="w-full py-2.5 text-xs text-[#252A24]/80 hover:text-[#234737] font-medium"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
