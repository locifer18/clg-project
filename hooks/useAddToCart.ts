import { addToCartApi } from "@/features/cart/cart.api";
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useAddToCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addToCartApi,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cart"],
            });
        },
    });
};