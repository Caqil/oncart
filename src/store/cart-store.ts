import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Cart,
  CartItem,
  CartSummary,
  CartState,
  CartAction,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
  ApplyCouponRequest,
  RemoveCouponRequest,
  CartValidation,
  ShippingOption,
  AppliedCartCoupon,
  CartPreferences,
} from '@/types/cart';

interface CartStore extends CartState {
  // Cart actions
  addItem: (request: AddToCartRequest) => Promise<void>;
  updateItem: (request: UpdateCartItemRequest) => Promise<void>;
  removeItem: (request: RemoveCartItemRequest) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Coupon actions
  applyCoupon: (request: ApplyCouponRequest) => Promise<void>;
  removeCoupon: (request: RemoveCouponRequest) => Promise<void>;
  
  // Shipping actions
  setShippingMethod: (methodId: string) => Promise<void>;
  calculateShipping: (address: any) => Promise<ShippingOption[]>;
  
  // Cart management
  loadCart: () => Promise<void>;
  saveCart: () => Promise<void>;
  validateCart: () => Promise<CartValidation>;
  mergeGuestCart: (guestCartId: string) => Promise<void>;
  
  // Utilities
  getCartSummary: () => CartSummary;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  hasItems: () => boolean;
  getItemById: (itemId: string) => CartItem | undefined;
  getVendorItems: (vendorId: string) => CartItem[];
  
