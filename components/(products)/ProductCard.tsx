"use client";

import { useAddToCart } from "@/hooks/useAddToCart";
import { EyeIcon, ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }: any) {

    const { mutate } = useAddToCart();

    return (
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">

            {/* IMAGE */}
            <div className="relative h-[220px] overflow-hidden">
                <Image
                    src={product?.additionalImages?.[0] || "/images/placeholder.png"}
                    alt={product.name}
                    fill
                    className="w-full h-full object-cover hover:scale-105 transition"
                />
                <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs px-3 py-1 rounded-full">
                    New
                </span>
            </div>

            {/* BODY */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-800 line-clamp-2">
                    <Link href={`/products/${product.slug}`}>
                        {product.name}
                    </Link>
                </h3>

                <p className="text-blue-600 font-semibold mt-2">
                    ₹ {product.price}
                </p>

                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                    {product.description}
                </p>

                {/* ACTIONS */}
                <div className="flex gap-2 mt-4">
                    <button onClick={() => mutate(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white px-6 py-3 rounded-xl font-medium transition">
                        <ShoppingCartIcon className="w-5 h-5 fill-current" />
                        Add to Cart
                    </button>
                    <Link
                        href={`/products/${product.slug}`}
                        className="px-3 bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                        <EyeIcon className="w-5 h-5 text-gray-800" />
                    </Link>
                </div>
            </div>
        </div>
    );
}