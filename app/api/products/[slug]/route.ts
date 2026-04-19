import { errorResponse } from "@/lib/errors";
import { getProductBySlug } from "@/services/ProductService";
import { NextResponse } from "next/server";

/**
 * GET /api/products/:slug
 * Get single product by slug
 */
export async function GET_PRODUCT_BY_SLUG(slug: string) {
    try {
        const product = await getProductBySlug(slug);

        if (!product) {
            return errorResponse("Product not found", 404, "PRODUCT_NOT_FOUND");
        }

        const response = NextResponse.json({
            success: true,
            data: product,
        });

        // Cache single product for longer
        response.headers.set("Cache-Control", "public, max-age=600");

        return response;

    } catch (error) {
        console.error("GET /api/products/:slug error:", error);
        return errorResponse(
            "Failed to fetch product",
            500,
            "FETCH_PRODUCT_ERROR"
        );
    }
}