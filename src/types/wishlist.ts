export interface Wishlist {
  id: string;
  userId: string;
  name?: string | null;
  description?: string | null;
  items: WishlistItem[];
  itemCount: number;
  total: number;
  currency: string;
  isPublic: boolean;
  shareToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  userId: string;
  productId: string;
  variantId?: string | null;
  addedAt: Date;
  notes?: string | null;
  
  // Product snapshot
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    comparePrice?: number | null;
    inStock: boolean;
    stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'BACKORDER';
    averageRating: number;
    reviewCount: number;
    
    // Vendor info
    vendor: {
      id: string;
      storeName: string;
      storeSlug: string;
      isVerified: boolean;
    };
  };
  
  // Variant info if applicable
  variant?: {
    id: string;
    sku: string;
    price?: number | null;
    comparePrice?: number | null;
    inStock: boolean;
    optionValues: Array<{
      optionName: string;
      value: string;
      colorCode?: string | null;
    }>;
  } | null;
}

export interface CreateWishlistRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateWishlistRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddToWishlistRequest {
  productId: string;
  variantId?: string;
  notes?: string;
}

export interface WishlistShare {
  id: string;
  wishlistId: string;
  shareToken: string;
  expiresAt?: Date | null;
  viewCount: number;
  createdAt: Date;
}

export interface WishlistAnalytics {
  totalWishlists: number;
  totalItems: number;
  mostWishedProducts: Array<{
    productId: string;
    name: string;
    wishlistCount: number;
    conversionRate: number;
  }>;
  wishlistConversionRate: number;
  averageItemsPerWishlist: number;
  publicWishlistsCount: number;
  sharedWishlistsCount: number;
}
