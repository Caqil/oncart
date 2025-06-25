import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Cart, 
  CartItem, 
  CartState,
  CartValidation,
  CartPreferences,
  AppliedCartCoupon,
  BulkAddToCart,
  CartRecommendations
} from '@/types/cart';
import { API_ROUTES } from '@/lib/constants';
import { useAuth } from './use-auth';
import { useCurrency } from './use-currency';

interface UseCartReturn {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  currency: string;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  validation: CartValidation | null;
  recommendations: CartRecommendations | null;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<boolean>;
  updateItem: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  bulkAddItems: (items: BulkAddToCart) => Promise<boolean>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: (couponId: string) => Promise<boolean>;
  validateCart: () => Promise<CartValidation>;
  refreshCart: () => Promise<void>;
  getItemById: (itemId: string) => CartItem | undefined;
  getItemByProduct: (productId: string, variantId?: string) => CartItem | undefined;
  hasItem: (productId: string, variantId?: string) => boolean;
  getTotalByVendor: (vendorId: string) => number;
  getItemsByVendor: (vendorId: string) => CartItem[];
  estimateShipping: (address: any) => Promise<any>;
}

export function useCart(): UseCartReturn {
  const { user, isAuthenticated } = useAuth();
  const { convertPrice } = useCurrency();
  const [cartState, setCartState] = useState<CartState>({
    cart: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    pendingOperations: 0,
  });
  const [validation, setValidation] = useState<CartValidation | null>(null);
  const [recommendations, setRecommendations] = useState<CartRecommendations | null>(null);

  // Load cart on mount and auth changes
  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  const loadCart = useCallback(async (): Promise<void> => {
    try {
      setCartState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(API_ROUTES.CART);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load cart');
      }

      setCartState(prev => ({
        ...prev,
        cart: data.cart,
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error: any) {
      setCartState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  }, []);

  const addItem = useCallback(async (
    productId: string, 
    variantId?: string, 
    quantity: number = 1
  ): Promise<boolean> => {
    try {
      setCartState(prev => ({ ...prev, pendingOperations: prev.pendingOperations + 1 }));
      
      const response = await fetch(`${API_ROUTES.CART}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }

      setCartState(prev => ({
        ...prev,
        cart: data.cart,
        lastUpdated: new Date(),
        pendingOperations: prev.pendingOperations - 1,
      }));

      toast.success('Item added to cart');
      return true;
    } catch (error: any) {
      setCartState(prev => ({ 
        ...prev, 
        error: error.message,
        pendingOperations: prev.pendingOperations - 1,
      }));
      toast.error(error.message || 'Failed to add item to cart');
      return false;
    }
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      setCartState(prev => ({ ...prev, pendingOperations: prev.pendingOperations + 1 }));
      
      const response = await fetch(`${API_ROUTES.CART}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update item');
      }

      setCartState(prev => ({
        ...prev,
        cart: data.cart,
        lastUpdated: new Date(),
        pendingOperations: prev.pendingOperations - 1,
      }));

      return true;
    } catch (error: any) {
      setCartState(prev => ({ 
        ...prev, 
        error: error.message,
        pendingOperations: prev.pendingOperations - 1,
      }));
      toast.error(error.message || 'Failed to update item');
      return false;
    }
  }, []);

  const removeItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      setCartState(prev => ({ ...prev, pendingOperations: prev.pendingOperations + 1 }));
      
      const response = await fetch(`${API_ROUTES.CART}/items/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove item');
      }

      setCartState(prev => ({
        ...prev,
        cart: data.cart,
        lastUpdated: new Date(),
        pendingOperations: prev.pendingOperations - 1,
      }));

      toast.success('Item removed from cart');
      return true;
    } catch (error: any) {
      setCartState(prev => ({ 
        ...prev, 
        error: error.message,
        pendingOperations: prev.pendingOperations - 1,
      }));
      toast.error(error.message || 'Failed to remove item');
      return false;
    }
  }, []);

  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      setCartState(prev => ({ ...prev, pendingOperations: prev.pendingOperations + 1 }));
      
      const response = await fetch(API_ROUTES.CART, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      setCartState(prev => ({
        ...prev,
        cart: null,
        lastUpdated: new Date(),
        pendingOperations: prev.pendingOperations - 1,
      }));

      toast.success('Cart cleared');
      return true;
    } catch (error: any) {
      setCartState(prev => ({ 
        ...prev, 
        error: error.message,
        pendingOperations: prev.pendingOperations - 1,
      }));
      toast.error(error.message || 'Failed to clear cart');
      return false;
    }
  }, []);

  const bulkAddItems = useCallback(async (items: BulkAddToCart): Promise<boolean> => {
    try {
      setCartState(prev => ({ ...prev, pendingOperations: prev.pendingOperations + 1 }));
      
      const response = await fetch(`${API_ROUTES.CART}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add items to cart');
      }

      setCartState(prev => ({
        ...prev,
        cart: data.cart,
        lastUpdated: new Date(),
        pendingOperations: prev.pendingOperations - 1,
      }));

      toast.success('Items added to cart');
      return true;
    } catch (error: any) {
      setCartState(prev => ({ 
        ...prev, 
        error: error.message,
        pendingOperations: prev.pendingOperations - 1,
      }));
      toast.error(error.message || 'Failed to add items to cart');
      return false;
    }
  }, []);

  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    try {
      setCartState(prev => ({ ...prev, pendingOperations: prev.pendingOperations + 1 }));
      
      const response = await fetch(`${API_ROUTES.CART}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply coupon');
      }

      setCartState(prev => ({
        ...prev,
        cart: data.cart,
        lastUpdated: new Date(),
        pendingOperations: prev.pendingOperations - 1,
      }));

      toast.success('Coupon applied successfully');
      return true;
    } catch (error: any) {
      setCartState(prev => ({ 
        ...prev, 
        error: error.message,
        pendingOperations: prev.pendingOperations - 1,
      }));
      toast.error(error.message || 'Failed to apply coupon');
      return false;
    }
  }, []);

  const removeCoupon = useCallback(async (couponId: string): Promise<boolean> => {
    try {
      setCartState(prev => ({ ...prev, pendingOperations: prev.pendingOperations + 1 }));
      
      const response = await fetch(`${API_ROUTES.CART}/coupons/${couponId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove coupon');
      }

      setCartState(prev => ({
        ...prev,
        cart: data.cart,
        lastUpdated: new Date(),
        pendingOperations: prev.pendingOperations - 1,
      }));

      toast.success('Coupon removed');
      return true;
    } catch (error: any) {
      setCartState(prev => ({ 
        ...prev, 
        error: error.message,
        pendingOperations: prev.pendingOperations - 1,
      }));
      toast.error(error.message || 'Failed to remove coupon');
      return false;
    }
  }, []);

  const validateCart = useCallback(async (): Promise<CartValidation> => {
    try {
      const response = await fetch(`${API_ROUTES.CART}/validate`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate cart');
      }

      setValidation(data.validation);
      return data.validation;
    } catch (error: any) {
      toast.error(error.message || 'Failed to validate cart');
      throw error;
    }
  }, []);

  const refreshCart = useCallback(async (): Promise<void> => {
    await loadCart();
  }, [loadCart]);

  const getItemById = useCallback((itemId: string): CartItem | undefined => {
    return cartState.cart?.items.find(item => item.id === itemId);
  }, [cartState.cart?.items]);

  const getItemByProduct = useCallback((productId: string, variantId?: string): CartItem | undefined => {
    return cartState.cart?.items.find(item => 
      item.productId === productId && item.variantId === variantId
    );
  }, [cartState.cart?.items]);

  const hasItem = useCallback((productId: string, variantId?: string): boolean => {
    return !!getItemByProduct(productId, variantId);
  }, [getItemByProduct]);

  const getTotalByVendor = useCallback((vendorId: string): number => {
    return cartState.cart?.items
      .filter(item => item.vendor.id === vendorId)
      .reduce((total, item) => total + item.totalPrice, 0) || 0;
  }, [cartState.cart?.items]);

  const getItemsByVendor = useCallback((vendorId: string): CartItem[] => {
    return cartState.cart?.items.filter(item => item.vendor.id === vendorId) || [];
  }, [cartState.cart?.items]);

  const estimateShipping = useCallback(async (address: any): Promise<any> => {
    try {
      const response = await fetch(`${API_ROUTES.CART}/shipping/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to estimate shipping');
      }

      return data.estimates;
    } catch (error: any) {
      toast.error(error.message || 'Failed to estimate shipping');
      throw error;
    }
  }, []);

  // Computed values
  const items = cartState.cart?.items || [];
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const subtotal = cartState.cart?.subtotal || 0;
  const total = cartState.cart?.total || 0;
  const currency = cartState.cart?.currency || 'USD';
  const isEmpty = items.length === 0;

  return {
    cart: cartState.cart,
    items,
    itemCount,
    subtotal,
    total,
    currency,
    isLoading: cartState.isLoading,
    error: cartState.error,
    isEmpty,
    validation,
    recommendations,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    bulkAddItems,
    applyCoupon,
    removeCoupon,
    validateCart,
    refreshCart,
    getItemById,
    getItemByProduct,
    hasItem,
    getTotalByVendor,
    getItemsByVendor,
    estimateShipping,
  };
}
