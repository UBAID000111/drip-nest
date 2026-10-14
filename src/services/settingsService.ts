import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { StoreSettings } from '../types';

const SETTINGS_DOC_ID = 'main';
const COLLECTION = 'settings';

export const DEFAULT_SETTINGS: StoreSettings = {
  general: {
    storeName: 'DripNest',
    tagline: 'Bring Nature Home.',
    brandDescription: 'Handcrafted warmth. Timeless living. Thoughtfully made wooden homeware, dining accessories, drinkware, and home decor.',
    defaultCurrency: 'INR',
    defaultCountry: 'India',
    contactEmail: 'ubaidji07@gmail.com',
    contactPhone: '8218167743',
    businessGstin: '07AMVPU8369D1Z5',
  },
  homepage: {
    heroHeadline: 'Nature, Crafted for Your Home.',
    heroSubtitle: 'Thoughtfully handcrafted wooden essentials that bring warmth, character, and timeless beauty to everyday living.',
    heroImageUrl: '',
    primaryCtaText: 'Explore the Collection',
    secondaryCtaText: 'Discover Our Craft',
    brandStoryHeading: 'Everyday Objects. Natural Character.',
    brandStoryContent: 'At DripNest, we honor the organic character of wood. Each handcrafted piece carries distinct grain variations, tactile warmth, and balanced form designed to bring calm and beauty to everyday routines—from mindful morning coffee to shared family dinners.',
  },
  product: {
    productsPerPage: 12,
    enableCategoryFilters: true,
    enablePriceSorting: true,
    enableStockVisibility: true,
    relatedProductCount: 4,
  },
  review: {
    requireApproval: true,
    enablePublicSubmission: true,
    maxReviewLength: 1500,
    allowedRatings: [1, 2, 3, 4, 5],
  },
  contact: {
    contactEmail: 'ubaidji07@gmail.com',
    contactPhone: '8218167743',
    supportMessage: 'Have a question about our handcrafted wooden homeware, custom orders, or care? Reach out anytime.',
    businessAddress: '',
  },
  seo: {
    metaTitle: 'DripNest — Premium Handcrafted Wooden Homeware & Lifestyle',
    metaDescription: 'Bring Nature Home with handcrafted wooden dining essentials, drinkware, kitchenware, and decor.',
    defaultSocialImage: '',
    websiteUrl: 'https://dripnest.com',
    defaultImageAltText: 'Handcrafted wooden homeware by DripNest',
  },
  legal: {
    privacyPolicy: `DripNest Privacy Policy

At DripNest, accessible from our official website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by DripNest and how we use it.

Information We Collect:
When you contact us, place inquiries, or submit product reviews, we may collect your name, email address, phone number, and any feedback you provide. We do not sell or rent personal information to third parties.

Data Security:
We use secure Firebase Firestore databases with role-based access control to safeguard your customer records and communication.

Contacting Us:
If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at ubaidji07@gmail.com or call 8218167743.`,
    termsAndConditions: `DripNest Terms and Conditions

Welcome to DripNest. By accessing our website, purchasing our handcrafted wooden products, or using our services, you agree to comply with and be bound by these terms.

Product Characteristics:
Each DripNest item is handcrafted from genuine natural hardwoods. Because wood is an organic living material, subtle variations in grain texture, tone, and surface character are natural and celebrated markers of authentic craftsmanship rather than defects.

Pricing and Availability:
All prices are displayed in Indian Rupees (INR) inclusive of applicable taxes under GSTIN: 07AMVPU8369D1Z5. Product availability is maintained in real time; however, hand-carved items may occasionally be produced in limited editions.

Intellectual Property:
All content, photography, and brand designs on DripNest are the property of DripNest and protected by applicable copyright laws.`,
    shippingPolicy: `DripNest Shipping Policy

Careful Packaging:
Every wooden bowl, tumbler, tray, and home accessory is wrapped in sustainable, protective cushioning to ensure it arrives in pristine condition.

Order Dispatch:
Standard orders are processed within 2-4 business days. Delivery timelines across India generally range between 4-7 business days depending on location.

Tracking and Inquiries:
For questions regarding shipping or delivery status, please contact our support desk at ubaidji07@gmail.com or 8218167743 with your reference details.`,
    returnsAndRefunds: `DripNest Returns and Refunds Policy

Our Guarantee:
We want you to treasure every wooden piece in your home. If your item arrives damaged in transit or differs fundamentally from your order, please notify us within 7 days of delivery.

Eligibility:
To be eligible for a return or exchange, your item must be in its original unused condition, with care packaging intact. Because natural wood requires proper seasoning, items altered with oils, dishwashers, or soaked in water cannot be accepted.

Refund Processing:
Once inspected, eligible refunds are credited to your original payment method within 5-7 working days. For assistance, contact ubaidji07@gmail.com.`,
  },
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, COLLECTION, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return DEFAULT_SETTINGS;
    }
    const data = snap.data();
    return {
      general: { ...DEFAULT_SETTINGS.general, ...(data.general || {}) },
      homepage: { ...DEFAULT_SETTINGS.homepage, ...(data.homepage || {}) },
      product: { ...DEFAULT_SETTINGS.product, ...(data.product || {}) },
      review: { ...DEFAULT_SETTINGS.review, ...(data.review || {}) },
      contact: { ...DEFAULT_SETTINGS.contact, ...(data.contact || {}) },
      seo: { ...DEFAULT_SETTINGS.seo, ...(data.seo || {}) },
      legal: { ...DEFAULT_SETTINGS.legal, ...(data.legal || {}) },
    };
  } catch (error) {
    console.warn('Could not load settings from Firestore, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION}/${SETTINGS_DOC_ID}`);
  }
}
