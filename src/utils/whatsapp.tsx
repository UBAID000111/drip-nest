import React from 'react';
import { Product, CartItem } from '../types';

export const ORDER_WHATSAPP_PHONE = '+918218167743';
export const ORDER_WHATSAPP_PHONE_DIGITS = '918218167743';

/**
 * Resolves a shareable image link for WhatsApp.
 * If the product has an HTTP(S) image URL, it is used directly.
 * If images are stored as inline base64 Data URLs (which cannot be parsed as links in WhatsApp text and would break URL character limits),
 * we return the direct product webpage URL where the high-resolution photo is rendered and viewable.
 */
export function getProductImageLink(product: Product): string {
  if (product.images && product.images.length > 0) {
    const httpImg = product.images.find(
      (img) => img && (img.startsWith('http://') || img.startsWith('https://'))
    );
    if (httpImg) return httpImg;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/product/${product.slug}`;
  }

  return 'Available on DripNest store catalog';
}

/**
 * Builds the official WhatsApp redirect URL containing:
 * - Product Name
 * - Price & Quantity
 * - Category
 * - Description (complete description)
 * - All Specifications (Material, Dimensions, Care Instructions, Stock Availability)
 * - Image link (HTTP photo URL or product page view link)
 * - Web store link
 */
export function createProductOrderWhatsAppUrl(product: Product, quantity: number = 1): string {
  const imageLink = getProductImageLink(product);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const webProductUrl = origin ? `${origin}/product/${product.slug}` : '';

  const cleanDescription = (product.description || '').trim();
  // Safe limit for WhatsApp GET query parameter encoding
  const descForMessage =
    cleanDescription.length > 900
      ? cleanDescription.substring(0, 897) + '...'
      : cleanDescription;

  const lines: string[] = [
    `*NEW ORDER INQUIRY - DRIPNEST ARTISANAL HOMEWARE*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `*Product Name:* ${product.name}`,
    `*Price:* ₹${product.price.toLocaleString('en-IN')}`,
    `*Quantity:* ${quantity}`,
    `*Estimated Total:* ₹${(product.price * quantity).toLocaleString('en-IN')}`,
    `*Category:* ${product.categoryName || 'Handcrafted Homeware'}`,
    ``,
    `*Product Description:*`,
    descForMessage || 'Thoughtfully handcrafted wooden homeware.',
    ``,
    `*Specifications & Details:*`,
    `• Material: ${product.material || 'Solid Hardwood'}`,
    `• Dimensions: ${product.dimensions || 'Standard artisanal size'}`,
    `• Care Instructions: ${product.careInstructions || 'Wipe with dry or slightly damp soft cloth'}`,
    `• Stock Availability: ${product.stockQuantity > 0 ? `${product.stockQuantity} pieces in stock` : 'Made to order'}`,
    ``,
    `*Product Image Link:*`,
    imageLink,
  ];

  if (webProductUrl && imageLink !== webProductUrl) {
    lines.push(``, `*View on Web Store:*`, webProductUrl);
  }

  lines.push(
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Hello DripNest! I want to order this item. Please confirm availability, shipping timeframe, and payment details.`
  );

  const fullMessage = lines.join('\n');
  return `https://wa.me/${ORDER_WHATSAPP_PHONE_DIGITS}?text=${encodeURIComponent(fullMessage)}`;
}

/**
 * Builds a WhatsApp order URL for an entire shopping cart.
 */
export function createCartOrderWhatsAppUrl(items: CartItem[], subtotal: number): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const itemsText = items
    .map((item, index) => {
      const imgLink = getProductImageLink(item.product);
      return [
        `${index + 1}. *${item.product.name}*`,
        `   • Qty: ${item.quantity} × ₹${item.product.price.toLocaleString('en-IN')} = ₹${(item.product.price * item.quantity).toLocaleString('en-IN')}`,
        `   • Category: ${item.product.categoryName || 'Handcrafted'}`,
        `   • Photo: ${imgLink}`,
      ].join('\n');
    })
    .join('\n\n');

  const lines = [
    `*ORDER INQUIRY FOR SHOPPING BAG - DRIPNEST*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `*Items in Bag:*`,
    itemsText,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')} (Inclusive of taxes)`,
    origin ? `*Store Link:* ${origin}` : '',
    ``,
    `Hello DripNest! I would like to place an order for these items. Please confirm delivery details and payment procedure.`,
  ].filter(Boolean);

  return `https://wa.me/${ORDER_WHATSAPP_PHONE_DIGITS}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Crisp WhatsApp SVG icon component.
 */
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="0"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
