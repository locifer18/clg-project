import { getProductBySlug } from "@/services/ProductService";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const product = await getProductBySlug(slug);;
        if (!product) {
            return new Response("product not found", { status: 404 });
        }

        return Response.json(product);
    } catch (error) {
        console.log(error);
        return new Response("Internal Server Error", { status: 500 })
    }
}