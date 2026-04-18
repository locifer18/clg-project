import { getCartApi } from "@/features/cart/cart.api"
import { useQuery } from "@tanstack/react-query"

export const useCart = () => {
    return useQuery({
        queryKey: ["cart"],
        queryFn: getCartApi,
    });
};