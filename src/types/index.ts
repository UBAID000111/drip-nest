export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  material: string;
  dimensions: string;
  careInstructions: string;
  stockQuantity: number;
  status: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Review {
  id: string;
  displayName: string;
  email?: string;
  rating: number;
  comment: string;
  productId?: string;
  productName?: string;
  status: 'pending' | 'approved' | 'hidden';
  createdAt?: any;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin';
  createdAt?: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreSettings {
  general: {
    storeName: string;
    tagline: string;
    brandDescription: string;
    defaultCurrency: string;
    defaultCountry: string;
    contactEmail: string;
    contactPhone: string;
    businessGstin: string;
  };
  homepage: {
    heroHeadline: string;
    heroSubtitle: string;
    heroImageUrl?: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    brandStoryHeading: string;
    brandStoryContent: string;
  };
  product: {
    productsPerPage: number;
    enableCategoryFilters: boolean;
    enablePriceSorting: boolean;
    enableStockVisibility: boolean;
    relatedProductCount: number;
  };
  review: {
    requireApproval: boolean;
    enablePublicSubmission: boolean;
    maxReviewLength: number;
    allowedRatings: number[];
  };
  contact: {
    contactEmail: string;
    contactPhone: string;
    supportMessage: string;
    businessAddress?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    defaultSocialImage?: string;
    websiteUrl: string;
    defaultImageAltText: string;
  };
  legal: {
    privacyPolicy: string;
    termsAndConditions: string;
    shippingPolicy: string;
    returnsAndRefunds: string;
  };
}
