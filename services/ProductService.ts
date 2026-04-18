// getProducts()
// getProductById()
// searchProducts()
// createProduct()
// updateProduct()
// deleteProduct()
// cacheProducts()

import { prisma } from "@/lib/db"

export const getAllProducts = async () => {
    return await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            image: true,
            additionalImages: true,
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
        },
    });
};

export const getProductBySlug = async (slug: string) => {
    if (!slug) return null;
    return await prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
            reviews: true,
            faqs: true
        },
    })
}