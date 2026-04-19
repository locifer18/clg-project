// services/ProductService.ts
import { prisma } from "@/lib/db";

export interface GetProductsOptions {
    page: number;
    limit: number;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating';
    category?: string;
    search?: string;
    availability?: string;
}

/**
 * Get all products with pagination, filtering, and sorting
 */
export const getAllProducts = async (options: GetProductsOptions) => {
    try {
        const {
            page = 1,
            limit = 20,
            sort = 'newest',
            category,
            search,
            availability = 'IN_STOCK',
        } = options;

        // ✅ Build where clause for filtering
        const where: any = {
            availability: { not: 'OUT_OF_STOCK' },
        };

        // Filter by category
        if (category) {
            where.category = {
                slug: category,
            };
        }

        // Search in name and description
        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    brand: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        // ✅ Build orderBy for sorting
        let orderBy: any = { createdAt: 'desc' }; // Default: newest first

        if (sort === 'price-asc') {
            orderBy = { price: 'asc' };
        } else if (sort === 'price-desc') {
            orderBy = { price: 'desc' };
        } else if (sort === 'rating') {
            // Sort by number of reviews (proxy for popularity)
            orderBy = { reviews: { _count: 'desc' } };
        }

        // ✅ Get total count
        const total = await prisma.product.count({ where });

        // ✅ Get paginated products
        const products = await prisma.product.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                image: true,
                additionalImages: true,
                availability: true,
                quantity: true,
                brand: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                reviews: {
                    select: {
                        rating: true,
                    },
                },
                _count: {
                    select: {
                        reviews: true,
                    },
                },
            },
        });

        // ✅ Transform: Calculate average rating
        const transformedProducts = products.map((product) => {
            const ratings = product.reviews.map((r) => r.rating);
            const averageRating =
                ratings.length > 0
                    ? parseFloat(
                        (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                    )
                    : 0;

            // Remove reviews array, replace with calculated values
            const { reviews, _count, ...rest } = product;

            return {
                ...rest,
                rating: averageRating,
                reviewCount: _count.reviews,
            };
        });

        return {
            products: transformedProducts,
            total,
        };

    } catch (error) {
        console.error('GetAllProducts error:', error);
        throw new Error('Failed to fetch products');
    }
};

/**
 * Get single product by slug with full details
 */
export const getProductBySlug = async (slug: string) => {
    try {
        const product = await prisma.product.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                price: true,
                image: true,
                additionalImages: true,
                availability: true,
                quantity: true,
                brand: true,
                shipping: true,
                productDetails: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                faqs: {
                    select: {
                        id: true,
                        question: true,
                        answer: true,
                        order: true,
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!product) {
            return null;
        }

        // ✅ Calculate rating
        const ratings = product.reviews.map((r) => r.rating);
        const averageRating =
            ratings.length > 0
                ? parseFloat(
                    (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                )
                : 0;

        return {
            ...product,
            rating: averageRating,
            reviewCount: ratings.length,
        };

    } catch (error) {
        console.error('GetProductBySlug error:', error);
        throw new Error('Failed to fetch product');
    }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (
    categorySlug: string,
    options: Omit<GetProductsOptions, 'category'>
) => {
    return getAllProducts({
        ...options,
        category: categorySlug,
    });
};

/**
 * Get featured/bestseller products
 */
export const getFeaturedProducts = async (limit: number = 8) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                availability: { not: 'OUT_OF_STOCK' },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                image: true,
                availability: true,
                brand: true,
                category: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
                reviews: {
                    select: {
                        rating: true,
                    },
                },
                _count: {
                    select: {
                        reviews: true,
                    },
                },
            },
        });

        // ✅ Calculate ratings
        return products.map((product) => {
            const ratings = product.reviews.map((r) => r.rating);
            const averageRating =
                ratings.length > 0
                    ? parseFloat(
                        (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                    )
                    : 0;

            const { reviews, _count, ...rest } = product;

            return {
                ...rest,
                rating: averageRating,
                reviewCount: _count.reviews,
            };
        });

    } catch (error) {
        console.error('GetFeaturedProducts error:', error);
        throw new Error('Failed to fetch featured products');
    }
};

/**
 * Search products
 */
export const searchProducts = async (query: string, limit: number = 20) => {
    try {
        if (!query || query.length < 2) {
            return [];
        }

        const products = await prisma.product.findMany({
            where: {
                AND: [
                    { availability: { not: 'OUT_OF_STOCK' } },
                    {
                        OR: [
                            {
                                name: {
                                    contains: query,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                description: {
                                    contains: query,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                brand: {
                                    contains: query,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    },
                ],
            },
            take: limit,
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                image: true,
                availability: true,
                category: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
                reviews: {
                    select: {
                        rating: true,
                    },
                },
                _count: {
                    select: {
                        reviews: true,
                    },
                },
            },
        });

        // ✅ Calculate ratings
        return products.map((product) => {
            const ratings = product.reviews.map((r) => r.rating);
            const averageRating =
                ratings.length > 0
                    ? parseFloat(
                        (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                    )
                    : 0;

            const { reviews, _count, ...rest } = product;

            return {
                ...rest,
                rating: averageRating,
                reviewCount: _count.reviews,
            };
        });

    } catch (error) {
        console.error('SearchProducts error:', error);
        throw new Error('Failed to search products');
    }
};

/**
 * Get product count (for admin dashboard)
 */
export const getProductCount = async () => {
    try {
        return await prisma.product.count();
    } catch (error) {
        console.error('GetProductCount error:', error);
        throw new Error('Failed to get product count');
    }
};

/**
 * Get products by price range
 */
export const getProductsByPriceRange = async (
    minPrice: number,
    maxPrice: number,
    options: Omit<GetProductsOptions, 'search'>
) => {
    try {
        const { page = 1, limit = 20, category } = options;

        const where: any = {
            price: {
                gte: minPrice,
                lte: maxPrice,
            },
            availability: { not: 'OUT_OF_STOCK' },
        };

        if (category) {
            where.category = { slug: category };
        }

        const total = await prisma.product.count({ where });

        const products = await prisma.product.findMany({
            where,
            orderBy: { price: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                image: true,
                category: { select: { name: true, slug: true } },
                reviews: { select: { rating: true } },
                _count: { select: { reviews: true } },
            },
        });

        const transformed = products.map((product) => {
            const ratings = product.reviews.map((r) => r.rating);
            const rating =
                ratings.length > 0
                    ? parseFloat(
                        (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                    )
                    : 0;

            const { reviews, _count, ...rest } = product;
            return { ...rest, rating, reviewCount: _count.reviews };
        });

        return { products: transformed, total };

    } catch (error) {
        console.error('GetProductsByPriceRange error:', error);
        throw new Error('Failed to fetch products by price range');
    }
};