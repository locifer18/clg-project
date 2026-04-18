import { removeCartItemApi } from "@/features/cart/cart.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useCartActions = () => {
    const queryClient = useQueryClient();

    const removeItem = useMutation({
        mutationFn: removeCartItemApi,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cart"],
            });
            toast.success("Item removed from cart");
        },
    });

    const updateItem = useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cart"],
            });
            toast.success("Cart updated");
        },
    });
    
    return { removeItem, updateItem };
};