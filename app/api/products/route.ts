// api/products/route.ts
import { getAllProducts, getFeaturedProducts } from "@/services/ProductService";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/errors";

/**
 * GET /api/products
 * Get all products with pagination, filtering, sorting
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sort: 'newest' | 'price-asc' | 'price-desc' | 'rating'
 * - category: string (filter by category slug)
 * - search: string (search in name/description)
 * - featured: boolean (get featured products only)
 */
export async function GET(request: NextRequest) {
    try {
        // ✅ Rate limiting
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                   request.headers.get("x-real-ip") || 
                   "unknown";
        
        if (!checkRateLimit(`products:${ip}`, 100, 60 * 1000)) {
            return errorResponse("Too many requests", 429, "RATE_LIMIT");
        }

        // ✅ Get query parameters
        const searchParams = request.nextUrl.searchParams;
        
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.min(
            Math.max(1, parseInt(searchParams.get("limit") || "20")),
            100 // Max 100 per page
        );
        const sort = (searchParams.get("sort") as any) || "newest";
        const category = searchParams.get("category")?.trim();
        const search = searchParams.get("search")?.trim();
        const featured = searchParams.get("featured") === "true";

        // ✅ Validate sort param
        const validSorts = ["newest", "price-asc", "price-desc", "rating"];
        if (!validSorts.includes(sort)) {
            return errorResponse("Invalid sort parameter", 400);
        }

        // ✅ If featured, get featured products
        if (featured) {
            const products = await getFeaturedProducts(limit);
            
            const response = NextResponse.json({
                success: true,
                data: products,
                pagination: {
                    page: 1,
                    limit: products.length,
                    total: products.length,
                    pages: 1,
                },
            });

            response.headers.set("Cache-Control", "public, max-age=600");
            return response;
        }

        // ✅ Get products with filters
        const { products, total } = await getAllProducts({
            page,
            limit,
            sort: sort as any,
            category: category || undefined,
            search: search || undefined,
        });

        // ✅ Build response
        const response = NextResponse.json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        });

        // ✅ Add caching headers
        response.headers.set("Cache-Control", "public, max-age=300");

        return response;

    } catch (error) {
        console.error("GET /api/products error:", error);
        return errorResponse(
            "Failed to fetch products",
            500,
            "FETCH_PRODUCTS_ERROR"
        );
    }
}