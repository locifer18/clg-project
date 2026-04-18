import { updateCartItem } from "@/services/CartService";

export async function POST(req: Request) {
    try{
        const { itemId, quantity } = await req.json();

        const updated = await updateCartItem(itemId, quantity);
        return Response.json(updated);
    } catch (error) {
        console.log(error);
        return new Response("Internal Server Error", { status: 500 })
    }
}