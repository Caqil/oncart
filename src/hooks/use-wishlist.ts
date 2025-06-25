import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { API_ROUTES } from '@/lib/constants';
import { useAuth } from './use-auth';
import { Wishlist, WishlistItem } from '@/types/wishlist';

interface UseWishlistReturn {
  wishlist: Wishlist | null;
  items: WishlistItem[];
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  addItem: (productId: string) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  toggleItem: (productId: string) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  hasItem: (productId: string) => boolean;
  getItemById: (productId: string) => WishlistItem | undefined;
  moveToCart: (productId: string, quantity?: number) => Promise<boolean>;
  shareWishlist: () => Promise<string>;
  refreshWishlist: () => Promise<void>;
  createWishlist: (name: string, isPublic?: boolean) => Promise<boolean>;
  getWishlists: () => Promise<Wishlist[]>;
}

export function useWishlist(): UseWishlistReturn {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load wishlist on mount and auth changes
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlist(null);
    }
  }, [isAuthenticated]);

  const loadWishlist = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(API_ROUTES.WISHLIST);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load wishlist');
      }

      setWishlist(data.wishlist);
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addItem = useCallback(async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return false;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_ROUTES.WISHLIST}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to wishlist');
      }

      setWishlist(data.wishlist);
      toast.success('Item added to wishlist');
      return true;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to add item to wishlist');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const removeItem = useCallback(async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setIsLoading(true);

      const response = await fetch(`${API_ROUTES.WISHLIST}/items/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove item from wishlist');
      }

      setWishlist(data.wishlist);
      toast.success('Item removed from wishlist');
      return true;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to remove item from wishlist');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const hasItem = useCallback((productId: string): boolean => {
    return !!wishlist?.items.some(item => item.productId === productId);
  }, [wishlist?.items]);

  const toggleItem = useCallback(async (productId: string): Promise<boolean> => {
    const exists = hasItem(productId);
    return exists ? removeItem(productId) : addItem(productId);
  }, [hasItem, removeItem, addItem]);

  const clearWishlist = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setIsLoading(true);

      const response = await fetch(API_ROUTES.WISHLIST, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear wishlist');
      }

      setWishlist(null);
      toast.success('Wishlist cleared');
      return true;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to clear wishlist');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const getItemById = useCallback((productId: string): WishlistItem | undefined => {
    return wishlist?.items.find(item => item.productId === productId);
  }, [wishlist?.items]);

  const moveToCart = useCallback(async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error('Please login to move items to cart');
      return false;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_ROUTES.WISHLIST}/items/${productId}/move-to-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to move item to cart');
      }

      setWishlist(data.wishlist);
      toast.success('Item moved to cart');
      return true;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to move item to cart');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const shareWishlist = useCallback(async (): Promise<string> => {
    if (!isAuthenticated || !wishlist) {
      throw new Error('No wishlist to share');
    }

    try {
      const response = await fetch(`${API_ROUTES.WISHLIST}/share`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to share wishlist');
      }

      toast.success('Wishlist share link generated');
      return data.shareUrl;
    } catch (error: any) {
      toast.error(error.message || 'Failed to share wishlist');
      throw error;
    }
  }, [isAuthenticated, wishlist]);

  const refreshWishlist = useCallback(async (): Promise<void> => {
    await loadWishlist();
  }, [loadWishlist]);

  const createWishlist = useCallback(async (name: string, isPublic: boolean = false): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error('Please login to create wishlist');
      return false;
    }

    try {
      setIsLoading(true);

      const response = await fetch(API_ROUTES.WISHLIST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, isPublic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create wishlist');
      }

      setWishlist(data.wishlist);
      toast.success('Wishlist created successfully');
      return true;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to create wishlist');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const getWishlists = useCallback(async (): Promise<Wishlist[]> => {
    if (!isAuthenticated) return [];

    try {
      const response = await fetch(`${API_ROUTES.WISHLIST}/all`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load wishlists');
      }

      return data.wishlists;
    } catch (error: any) {
      toast.error(error.message || 'Failed to load wishlists');
      return [];
    }
  }, [isAuthenticated]);

  // Computed values
  const items = wishlist?.items || [];
  const itemCount = items.length;
  const isEmpty = itemCount === 0;

  return {
    wishlist,
    items,
    itemCount,
    isLoading,
    error,
    isEmpty,
    addItem,
    removeItem,
    toggleItem,
    clearWishlist,
    hasItem,
    getItemById,
    moveToCart,
    shareWishlist,
    refreshWishlist,
    createWishlist,
    getWishlists,
  };
}
