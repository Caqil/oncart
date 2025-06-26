import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import { API_ROUTES } from '@/lib/constants';

interface SearchResult {
  id: string;
  type: 'product' | 'category' | 'vendor' | 'brand';
  title: string;
  subtitle?: string;
  url: string;
  image?: string;
  price?: number;
  rating?: number;
}

interface SearchSuggestion {
  query: string;
  count: number;
}

interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  suggestions: SearchSuggestion[];
  recentSearches: string[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearRecentSearches: () => void;
  removeRecentSearch: (query: string) => void;
  addRecentSearch: (query: string) => void;
}

export function useSearch(): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recent-searches', []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROUTES.PRODUCTS}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Search failed');
      }

      setSearchResults(data.results);
      addRecentSearch(query);
    } catch (error: any) {
      setError(error.message);
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== trimmedQuery);
      return [trimmedQuery, ...filtered].slice(0, 10);
    });
  }, [setRecentSearches]);

  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches(prev => prev.filter(item => item !== query));
  }, [setRecentSearches]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, [setRecentSearches]);

  // Load suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const response = await fetch(`${API_ROUTES.PRODUCTS}/search/suggestions`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Failed to load search suggestions:', error);
      }
    };

    loadSuggestions();
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    suggestions,
    recentSearches,
    isLoading,
    error,
    search,
    clearRecentSearches,
    removeRecentSearch,
    addRecentSearch,
  };
}