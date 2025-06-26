import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Order, 
  OrderListFilters, 
  UpdateOrderRequest,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  OrderHistory 
} from '@/types/order';
import { API_ROUTES } from '@/lib/constants';
import { useAuth } from './use-auth';

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: OrderListFilters;
  setFilters: (filters: Partial<OrderListFilters>) => void;
  loadOrders: () => Promise<void>;
  loadMore: () => Promise<void>;
  getOrderById: (id: string) => Promise<Order | null>;
  updateOrder: (id: string, data: UpdateOrderRequest) => Promise<boolean>;
  cancelOrder: (id: string, reason?: string) => Promise<boolean>;
  refundOrder: (id: string, amount?: number, reason?: string) => Promise<boolean>;
  markAsShipped: (id: string, trackingNumber: string, trackingUrl?: string) => Promise<boolean>;
  markAsDelivered: (id: string) => Promise<boolean>;
  getOrderHistory: (id: string) => Promise<OrderHistory[]>;
  exportOrders: (filters?: OrderListFilters) => Promise<string>;
  refreshOrders: () => Promise<void>;
  searchOrders: (query: string) => Promise<void>;
}

export function useOrders(initialFilters?: OrderListFilters): UseOrdersReturn {
  const { hasPermission } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFiltersState] = useState<OrderListFilters>(initialFilters || {});
  
  const limit = 25;

  useEffect(() => {
    loadOrders();
  }, [filters, page]);

  const loadOrders = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        ),
      });

      const response = await fetch(`${API_ROUTES.ORDERS}?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load orders');
      }

      if (page === 1) {
        setOrders(data.orders);
      } else {
        setOrders(prev => [...prev, ...data.orders]);
      }
      
      setTotal(data.total);
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (orders.length < total) {
      setPage(prev => prev + 1);
    }
  }, [orders.length, total]);

  const getOrderById = useCallback(async (id: string): Promise<Order | null> => {
    try {
      const response = await fetch(`${API_ROUTES.ORDERS}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load order');
      }

      return data.order;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  }, []);

  const updateOrder = useCallback(async (id: string, data: UpdateOrderRequest): Promise<boolean> => {
    if (!hasPermission('orders:write')) {
      toast.error('You do not have permission to update orders');
      return false;
    }

    try {
      const response = await fetch(`${API_ROUTES.ORDERS}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update order');
      }

      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === id ? { ...order, ...result.order } : order
        )
      );

      toast.success('Order updated successfully');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  }, [hasPermission]);

  const cancelOrder = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    return updateOrder(id, {
      status: OrderStatus.CANCELLED,
      adminNotes: reason,
      notifyCustomer: true,
    });
  }, [updateOrder]);

  const markAsShipped = useCallback(async (
    id: string, 
    trackingNumber: string, 
    trackingUrl?: string
  ): Promise<boolean> => {
    return updateOrder(id, {
      status: OrderStatus.SHIPPED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
      trackingNumber,
      trackingUrl,
      notifyCustomer: true,
    });
  }, [updateOrder]);

  const markAsDelivered = useCallback(async (id: string): Promise<boolean> => {
    return updateOrder(id, {
      status: OrderStatus.DELIVERED,
      fulfillmentStatus: FulfillmentStatus.DELIVERED,
      notifyCustomer: true,
    });
  }, [updateOrder]);

  const refundOrder = useCallback(async (
    id: string, 
    amount?: number, 
    reason?: string
  ): Promise<boolean> => {
    if (!hasPermission('payments:write')) {
      toast.error('You do not have permission to process refunds');
      return false;
    }

    try {
      const response = await fetch(`${API_ROUTES.ORDERS}/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to process refund');
      }

      toast.success('Refund processed successfully');
      await refreshOrders();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  }, [hasPermission]);

  const getOrderHistory = useCallback(async (id: string): Promise<OrderHistory[]> => {
    try {
      const response = await fetch(`${API_ROUTES.ORDERS}/${id}/history`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load order history');
      }

      return data.history;
    } catch (error: any) {
      toast.error(error.message);
      return [];
    }
  }, []);

  const exportOrders = useCallback(async (exportFilters?: OrderListFilters): Promise<string> => {
    try {
      const params = new URLSearchParams({
        export: 'true',
        ...Object.fromEntries(
          Object.entries(exportFilters || filters).filter(([_, value]) => 
            value !== undefined && value !== ''
          )
        ),
      });

      const response = await fetch(`${API_ROUTES.ORDERS}/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to export orders');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      toast.success('Orders exported successfully');
      return url;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, [filters]);

  const setFilters = useCallback((newFilters: Partial<OrderListFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const refreshOrders = useCallback(async (): Promise<void> => {
    setPage(1);
    await loadOrders();
  }, [loadOrders]);

  const searchOrders = useCallback(async (query: string): Promise<void> => {
    setFilters({ search: query });
  }, [setFilters]);

  const hasMore = orders.length < total;

  return {
    orders,
    isLoading,
    error,
    total,
    page,
    limit,
    hasMore,
    filters,
    setFilters,
    loadOrders,
    loadMore,
    getOrderById,
    updateOrder,
    cancelOrder,
    refundOrder,
    markAsShipped,
    markAsDelivered,
    getOrderHistory,
    exportOrders,
    refreshOrders,
    searchOrders,
  };
}