import { fetchProducts } from "@/features/product/product.api"
import { useQuery } from "@tanstack/react-query";

export const useProducts = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
    });
}