import axios from "@/lib/axios";

export const fetchProducts = async () => {
    const res = await axios.get("/products");
    return res.data;
}

export const fetchProductBySlug = async (slug: string) => {
    const res = await axios.get(`/products/${slug}`);
    return res.data;
};