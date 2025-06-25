export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  REJECTED = 'REJECTED',
}

export enum ProductType {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  SERVICE = 'SERVICE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  GIFT_CARD = 'GIFT_CARD',
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  BACKORDER = 'BACKORDER',
  PREORDER = 'PREORDER',
}

export enum WeightUnit {
  KG = 'KG',
  LB = 'LB',
  G = 'G',
  OZ = 'OZ',
}

export enum DimensionUnit {
  CM = 'CM',
  IN = 'IN',
  M = 'M',
  FT = 'FT',
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  sku: string;
  barcode?: string | null;
  type: ProductType;
  status: ProductStatus;
  
  // Pricing
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  currency: string;
  taxable: boolean;
  taxRate?: number | null;
  
  // Inventory
  trackQuantity: boolean;
  quantity: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  allowBackorder: boolean;
  
  // Physical attributes
  weight?: number | null;
  weightUnit: WeightUnit;
  dimensions?: ProductDimensions | null;
  
  // Images and media
  images: ProductImage[];
  videos?: ProductVideo[] | null;
  documents?: ProductDocument[] | null;
  
  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  
  // Organization
  categoryId?: string | null;
  brandId?: string | null;
  tags: string[];
  
  // Variants
  hasVariants: boolean;
  variants: ProductVariant[];
  variantOptions: VariantOption[];
  
  // Shipping
  shippingRequired: boolean;
  shippingWeight?: number | null;
  shippingDimensions?: ProductDimensions | null;
  shippingClass?: string | null;
  
  // Digital product specific
  digitalFiles?: DigitalFile[] | null;
  downloadLimit?: number | null;
  downloadExpiry?: number | null; // Days
  
  // Features
  featured: boolean;
  featuredAt?: Date | null;
  
  // Timestamps
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  vendor: {
    id: string;
    storeName: string;
    storeSlug: string;
    averageRating: number;
    isVerified: boolean;
  };
  category?: ProductCategory | null;
  brand?: Brand | null;
  reviews?: ProductReview[] | null;
  
  // Computed fields
  averageRating: number;
  reviewCount: number;
  totalSales: number;
  viewCount: number;
  wishlistCount: number;
  
  // Admin fields
  approvedAt?: Date | null;
  approvedBy?: string | null;
  rejectedAt?: Date | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  position: number;
  isMain: boolean;
  createdAt: Date;
}

export interface ProductVideo {
  id: string;
  url: string;
  title?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  duration?: number | null; // Seconds
  position: number;
  createdAt: Date;
}

export interface ProductDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number; // Bytes
  description?: string | null;
  position: number;
  createdAt: Date;
}

export interface DigitalFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number; // Bytes
  description?: string | null;
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode?: string | null;
  
  // Pricing
  price?: number | null;
  comparePrice?: number | null;
  costPrice?: number | null;
  
  // Inventory
  quantity: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  
  // Physical attributes
  weight?: number | null;
  dimensions?: ProductDimensions | null;
  
  // Variant options (e.g., color: red, size: large)
  optionValues: VariantOptionValue[];
  
  // Images
  image?: string | null;
  
  // Status
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface VariantOption {
  id: string;
  productId: string;
  name: string; // e.g., "Color", "Size"
  position: number;
  values: VariantOptionValue[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VariantOptionValue {
  id: string;
  optionId: string;
  value: string; // e.g., "Red", "Large"
  colorCode?: string | null; // For color options
  image?: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  position: number;
  isActive: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  parent?: ProductCategory | null;
  children: ProductCategory[];
  products?: Product[] | null;
  
  // Computed
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  isActive: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  products?: Product[] | null;
  
  // Computed
  productCount: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  orderId?: string | null;
  variantId?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  pros?: string[] | null;
  cons?: string[] | null;
  images?: string[] | null;
  videos?: string[] | null;
  isVerifiedPurchase: boolean;
  helpful: number;
  reported: number;
  status: 'PUBLISHED' | 'PENDING' | 'HIDDEN' | 'DELETED';
  response?: ProductReviewResponse | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductReviewResponse {
  message: string;
  respondedAt: Date;
  respondedBy: string;
}

export interface ProductQA {
  id: string;
  productId: string;
  userId: string;
  question: string;
  answer?: string | null;
  answeredBy?: string | null;
  answeredAt?: Date | null;
  helpful: number;
  reported: number;
  status: 'PUBLISHED' | 'PENDING' | 'HIDDEN' | 'DELETED';
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  type: ProductType;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  currency: string;
  taxable: boolean;
  taxRate?: number;
  trackQuantity: boolean;
  quantity: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  weight?: number;
  weightUnit: WeightUnit;
  dimensions?: ProductDimensions;
  categoryId?: string;
  brandId?: string;
  tags: string[];
  images: string[];
  videos?: string[];
  documents?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  shippingRequired: boolean;
  shippingWeight?: number;
  shippingDimensions?: ProductDimensions;
  shippingClass?: string;
  digitalFiles?: string[];
  downloadLimit?: number;
  downloadExpiry?: number;
  variants?: CreateProductVariantRequest[];
  variantOptions?: CreateVariantOptionRequest[];
}

export interface CreateProductVariantRequest {
  sku: string;
  barcode?: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  quantity: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: ProductDimensions;
  optionValues: string[]; // Option value IDs
  image?: string;
}

export interface CreateVariantOptionRequest {
  name: string;
  values: Array<{
    value: string;
    colorCode?: string;
    image?: string;
  }>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
  status?: ProductStatus;
}

export interface ProductListFilters {
  vendorId?: string;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  type?: ProductType;
  stockStatus?: StockStatus;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  tags?: string[];
  featured?: boolean;
  hasDiscount?: boolean;
  inStock?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'name' | 'price' | 'rating' | 'sales' | 'views' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductSearchFilters extends ProductListFilters {
  rating?: number;
  freeShipping?: boolean;
  fastDelivery?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export interface ProductInventoryUpdate {
  productId: string;
  variantId?: string;
  quantity: number;
  operation: 'SET' | 'ADD' | 'SUBTRACT';
  reason?: string;
}

export interface ProductAnalytics {
  views: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    unique: number;
  };
  sales: {
    total: number;
    thisMonth: number;
    revenue: number;
    averageOrderValue: number;
  };
  inventory: {
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  ratings: {
    average: number;
    total: number;
    distribution: Record<number, number>;
  };
  traffic: {
    sources: Array<{
      source: string;
      visits: number;
      percentage: number;
    }>;
    devices: Array<{
      device: string;
      visits: number;
      percentage: number;
    }>;
  };
  topProducts: Array<{
    productId: string;
    name: string;
    views: number;
    sales: number;
    revenue: number;
  }>;
  performanceChart: Array<{
    date: string;
    views: number;
    sales: number;
    revenue: number;
  }>;
}

export interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  image: string;
  averageRating: number;
  reviewCount: number;
  vendorName: string;
}

export interface ProductComparison {
  products: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    features: Record<string, string | number | boolean>;
  }>;
  comparisonFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'rating';
  }>;
}