"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import {
  Cart,
  CartItem,
  CartValidation,
  AppliedCartCoupon,
} from "@/types/cart";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/hooks/use-currency";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  validation: CartValidation | null;
  lastUpdated: Date | null;
  pendingOperations: number;
}

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CART"; payload: Cart | null }
  | { type: "SET_VALIDATION"; payload: CartValidation | null }
  | { type: "INCREMENT_PENDING" }
  | { type: "DECREMENT_PENDING" }
  | { type: "UPDATE_ITEM"; payload: { itemId: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "APPLY_COUPON"; payload: AppliedCartCoupon }
  | { type: "REMOVE_COUPON"; payload: string };

interface CartContextType {
  state: CartState;
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  isEmpty: boolean;
  isLoading: boolean;
  error: string | null;
  validation: CartValidation | null;
  addItem: (
    productId: string,
    variantId?: string,
    quantity?: number
  ) => Promise<boolean>;
  updateItem: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: (couponId: string) => Promise<boolean>;
  validateCart: () => Promise<CartValidation>;
  refreshCart: () => Promise<void>;
  getItemById: (itemId: string) => CartItem | undefined;
  hasItem: (productId: string, variantId?: string) => boolean;
  getTotalByVendor: (vendorId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  validation: null,
  lastUpdated: null,
  pendingOperations: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_CART":
      return {
        ...state,
        cart: action.payload,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
      };

    case "SET_VALIDATION":
      return { ...state, validation: action.payload };

    case "INCREMENT_PENDING":
      return { ...state, pendingOperations: state.pendingOperations + 1 };

    case "DECREMENT_PENDING":
      return {
        ...state,
        pendingOperations: Math.max(0, state.pendingOperations - 1),
      };

    case "UPDATE_ITEM":
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map((item) =>
            item.id === action.payload.itemId
              ? { ...item, quantity: action.payload.quantity }
              : item
          ),
        },
      };

    case "REMOVE_ITEM":
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter((item) => item.id !== action.payload),
        },
      };

    case "CLEAR_CART":
      return {
        ...state,
        cart: state.cart
          ? { ...state.cart, items: [], appliedCoupons: [] }
          : null,
      };

    case "APPLY_COUPON":
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          appliedCoupons: [...state.cart.appliedCoupons, action.payload],
        },
      };

    case "REMOVE_COUPON":
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          appliedCoupons: state.cart.appliedCoupons.filter(
            (coupon) => coupon.id !== action.payload
          ),
        },
      };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();
  const { convertPrice } = useCurrency();

  // Load cart on mount and auth changes
  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  // Auto-save cart to localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated && state.cart) {
      localStorage.setItem("guest_cart", JSON.stringify(state.cart));
    }
  }, [state.cart, isAuthenticated]);

  const loadCart = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      if (isAuthenticated) {
        // Load authenticated user's cart
        const response = await fetch("/api/cart");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load cart");
        }

        dispatch({ type: "SET_CART", payload: data.cart });
      } else {
        // Load guest cart from localStorage
        const guestCart = localStorage.getItem("guest_cart");
        if (guestCart) {
          try {
            const parsedCart = JSON.parse(guestCart);
            dispatch({ type: "SET_CART", payload: parsedCart });
          } catch (error) {
            localStorage.removeItem("guest_cart");
          }
        }
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [isAuthenticated]);

  const addItem = useCallback(
    async (
      productId: string,
      variantId?: string,
      quantity: number = 1
    ): Promise<boolean> => {
      try {
        dispatch({ type: "INCREMENT_PENDING" });

        const response = await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, variantId, quantity }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add item to cart");
        }

        dispatch({ type: "SET_CART", payload: data.cart });
        toast.success("Item added to cart");
        return true;
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.message });
        toast.error(error.message || "Failed to add item to cart");
        return false;
      } finally {
        dispatch({ type: "DECREMENT_PENDING" });
      }
    },
    []
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number): Promise<boolean> => {
      try {
        dispatch({ type: "INCREMENT_PENDING" });

        const response = await fetch(`/api/cart/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update cart item");
        }

        dispatch({ type: "SET_CART", payload: data.cart });
        return true;
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.message });
        toast.error(error.message || "Failed to update cart item");
        return false;
      } finally {
        dispatch({ type: "DECREMENT_PENDING" });
      }
    },
    []
  );

  const removeItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      dispatch({ type: "INCREMENT_PENDING" });

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to remove item from cart");
      }

      dispatch({ type: "REMOVE_ITEM", payload: itemId });
      toast.success("Item removed from cart");
      return true;
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      toast.error(error.message || "Failed to remove item from cart");
      return false;
    } finally {
      dispatch({ type: "DECREMENT_PENDING" });
    }
  }, []);

  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      dispatch({ type: "INCREMENT_PENDING" });

      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to clear cart");
      }

      dispatch({ type: "CLEAR_CART" });
      if (!isAuthenticated) {
        localStorage.removeItem("guest_cart");
      }
      toast.success("Cart cleared");
      return true;
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      toast.error(error.message || "Failed to clear cart");
      return false;
    } finally {
      dispatch({ type: "DECREMENT_PENDING" });
    }
  }, [isAuthenticated]);

  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    try {
      dispatch({ type: "INCREMENT_PENDING" });

      const response = await fetch("/api/cart/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to apply coupon");
      }

      dispatch({ type: "SET_CART", payload: data.cart });
      toast.success("Coupon applied successfully");
      return true;
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      toast.error(error.message || "Failed to apply coupon");
      return false;
    } finally {
      dispatch({ type: "DECREMENT_PENDING" });
    }
  }, []);

  const removeCoupon = useCallback(
    async (couponId: string): Promise<boolean> => {
      try {
        dispatch({ type: "INCREMENT_PENDING" });

        const response = await fetch(`/api/cart/coupons/${couponId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to remove coupon");
        }

        dispatch({ type: "REMOVE_COUPON", payload: couponId });
        toast.success("Coupon removed");
        return true;
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.message });
        toast.error(error.message || "Failed to remove coupon");
        return false;
      } finally {
        dispatch({ type: "DECREMENT_PENDING" });
      }
    },
    []
  );

  const validateCart = useCallback(async (): Promise<CartValidation> => {
    try {
      const response = await fetch("/api/cart/validate");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to validate cart");
      }

      dispatch({ type: "SET_VALIDATION", payload: data.validation });
      return data.validation;
    } catch (error: any) {
      const validation: CartValidation = {
        isValid: false,
        errors: [{
          type: "ITEM_UNAVAILABLE",
          itemId: "",
          message: error.message,
        }],
        warnings: [],
      };
      dispatch({ type: "SET_VALIDATION", payload: validation });
      return validation;
    }
  }, []);

  const refreshCart = useCallback(async (): Promise<void> => {
    await loadCart();
  }, [loadCart]);

  const getItemById = useCallback(
    (itemId: string): CartItem | undefined => {
      return state.cart?.items.find((item) => item.id === itemId);
    },
    [state.cart?.items]
  );

  const hasItem = useCallback(
    (productId: string, variantId?: string): boolean => {
      if (!state.cart) return false;
      return state.cart.items.some(
        (item) => item.productId === productId && item.variantId === variantId
      );
    },
    [state.cart]
  );

  const getTotalByVendor = useCallback(
    (vendorId: string): number => {
      if (!state.cart) return 0;
      return state.cart.items
        .filter((item) => item.vendor.id === vendorId)
        .reduce((total, item) => total + item.unitPrice * item.quantity, 0);
    },
    [state.cart]
  );

  // Computed values
  const items = state.cart?.items || [];
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );
  const total = state.cart?.total || subtotal;
  const isEmpty = itemCount === 0;

  const value: CartContextType = {
    state,
    cart: state.cart,
    items,
    itemCount,
    subtotal,
    total,
    isEmpty,
    isLoading: state.isLoading,
    error: state.error,
    validation: state.validation,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    validateCart,
    refreshCart,
    getItemById,
    hasItem,
    getTotalByVendor,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
