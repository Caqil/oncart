import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WishlistItem } from '@/types/user';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface WishlistStore extends WishlistState {
  // Actions
  addItem: (productId: string, variantId?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  moveToCart: (itemId: string, quantity?: number) => Promise<void>;
  moveAllToCart: () => Promise<void>;
  
  // Utilities
  isInWishlist: (productId: string, variantId?: string) => boolean;
  getItemById: (itemId: string) => WishlistItem | undefined;
  getItemByProduct: (productId: string, variantId?: string) => WishlistItem | undefined;
  getItemCount: () => number;
  getTotalValue: () => number;
  getAvailableItems: () => WishlistItem[];
  getUnavailableItems: () => WishlistItem[];
  
  // Bulk operations
  removeMultipleItems: (itemIds: string[]) => Promise<void>;
  moveMultipleToCart: (itemIds: string[]) => Promise<void>;
  
  // Data management
  loadWishlist: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Add item to wishlist
      addItem: async (productId: string, variantId?: string) => {
        // Check if item already exists
        const existingItem = get().getItemByProduct(productId, variantId);
        if (existingItem) {
          throw new Error('Item already in wishlist');
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, variantId }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add item to wishlist');
          }
          
          const newItem: WishlistItem = await response.json();
          
          set((state) => ({
            items: [...state.items, newItem],
            isLoading: false,
            lastUpdated: new Date(),
          }));
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add item',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Remove item from wishlist
      removeItem: async (itemId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`/api/wishlist/${itemId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to remove item from wishlist');
          }
          
          set((state) => ({
            items: state.items.filter(item => item.id !== itemId),
            isLoading: false,
            lastUpdated: new Date(),
          }));
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to remove item',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Clear entire wishlist
      clearWishlist: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/wishlist', {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to clear wishlist');
          }
          
          set({
            items: [],
            isLoading: false,
            lastUpdated: new Date(),
          });
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to clear wishlist',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Move item to cart
      moveToCart: async (itemId: string, quantity: number = 1) => {
        const item = get().getItemById(itemId);
        if (!item) {
          throw new Error('Item not found in wishlist');
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Add to cart
          const cartResponse = await fetch('/api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.productId,
              variantId: item.productVariantId,
              quantity,
            }),
          });
          
          if (!cartResponse.ok) {
            const error = await cartResponse.json();
            throw new Error(error.message || 'Failed to add item to cart');
          }
          
          // Remove from wishlist
          await get().removeItem(itemId);
          
          set({ isLoading: false });
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to move item to cart',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Move all items to cart
      moveAllToCart: async () => {
        const availableItems = get().getAvailableItems();
        
        if (availableItems.length === 0) {
          throw new Error('No available items to move to cart');
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const movePromises = availableItems.map(item =>
            get().moveToCart(item.id, 1)
          );
          
          await Promise.all(movePromises);
          
          set({ isLoading: false });
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to move items to cart',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Utility functions
      isInWishlist: (productId: string, variantId?: string) => {
        const items = get().items;
        return items.some(item => 
          item.productId === productId && 
          item.productVariantId === variantId
        );
      },
      
      getItemById: (itemId: string) => {
        return get().items.find(item => item.id === itemId);
      },
      
      getItemByProduct: (productId: string, variantId?: string) => {
        return get().items.find(item => 
          item.productId === productId && 
          item.productVariantId === variantId
        );
      },
      
      getItemCount: () => {
        return get().items.length;
      },
      
      getTotalValue: () => {
        return get().items.reduce((total, item) => {
          return total + item.product.price;
        }, 0);
      },
      
      getAvailableItems: () => {
        return get().items.filter(item => item.product.inStock);
      },
      
      getUnavailableItems: () => {
        return get().items.filter(item => !item.product.inStock);
      },
      
      // Bulk operations
      removeMultipleItems: async (itemIds: string[]) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/wishlist/bulk', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemIds }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to remove items');
          }
          
          set((state) => ({
            items: state.items.filter(item => !itemIds.includes(item.id)),
            isLoading: false,
            lastUpdated: new Date(),
          }));
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to remove items',
            isLoading: false,
          });
          throw error;
        }
      },
      
      moveMultipleToCart: async (itemIds: string[]) => {
        const items = get().items.filter(item => itemIds.includes(item.id));
        
        if (items.length === 0) {
          throw new Error('No items found to move to cart');
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const movePromises = items.map(item =>
            get().moveToCart(item.id, 1)
          );
          
          await Promise.all(movePromises);
          
          set({ isLoading: false });
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to move items to cart',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Data management
      loadWishlist: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/wishlist');
          
          if (response.ok) {
            const items: WishlistItem[] = await response.json();
            set({
              items,
              isLoading: false,
              lastUpdated: new Date(),
            });
          } else {
            set({
              items: [],
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load wishlist',
            isLoading: false,
          });
        }
      },
      
      syncWithServer: async () => {
        try {
          const response = await fetch('/api/wishlist/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: get().items }),
          });
          
          if (response.ok) {
            const syncedItems: WishlistItem[] = await response.json();
            set({
              items: syncedItems,
              lastUpdated: new Date(),
            });
          }
        } catch (error) {
          console.error('Failed to sync wishlist:', error);
        }
      },
      
      // Loading and error management
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'wishlist-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Selectors for better performance
export const useWishlistItems = () => useWishlistStore((state) => state.items);
export const useWishlistItemCount = () => useWishlistStore((state) => state.getItemCount());
export const useWishlistTotal = () => useWishlistStore((state) => state.getTotalValue());
export const useIsInWishlist = (productId: string, variantId?: string) => 
  useWishlistStore((state) => state.isInWishlist(productId, variantId));
export const useWishlistLoading = () => useWishlistStore((state) => state.isLoading);
export const useWishlistError = () => useWishlistStore((state) => state.error);