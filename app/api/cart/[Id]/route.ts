import { removeCartItem } from "@/services/CartService";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> } 
) {
    try{
        await removeCartItem(params.id);
        return Response.json({ success: true });
    } catch (error) {
        console.log(error);
        return new Response("Internal Server Error", { status: 500 })
    }
}