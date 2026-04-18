import { getAllProducts } from "@/services/ProductService";

export async function GET() {
    try {
        const products = await getAllProducts();
        return Response.json(products);
    } catch (error) {
        console.log(error);
        return new Response("Internal Server Error", { status: 500 })
    }
}