import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Product, ProductCategory, ProductFilters, ProductSort } from '@/types/product';
import { API_ROUTES } from '@/lib/constants';
import { useDebounce } from './use-debounce';

interface UseProductsOptions {
  category?: string;
  vendor?: string;
  featured?: boolean;
  limit?: number;
  autoLoad?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  categories: ProductCategory[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  page: number;
  limit: number;
  filters: ProductFilters;
  sortBy: ProductSort;
  searchQuery: string;
  loadProducts: () => Promise<void>;
  loadMore: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  setFilters: (filters: Partial<ProductFilters>) => void;
  setSortBy: (sort: ProductSort) => void;
  resetFilters: () => void;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  getFeaturedProducts: () => Product[];
  getProductsByCategory: (categoryId: string) => Product[];
  getProductsByVendor: (vendorId: string) => Product[];
  refreshProducts: () => Promise<void>;
}

const defaultFilters: ProductFilters = {
  categories: [],
  vendors: [],
  priceRange: { min: 0, max: 10000 },
  rating: 0,
  inStock: true,
  onSale: false,
  featured: false,
  tags: [],
};

const defaultSort: ProductSort = {
  field: 'createdAt',
  direction: 'desc',
};

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    category,
    vendor,
    featured = false,
    limit = 20,
    autoLoad = true,
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFiltersState] = useState<ProductFilters>(defaultFilters);
  const [sortBy, setSortByState] = useState<ProductSort>(defaultSort);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Load products on mount and when dependencies change
  useEffect(() => {
    if (autoLoad) {
      loadProducts();
    }
  }, [category, vendor, featured, debouncedSearchQuery, filters, sortBy]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_ROUTES.PRODUCTS}/categories`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load categories');
      }

      setCategories(data.categories);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...sortBy,
    });

    if (category) params.set('category', category);
    if (vendor) params.set('vendor', vendor);
    if (featured) params.set('featured', 'true');
    if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);

    // Add filters
    if (filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','));
    }
    if (filters.vendors.length > 0) {
      params.set('vendors', filters.vendors.join(','));
    }
    if (filters.priceRange.min > 0) {
      params.set('minPrice', filters.priceRange.min.toString());
    }
    if (filters.priceRange.max < 10000) {
      params.set('maxPrice', filters.priceRange.max.toString());
    }
    if (filters.rating > 0) {
      params.set('rating', filters.rating.toString());
    }
    if (filters.inStock) {
      params.set('inStock', 'true');
    }
    if (filters.onSale) {
      params.set('onSale', 'true');
    }
    if (filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','));
    }

    return params.toString();
  }, [page, limit, category, vendor, featured, debouncedSearchQuery, filters, sortBy]);

  const loadProducts = useCallback(async (reset: boolean = true): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      if (reset) {
        setPage(1);
        setProducts([]);
      }

      const queryParams = buildQueryParams();
      const response = await fetch(`${API_ROUTES.PRODUCTS}?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load products');
      }

      if (reset) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }

      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryParams]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || isLoading) return;

    setPage(prev => prev + 1);
    await loadProducts(false);
  }, [hasMore, isLoading, loadProducts]);

  const searchProducts = useCallback(async (query: string): Promise<void> => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const setFilters = useCallback((newFilters: Partial<ProductFilters>): void => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const setSortBy = useCallback((sort: ProductSort): void => {
    setSortByState(sort);
    setPage(1);
  }, []);

  const resetFilters = useCallback((): void => {
    setFiltersState(defaultFilters);
    setSortByState(defaultSort);
    setSearchQuery('');
    setPage(1);
  }, []);

  const getProductById = useCallback((id: string): Product | undefined => {
    return products.find(product => product.id === id);
  }, [products]);

  const getProductBySlug = useCallback((slug: string): Product | undefined => {
    return products.find(product => product.slug === slug);
  }, [products]);

  const getFeaturedProducts = useCallback((): Product[] => {
    return products.filter(product => product.featured);
  }, [products]);

  const getProductsByCategory = useCallback((categoryId: string): Product[] => {
    return products.filter(product => product.categoryId === categoryId);
  }, [products]);

  const getProductsByVendor = useCallback((vendorId: string): Product[] => {
    return products.filter(product => product.vendorId === vendorId);
  }, [products]);

  const refreshProducts = useCallback(async (): Promise<void> => {
    await loadProducts(true);
  }, [loadProducts]);

  return {
    products,
    categories,
    isLoading,
    error,
    hasMore,
    total,
    page,
    limit,
    filters,
    sortBy,
    searchQuery,
    loadProducts,
    loadMore,
    searchProducts,
    setFilters,
    setSortBy,
    resetFilters,
    getProductById,
    getProductBySlug,
    getFeaturedProducts,
    getProductsByCategory,
    getProductsByVendor,
    refreshProducts,
  };
}
