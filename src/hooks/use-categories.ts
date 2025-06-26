import { useState, useEffect, useCallback } from 'react';
import { Category } from '@/types/category';
import { API_ROUTES } from '@/lib/constants';

interface UseCategoriesReturn {
  categories: Category[];
  topCategories: Category[];
  featuredCategories: Category[];
  isLoading: boolean;
  error: string | null;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getCategoryChildren: (parentId: string) => Category[];
  getCategoryPath: (categoryId: string) => Category[];
  searchCategories: (query: string) => Category[];
  refreshCategories: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_ROUTES.PRODUCTS}/categories`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load categories');
      }

      setCategories(data.categories);
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const getCategoryById = useCallback((id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  }, [categories]);

  const getCategoryBySlug = useCallback((slug: string): Category | undefined => {
    return categories.find(category => category.slug === slug);
  }, [categories]);

  const getCategoryChildren = useCallback((parentId: string): Category[] => {
    return categories.filter(category => category.parentId === parentId);
  }, [categories]);

  const getCategoryPath = useCallback((categoryId: string): Category[] => {
    const path: Category[] = [];
    let currentCategory = getCategoryById(categoryId);

    while (currentCategory) {
      path.unshift(currentCategory);
      currentCategory = currentCategory.parentId ? getCategoryById(currentCategory.parentId) : undefined;
    }

    return path;
  }, [categories, getCategoryById]);

  const searchCategories = useCallback((query: string): Category[] => {
    const lowercaseQuery = query.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(lowercaseQuery) ||
      category.description?.toLowerCase().includes(lowercaseQuery)
    );
  }, [categories]);

  const topCategories = categories.filter(cat => cat.level === 0 && cat.isActive);
  const featuredCategories = categories.filter(cat => cat.isFeatured && cat.isActive);

  return {
    categories,
    topCategories,
    featuredCategories,
    isLoading,
    error,
    getCategoryById,
    getCategoryBySlug,
    getCategoryChildren,
    getCategoryPath,
    searchCategories,
    refreshCategories: loadCategories,
  };
}