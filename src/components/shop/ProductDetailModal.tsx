import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  Layers,
  Ruler,
  HeartHandshake,
} from 'lucide-react';
import { Product } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { useCart } from '../../context/CartContext';
import {
  createProductOrderWhatsAppUrl,
  WhatsAppIcon,
  ORDER_WHATSAPP_PHONE,
} from '../../utils/whatsapp';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setAddedMessage(null);
    }
  }, [product]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [''];
  const currentImage = images[selectedImageIndex] || images[0];
  const isOutOfStock = product.stockQuantity <= 0;

  const hasValidDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  const discountPercentage = hasValidDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100
      )
    : null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity);
    if (res.success) {
      setAddedMessage(`Added ${quantity} to your shopping bag.`);
      setTimeout(() => setAddedMessage(null), 3500);
    } else if (res.message) {
      setAddedMessage(res.message);
    }
  };

  const whatsappOrderUrl = createProductOrderWhatsAppUrl(product, quantity);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-[#EFE6D7] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[#EFE6D7] bg-[#F8F5EF]/80 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#684631]">
              {product.categoryName || 'Artisanal Homeware'}
            </span>
            <span className="text-xs text-[#252A24]/40">•</span>
            <span className="text-xs text-[#252A24]/60">Handcrafted Series</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#252A24]/60 hover:text-[#252A24] hover:bg-[#EFE6D7]/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Image Gallery */}
            <div className="md:col-span-6 space-y-3.5">
              <div className="relative aspect-square bg-[#F8F5EF] rounded-xl overflow-hidden border border-[#EFE6D7] shadow-inner group">
                <SafeImage
                  src={currentImage}
                  alt={product.name}
                  categoryName={product.categoryName}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Stock or Discount badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                  {hasValidDiscount && (
                    <span className="bg-[#684631] text-[#F8F5EF] text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded">
                      {discountPercentage}% Off
                    </span>
                  )}
                  {isOutOfStock ? (
                    <span className="bg-red-700 text-white text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="bg-[#234737]/90 text-white text-[11px] font-medium tracking-wide px-2.5 py-1 rounded backdrop-blur-xs">
                      {product.stockQuantity} in Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[#234737] shadow-xs'
                          : 'border-[#EFE6D7] opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <SafeImage
                        src={img}
                        alt={`${product.name} photo ${idx + 1}`}
                        categoryName={product.categoryName}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Natural variation note */}
              <div className="flex items-center gap-2 p-3 bg-[#F8F5EF] rounded-lg text-xs text-[#252A24]/75 border border-[#EFE6D7]/60">
                <Sparkles className="w-4 h-4 text-[#684631] shrink-0" />
                <span>Handmade from natural solid wood with distinct grain.</span>
              </div>
            </div>

            {/* Right Column: Complete Details & Order Actions */}
            <div className="md:col-span-6 space-y-5">
              <div>
                <h2
                  id="modal-product-title"
                  className="font-serif text-2xl sm:text-3xl font-normal text-[#234737] leading-tight"
                >
                  {product.name}
                </h2>

                <div className="mt-1.5 flex items-center gap-2 text-xs text-[#252A24]/60">
                  <span>Category: <strong className="text-[#252A24] font-medium">{product.categoryName}</strong></span>
                  <span>•</span>
                  <span>SKU: {product.slug}</span>
                </div>
              </div>

              {/* Price Panel */}
              <div className="p-4 bg-[#F8F5EF] rounded-xl border border-[#EFE6D7] space-y-1">
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
                <div className="text-[11px] text-[#252A24]/60 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#234737]" />
                  <span>GST Inclusive • Verified artisanal pricing</span>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#684631]">
                  Description
                </h4>
                <div className="text-sm text-[#252A24]/80 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-[#EFE6D7]/70 max-h-48 overflow-y-auto">
                  {product.description || 'Thoughtfully handcrafted wooden homeware crafted for enduring utility and beauty.'}
                </div>
              </div>

              {/* All Specification Fields */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#684631]">
                  Product Specifications & Fields
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-[#EFE6D7] space-y-0.5">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#684631]">
                      <Layers className="w-3 h-3" />
                      <span>Material</span>
                    </span>
                    <span className="font-medium text-[#252A24] block truncate">
                      {product.material || 'Solid Hardwood'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-[#EFE6D7] space-y-0.5">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#684631]">
                      <Ruler className="w-3 h-3" />
                      <span>Dimensions</span>
                    </span>
                    <span className="font-medium text-[#252A24] block truncate">
                      {product.dimensions || 'Standard artisanal size'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-[#EFE6D7] space-y-0.5">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#684631]">
                      <HeartHandshake className="w-3 h-3" />
                      <span>Care Instructions</span>
                    </span>
                    <span className="font-medium text-[#252A24] block truncate" title={product.careInstructions}>
                      {product.careInstructions || 'Wipe with soft cloth'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-[#EFE6D7] space-y-0.5">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#684631]">
                      <PackageCheck className="w-3 h-3" />
                      <span>Availability</span>
                    </span>
                    <span className={`font-medium block truncate ${isOutOfStock ? 'text-red-700' : 'text-[#234737]'}`}>
                      {isOutOfStock ? 'Out of Stock' : `${product.stockQuantity} in stock`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#684631]">
                      Quantity
                    </span>
                    <div className="flex items-center border border-[#EFE6D7] bg-white rounded-md">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2.5 py-1.5 text-sm hover:bg-[#F8F5EF]"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold tabular-nums text-[#252A24]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(Math.min(product.stockQuantity, quantity + 1))
                        }
                        disabled={quantity >= product.stockQuantity}
                        className="px-2.5 py-1.5 text-sm hover:bg-[#F8F5EF] disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {quantity > 1 && (
                    <span className="text-xs font-semibold text-[#234737] tabular-nums">
                      Total: ₹{(product.price * quantity).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              )}

              {/* ACTION BUTTONS: ORDER NOW (WhatsApp) + ADD TO BAG */}
              <div className="space-y-2.5 pt-2">
                {/* PRIMARY: ORDER NOW WITH WHATSAPP REDIRECT */}
                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm uppercase tracking-wider font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-current shrink-0 transition-transform group-hover:scale-110" />
                  <span>Order Now on WhatsApp ({ORDER_WHATSAPP_PHONE})</span>
                </a>

                {/* SECONDARY: ADD TO BAG */}
                {!isOutOfStock && (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-3 px-6 bg-[#234737] hover:bg-[#1A3529] text-[#F8F5EF] text-xs uppercase tracking-widest font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </button>
                )}

                {addedMessage && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{addedMessage}</span>
                  </div>
                )}
              </div>

              {/* Link to dedicated standalone product page */}
              <div className="pt-2 border-t border-[#EFE6D7] flex items-center justify-between text-xs">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-[#684631] hover:text-[#234737] font-semibold underline underline-offset-4"
                >
                  <span>Open Dedicated Product Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <span className="text-[#252A24]/50 text-[11px]">
                  Fast dispatch across India
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
