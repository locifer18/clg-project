// hooks/useProducts.ts
import {
    fetchProducts,
    fetchFeaturedProducts,
    searchProducts,
    fetchProductsByCategory,
    FetchProductsParams,
    Product,
} from "@/features/product/product.api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

// ============= TYPES =============

interface UseProductsReturn extends Omit<UseQueryResult, 'data'> {
    products: Product[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
}

// ============= HOOKS =============

/**
 * Fetch products with filters, sorting, and pagination
 * 
 * Usage:
 * const { products, isLoading } = useProducts({
 *   page: 1,
 *   limit: 20,
 *   sort: 'newest',
 *   category: 'electronics',
 *   search: 'laptop'
 * });
 */
export const useProducts = (
    options?: FetchProductsParams & { enabled?: boolean }
): UseProductsReturn => {
    const query = useQuery({
        queryKey: ["products", options],
        queryFn: () => fetchProducts(options),
        staleTime: 1000 * 60 * 3, // 3 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (garbage collection)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 2,
        enabled: options?.enabled !== false,
    });

    return {
        ...query,
        products: query.data || [],
        isLoading: query.isPending,
        isError: query.isError,
        error: query.error as Error | null,
    };
};

/**
 * Fetch featured products
 * 
 * Usage:
 * const { products, isLoading } = useFeaturedProducts();
 */
export const useFeaturedProducts = (
    limit: number = 8,
    options?: { enabled?: boolean }
) => {
    const query = useQuery({
        queryKey: ["products", "featured", limit],
        queryFn: () => fetchFeaturedProducts(limit),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15,
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: options?.enabled !== false,
    });

    return {
        ...query,
        products: query.data || [],
        isLoading: query.isPending,
        isError: query.isError,
    };
};

/**
 * Search products with debounce
 * 
 * Usage:
 * const { products, isLoading } = useSearchProducts("laptop");
 */
export const useSearchProducts = (
    query: string,
    options?: { enabled?: boolean; debounceMs?: number }
) => {
    const searchQuery = useQuery({
        queryKey: ["products", "search", query],
        queryFn: () => searchProducts(query),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 1,
        // Only search if query is long enough
        enabled: options?.enabled !== false && query.length >= 2,
    });

    return {
        ...searchQuery,
        products: searchQuery.data || [],
        isLoading: searchQuery.isPending,
        isError: searchQuery.isError,
    };
};

/**
 * Fetch products by category
 * 
 * Usage:
 * const { products, isLoading } = useProductsByCategory("electronics", {
 *   page: 1,
 *   limit: 20,
 *   sort: 'price-asc'
 * });
 */
export const useProductsByCategory = (
    categorySlug: string,
    options?: Omit<FetchProductsParams, 'category'> & { enabled?: boolean }
) => {
    const query = useQuery({
        queryKey: ["products", "category", categorySlug, options],
        queryFn: () => fetchProductsByCategory(categorySlug, options),
        staleTime: 1000 * 60 * 3,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: options?.enabled !== false && !!categorySlug,
    });

    return {
        ...query,
        products: query.data || [],
        isLoading: query.isPending,
        isError: query.isError,
        error: query.error as Error | null,
    };
};

/**
 * Pagination helper hook
 * Manages page state and triggers refetch
 * 
 * Usage:
 * const { page, limit, goToPage, nextPage, prevPage } = usePagination();
 * const { products } = useProducts({ page, limit });
 */
export const usePagination = (initialPage: number = 1, initialLimit: number = 20) => {
    const [page, setPage] = React.useState(initialPage);
    const [limit, setLimit] = React.useState(initialLimit);

    return {
        page,
        limit,
        setLimit,
        goToPage: (newPage: number) => setPage(Math.max(1, newPage)),
        nextPage: () => setPage((p) => p + 1),
        prevPage: () => setPage((p) => Math.max(1, p - 1)),
        reset: () => {
            setPage(initialPage);
            setLimit(initialLimit);
        },
    };
};

/**
 * Filters state hook
 * Manages product filters (search, sort, category)
 * 
 * Usage:
 * const filters = useProductFilters();
 * const { products } = useProducts(filters);
 */
export const useProductFilters = (initialFilters?: Partial<FetchProductsParams>) => {
    const [filters, setFilters] = React.useState<FetchProductsParams>({
        search: initialFilters?.search,
        sort: initialFilters?.sort || 'newest',
        category: initialFilters?.category,
        page: initialFilters?.page || 1,
        limit: initialFilters?.limit || 20,
    });

    return {
        filters,
        setSearch: (search: string) => setFilters((f) => ({ ...f, search, page: 1 })),
        setSort: (sort: string) =>
            setFilters((f) => ({ ...f, sort: sort as any, page: 1 })),
        setCategory: (category: string) =>
            setFilters((f) => ({ ...f, category, page: 1 })),
        setPage: (page: number) => setFilters((f) => ({ ...f, page })),
        setLimit: (limit: number) => setFilters((f) => ({ ...f, limit })),
        reset: () =>
            setFilters({
                page: 1,
                limit: 20,
                sort: 'newest',
            }),
    };
};

// Import React for hooks that need it
import React from 'react';