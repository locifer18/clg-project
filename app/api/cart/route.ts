import { addToCart, getCart } from "@/services/CartService";

export async function GET() {
    try {
        const cart = await getCart();
        return Response.json(cart);
    } catch (error) {
        console.log(error);
        return new Response("Internal Server Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try{
        const body = await req.json();
        const cart = await addToCart(body);
        return Response.json(cart);
    } catch (error) {
        console.log(error);
        return new Response("Internal Server Error", { status: 500 })
    }
}