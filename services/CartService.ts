// removeFromCart()
// updateCartItem()
// clearCart()
// calculateTotal()

import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db"

export const getCart = async () => {
    const user = await getAuthUser();

    return await prisma.cart.findUnique({
        where: { userId: user.id },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
};

export const addToCart = async (data: any) => {
    const user = await getAuthUser();

    const { productId } = data;

    let cart = await prisma.cart.findUnique({
        where: { userId: user.id },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId: user.id },
        });
    }

    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId,
        },
    });

    if (existingItem) {
        return await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
                quantity: existingItem.quantity + 1,
            },
        });
    }

    return await prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId,
            quantity: 1,
        },
    });
}

export const removeCartItem = async (itemId: string) => {
    return await prisma.cartItem.delete({
        where: { id: itemId },
    });
}

export const updateCartItem = async (itemId: string, quantity: number) => {
    return await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
    });
}