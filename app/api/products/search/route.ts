import { errorResponse } from "@/lib/errors";
import { searchProducts } from "@/services/ProductService";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/products/search
 * Search products
 */
export async function GET_SEARCH(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q")?.trim();

        if (!query || query.length < 2) {
            return errorResponse("Search query too short", 400);
        }

        const products = await searchProducts(query, 20);

        const response = NextResponse.json({
            success: true,
            data: products,
        });

        response.headers.set("Cache-Control", "public, max-age=300");
        return response;

    } catch (error) {
        console.error("Search products error:", error);
        return errorResponse("Search failed", 500);
    }
}