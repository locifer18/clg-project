import { useCart } from "@/hooks/useCart";
import { useCartActions } from "@/hooks/useCartActions";
import { Minus, Plus } from "lucide-react";

export default function CartPage() {
    const { data: cart, isLoading } = useCart();
    const { removeItem, updateItem } = useCartActions();

    if (isLoading) return (<p> loading...</p>)

    return (
        <div className="max-w-4xl mx-auto py-10">
            <h2 className="text-2xl font-bold mb-6">Your Cart</h2>

            {cart?.items?.length === 0 ? (
                <p>No items in cart</p>
            ) : (
                cart.items.map((item: any) => {
                    <div key={item.id} className="flex justify-between border-b py-4">
                        <div>
                            <p>{item.product.name}</p>
                            <p>Price: {item.product.price}</p>
                        </div>

                        <div className="flec items-center gap-2">
                            <button
                                onClick={() => updateItem.mutate({
                                    itemId: item.id,
                                    quantity: item.quantity - 1
                                })}
                                className="px-2 bg-gray-200 rounded"
                            >
                                <Minus />
                            </button>

                            <span>{item.quantity}</span>

                            <button
                                onClick={() => updateItem.mutate({
                                    itemId: item.id,
                                    quantity: item.quantity + 1
                                })}
                                className="px-2 bg-gray-200 rounded"
                            >
                                <Plus />
                            </button>
                        </div>

                        <button
                            onClick={() => removeItem.mutate(item.id)}
                            className="text-red-500">
                            Remove
                        </button>

                    </div>
                })
            )}
        </div>
    )
}