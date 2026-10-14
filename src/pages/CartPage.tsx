import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SafeImage } from '../components/common/SafeImage';
import {
  createCartOrderWhatsAppUrl,
  WhatsAppIcon,
  ORDER_WHATSAPP_PHONE,
} from '../utils/whatsapp';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, totalItemCount } = useCart();

  // Create an email inquiry mailto string with the itemized cart
  const orderSummaryText = items
    .map(
      (item) =>
        `• ${item.product.name} (Qty: ${item.quantity}) - ₹${(item.product.price * item.quantity).toLocaleString('en-IN')}`
    )
    .join('%0D%0A');

  const inquiryMailto = `mailto:ubaidji07@gmail.com?subject=Order%20Inquiry%20-%20DripNest%20Homeware&body=Hello%20DripNest%20Team,%0D%0A%0D%0AI%20would%20like%20to%20place%20an%20order%20for%20the%20following%20handcrafted%20wooden%20items:%0D%0A%0D%0A${orderSummaryText}%0D%0A%0D%0ASubtotal:%20₹${subtotal.toLocaleString('en-IN')}%0D%0A%0D%0APlease%20let%20me%20know%20how%20to%20proceed%20with%20payment%20and%20delivery.%0D%0A%0D%0AThank%20you!`;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#234737]">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-[#252A24]/70 max-w-md mx-auto leading-relaxed">
          You have not added any handcrafted homeware pieces to your bag yet. Explore our curated collections to bring nature home.
        </p>
        <div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#234737] text-white text-xs uppercase tracking-widest font-semibold rounded-md hover:bg-[#1A3529] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore The Collection</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="flex items-center justify-between border-b border-[#EFE6D7] pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#234737]">
            Shopping Bag ({totalItemCount})
          </h1>
          <p className="text-xs text-[#252A24]/70 mt-1">
            Review your selected handcrafted wooden pieces.
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-[#252A24]/60 hover:text-red-700 underline"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 bg-white border border-[#EFE6D7] rounded-xl overflow-hidden shadow-xs divide-y divide-[#EFE6D7]">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-[#F8F5EF] overflow-hidden shrink-0 border border-[#EFE6D7]">
                  <SafeImage
                    src={product.images?.[0]}
                    alt={product.name}
                    categoryName={product.categoryName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#684631] font-semibold">
                    {product.categoryName}
                  </span>
                  <Link
                    to={`/product/${product.slug}`}
                    className="block font-serif text-lg font-semibold text-[#252A24] hover:text-[#234737]"
                  >
                    {product.name}
                  </Link>
                  <span className="text-sm font-semibold tabular-nums text-[#234737]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Quantity Stepper & Subtotal */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0">
                <div className="flex items-center border border-[#EFE6D7] bg-[#F8F5EF] rounded-md">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="px-2.5 py-1.5 text-xs hover:bg-[#EFE6D7]"
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
                    className="px-2.5 py-1.5 text-xs hover:bg-[#EFE6D7] disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="font-serif text-base sm:text-lg font-bold tabular-nums text-[#234737] min-w-[90px] text-right">
                  ₹{(product.price * quantity).toLocaleString('en-IN')}
                </span>

                <button
                  type="button"
                  onClick={() => removeFromCart(product.id)}
                  className="text-[#252A24]/40 hover:text-red-600 p-1 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white border border-[#EFE6D7] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="font-serif text-xl font-semibold text-[#234737]">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#252A24]/75">Subtotal</span>
              <span className="font-semibold tabular-nums text-[#252A24]">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#252A24]/60">
              <span>GST (Included)</span>
              <span>GSTIN: 07AMVPU8369D1Z5</span>
            </div>
            <div className="flex justify-between text-xs text-[#252A24]/60">
              <span>Shipping & Delivery</span>
              <span>Calculated upon dispatch</span>
            </div>
            <div className="pt-3 border-t border-[#EFE6D7] flex justify-between text-base font-bold text-[#234737]">
              <span>Estimated Total</span>
              <span className="font-serif text-2xl tabular-nums">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Genuine Checkout Architecture Notice */}
          <div className="p-4 bg-[#F8F5EF] border border-[#EFE6D7] rounded-lg space-y-2 text-xs text-[#252A24]/80">
            <div className="flex items-center gap-2 text-[#684631] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Checkout & Order Processing</span>
            </div>
            <p className="leading-relaxed">
              Online credit card processing is currently awaiting merchant gateway setup. You can directly place your order or inquiry with the DripNest artisanal workshop.
            </p>
          </div>

          {/* Direct Order Actions */}
          <div className="space-y-2.5">
            <a
              href={createCartOrderWhatsAppUrl(items, subtotal)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs uppercase tracking-wider font-bold rounded-md shadow-md transition-all group cursor-pointer"
            >
              <WhatsAppIcon className="w-5 h-5 fill-current shrink-0 transition-transform group-hover:scale-110" />
              <span>Order on WhatsApp ({ORDER_WHATSAPP_PHONE})</span>
            </a>

            <a
              href={inquiryMailto}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Send Order Inquiry by Email</span>
            </a>

            <a
              href="tel:8218167743"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[#234737] text-[#234737] text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#234737]/5 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Artisan Desk (8218167743)</span>
            </a>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/shop"
              className="text-xs text-[#684631] hover:text-[#234737] inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
