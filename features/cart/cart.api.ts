import axios from "@/lib/axios"

export const addToCartApi = async (productId: string) => {
    const res = await axios.post("/carts", { productId });
    return res.data;
}

export const getCartApi = async () => {
    const res = await axios.get("/cart");
    return res.data;
}

export const removeCartItemApi = async (id: string ) => {
    const res = await axios.delete(`/cart/${id}`);
    return res.data;
}

export const updateCartItemApi = async (data: {
    itemId: string;
    quantity: number;
}) => {
    const res = await axios.post("/cart/update", data);
    return res.data;
}