  // Preferences
  updatePreferences: (preferences: Partial<CartPreferences>) => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  pendingOperations: 0,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Add item to cart
      addItem: async (request: AddToCartRequest) => {
        set((state) => ({ 
          pendingOperations: state.pendingOperations + 1,
          error: null 
        }));
        
        try {
          const response = await fetch('/api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add item to cart');
          }
          
          const updatedCart: Cart = await response.json();
          
          set((state) => ({
            cart: updatedCart,
            lastUpdated: new Date(),
            pendingOperations: state.pendingOperations - 1,
          }));
          
        } catch (error) {
          set((state) => ({
            error: error instanceof Error ? error.message : 'Failed to add item',
            pendingOperations: state.pendingOperations - 1,
          }));
          throw error;
        }
      },
      
      // Update cart item
      updateItem: async (request: UpdateCartItemRequest) => {
        set((state) => ({ 
          pendingOperations: state.pendingOperations + 1,
          error: null 
        }));
        
        try {
          const response = await fetch(`/api/cart/items/${request.itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: request.quantity }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update item');
          }
          
          const updatedCart: Cart = await response.json();
          
          set((state) => ({
            cart: updatedCart,
            lastUpdated: new Date(),
            pendingOperations: state.pendingOperations - 1,
          }));
          
        } catch (error) {
          set((state) => ({
            error: error instanceof Error ? error.message : 'Failed to update item',
            pendingOperations: state.pendingOperations - 1,
          }));
          throw error;
        }
      },
      
      // Remove cart item
      removeItem: async (request: RemoveCartItemRequest) => {
        set((state) => ({ 
          pendingOperations: state.pendingOperations + 1,
          error: null 
        }));
        
        try {
          const response = await fetch(`/api/cart/items/${request.itemId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to remove item');
          }
          
          const updatedCart: Cart = await response.json();
          
          set((state) => ({
            cart: updatedCart,
            lastUpdated: new Date(),
            pendingOperations: state.pendingOperations - 1,
          }));
          
        } catch (error) {
          set((state) => ({
            error: error instanceof Error ? error.message : 'Failed to remove item',
            pendingOperations: state.pendingOperations - 1,
          }));
          throw error;
        }
      },
      
      // Clear entire cart
      clearCart: async () => {
        set((state) => ({ 
          pendingOperations: state.pendingOperations + 1,
          error: null 
        }));
        
        try {
          const response = await fetch('/api/cart', {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to clear cart');
          }
          
          set((state) => ({
            cart: null,
            lastUpdated: new Date(),
            pendingOperations: state.pendingOperations - 1,
          }));
          
        } catch (error) {
          set((state) => ({
            error: error instanceof Error ? error.message : 'Failed to clear cart',
            pendingOperations: state.pendingOperations - 1,
          }));
          throw error;
        }
      },
      
      // Apply coupon
      applyCoupon: async (request: ApplyCouponRequest) => {
        set((state) => ({ 
          pendingOperations: state.pendingOperations + 1,
          error: null 
        }));
        
        try {
          const response = await fetch('/api/cart/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to apply coupon');
          }
          
          const updatedCart: Cart = await response.json();
          
          set((state) => ({
            cart: updatedCart,
            lastUpdated: new Date(),
            pendingOperations: state.pendingOperations - 1,
          }));
          
        } catch (error) {
          set((state) => ({
            error: error instanceof Error ? error.message : 'Failed to apply coupon',
            pendingOperations: state.pendingOperations - 1,
          }));
          throw error;
        }
      },
      
      // Remove coupon
      removeCoupon: async (request: RemoveCouponRequest) => {
        set((state) => ({ 
          pendingOperations: state.pendingOperations + 1,
          error: null 
        }));
        
        try {
          const response = await fetch(`/api/cart/coupons/${request.couponId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to remove coupon');
          }
          
          const updatedCart: Cart = await response.json();
          
          set((state) => ({
            cart: updatedCart,
            lastUpdated: new Date(),
            pendingOperations: state.pendingOperations - 1,
          }));
          
        } catch (error) {
          set((state) => ({
            error: error instanceof Error ? error.message : 'Failed to remove coupon',
            pendingOperations: state.pendingOperations - 1,
          }));
          throw error;
        }
      },
      
      // Set shipping method
      setShippingMethod: async (methodId: string) => {
        set((state) => ({ 
          pendingOperations: state.pendingOperations + 1,
          error: null 
        }));
        
        try {
          const response = await fetch('/api/cart/shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shippingMethodId: methodId }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to set shipping method');
          }
          
          const updatedCart: Cart = await response.json();
          
          set((state) => ({
            cart: updatedCart,
            lastUpdated: new Date(),
            pendingOperations: state.pendingOperations - 1,
          }));
          
        } catch (error) {
          set((state) => ({
            error: error instanceof Error ? error.message : 'Failed to set shipping method',
            pendingOperations: state.pendingOperations - 1,
          }));
          throw error;
        }
      },
      
      // Calculate shipping options
      calculateShipping: async (address: any): Promise<ShippingOption[]> => {
        try {
          const response = await fetch('/api/cart/shipping/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to calculate shipping');
          }
          
          return response.json();
        } catch (error) {
          console.error('Shipping calculation failed:', error);
          return [];
        }
      },
      
      // Load cart from server
      loadCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/cart');
          
          if (response.ok) {
            const cart: Cart = await response.json();
            set({
              cart,
              isLoading: false,
              lastUpdated: new Date(),
            });
          } else {
            set({
              cart: null,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load cart',
            isLoading: false,
          });
        }
      },
      
      // Save cart to server
      saveCart: async () => {
        const { cart } = get();
        if (!cart) return;
        
        try {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cart),
          });
        } catch (error) {
          console.error('Failed to save cart:', error);
        }
      },
      
      // Validate cart
      validateCart: async (): Promise<CartValidation> => {
        try {
          const response = await fetch('/api/cart/validate', {
            method: 'POST',
          });
          
          if (!response.ok) {
            throw new Error('Cart validation failed');
          }
          
          return response.json();
        } catch (error) {
          return {
            isValid: false,
            errors: [{
              type: 'ITEM_UNAVAILABLE',
              itemId: '',
              message: 'Cart validation failed',
              currentValue: null,
              expectedValue: null,
            }],
            warnings: [],
          };
        }
      },
      
      // Merge guest cart with user cart
      mergeGuestCart: async (guestCartId: string) => {
        try {
          const response = await fetch('/api/cart/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guestCartId }),
          });
          
          if (response.ok) {
            const mergedCart: Cart = await response.json();
            set({
              cart: mergedCart,
              lastUpdated: new Date(),
            });
          }
        } catch (error) {
          console.error('Failed to merge guest cart:', error);
        }
      },
      
      // Utility functions
      getCartSummary: (): CartSummary => {
        const { cart } = get();
        if (!cart) {
          return {
            itemCount: 0,
            subtotal: 0,
            shippingCost: 0,
            taxAmount: 0,
            discountAmount: 0,
            total: 0,
            currency: 'USD',
            savings: 0,
          };
        }
        
        return {
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: cart.subtotal,
          shippingCost: cart.shippingCost,
          taxAmount: cart.taxAmount,
          discountAmount: cart.discountAmount,
          total: cart.total,
          currency: cart.currency,
          savings: cart.items.reduce((sum, item) => {
            if (item.comparePrice && item.comparePrice > item.unitPrice) {
              return sum + ((item.comparePrice - item.unitPrice) * item.quantity);
            }
            return sum;
          }, 0) + cart.discountAmount,
          estimatedDelivery: cart.estimatedDelivery,
        };
      },
      
      getItemCount: () => {
        const { cart } = get();
        return cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
      },
      
      getSubtotal: () => {
        const { cart } = get();
        return cart ? cart.subtotal : 0;
      },
      
      getTotal: () => {
        const { cart } = get();
        return cart ? cart.total : 0;
      },
      
      hasItems: () => {
        const { cart } = get();
        return cart ? cart.items.length > 0 : false;
      },
      
      getItemById: (itemId: string) => {
        const { cart } = get();
        return cart?.items.find(item => item.id === itemId);
      },
      
      getVendorItems: (vendorId: string) => {
        const { cart } = get();
        return cart ? cart.items.filter(item => item.vendor.id === vendorId) : [];
      },
      
      // Preferences
      updatePreferences: (preferences: Partial<CartPreferences>) => {
        // This would typically save to user profile or local storage
        console.log('Updating cart preferences:', preferences);
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
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Selectors for better performance
export const useCart = () => useCartStore((state) => state.cart);
export const useCartItems = () => useCartStore((state) => state.cart?.items || []);
export const useCartItemCount = () => useCartStore((state) => state.getItemCount());
export const useCartTotal = () => useCartStore((state) => state.getTotal());
export const useCartSummary = () => useCartStore((state) => state.getCartSummary());
export const useCartLoading = () => useCartStore((state) => state.isLoading);
export const useCartError = () => useCartStore((state) => state.error);