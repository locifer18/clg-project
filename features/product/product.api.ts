// features/product/product.api.ts
import axios from "@/lib/axios";

// ============= TYPES =============

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    rating: number;
    reviewCount: number;
    availability: string;
    quantity?: number;
    brand?: string;
    category: {
        id?: string;
        name: string;
        slug: string;
    };
    additionalImages?: string[];
}

export interface ProductDetail extends Product {
    description: string;
    productDetails?: any;
    shipping: boolean;
    reviews: Array<{
        id: string;
        rating: number;
        comment?: string;
        user?: {
            id: string;
            name: string;
        };
        createdAt: string;
    }>;
    faqs?: Array<{
        id: string;
        question: string;
        answer: string;
        order: number;
    }>;
}

export interface FetchProductsParams {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating';
    category?: string;
    search?: string;
    featured?: boolean;
}

export interface ProductsResponse {
    success: boolean;
    data: Product[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasMore: boolean;
    };
}

export interface ProductResponse {
    success: boolean;
    data: ProductDetail;
}

// ============= API CALLS =============

/**
 * Fetch products with filtering, sorting, and pagination
 */
export const fetchProducts = async (params?: FetchProductsParams): Promise<Product[]> => {
    try {
        const res = await axios.get<ProductsResponse>("/products", {
            params: {
                page: params?.page || 1,
                limit: Math.min(params?.limit || 20, 100),
                sort: params?.sort || 'newest',
                category: params?.category,
                search: params?.search,
                featured: params?.featured,
            },
        });

        if (!res.data.success) {
            throw new Error(res.data?.data || 'Failed to fetch products');
        }

        return res.data.data;

    } catch (error) {
        console.error('Fetch products error:', error);
        throw error;
    }
};

/**
 * Fetch single product by slug
 */
export const fetchProductBySlug = async (slug: string): Promise<ProductDetail> => {
    try {
        const res = await axios.get<ProductResponse>(`/products/${slug}`);

        if (!res.data.success) {
            throw new Error('Product not found');
        }

        return res.data.data;

    } catch (error) {
        console.error('Fetch product error:', error);
        throw error;
    }
};

/**
 * Search products
 */
export const searchProducts = async (query: string, limit: number = 10): Promise<Product[]> => {
    try {
        if (!query || query.length < 2) {
            return [];
        }

        const res = await axios.get<ProductsResponse>("/products", {
            params: {
                search: query,
                limit: Math.min(limit, 100),
                page: 1,
            },
        });

        if (!res.data.success) {
            throw new Error('Search failed');
        }

        return res.data.data;

    } catch (error) {
        console.error('Search products error:', error);
        throw error;
    }
};

/**
 * Get products by category
 */
export const fetchProductsByCategory = async (
    categorySlug: string,
    params?: Omit<FetchProductsParams, 'category'>
): Promise<Product[]> => {
    try {
        const res = await axios.get<ProductsResponse>("/products", {
            params: {
                page: params?.page || 1,
                limit: Math.min(params?.limit || 20, 100),
                sort: params?.sort,
                category: categorySlug,
            },
        });

        if (!res.data.success) {
            throw new Error('Failed to fetch category products');
        }

        return res.data.data;

    } catch (error) {
        console.error('Fetch category products error:', error);
        throw error;
    }
};

/**
 * Get featured products
 */
export const fetchFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
    try {
        const res = await axios.get<ProductsResponse>("/products", {
            params: {
                featured: true,
                limit: Math.min(limit, 100),
            },
        });

        if (!res.data.success) {
            throw new Error('Failed to fetch featured products');
        }

        return res.data.data;

    } catch (error) {
        console.error('Fetch featured products error:', error);
        throw error;
    }
};

/**
 * Get products by price range
 */
export const fetchProductsByPriceRange = async (
    minPrice: number,
    maxPrice: number,
    params?: Omit<FetchProductsParams, 'search'>
): Promise<Product[]> => {
    try {
        const res = await axios.get<ProductsResponse>("/products", {
            params: {
                page: params?.page || 1,
                limit: Math.min(params?.limit || 20, 100),
                sort: params?.sort,
                minPrice,
                maxPrice,
            },
        });

        if (!res.data.success) {
            throw new Error('Failed to fetch products');
        }

        return res.data.data;

    } catch (error) {
        console.error('Fetch products by price range error:', error);
        throw error;
    }
};