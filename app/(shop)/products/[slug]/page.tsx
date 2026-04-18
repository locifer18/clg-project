"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useProduct } from "@/hooks/useProduct";
import Image from "next/image";
import { ShoppingCartIcon } from "lucide-react";

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: product, isLoading, error } = useProduct(slug);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg">Product not found</p>
        <Link href="/" className="text-blue-500 mt-4 inline-block">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-sm text-gray-500 mb-6 flex gap-2">
          <Link href="/" className="text-blue-500">Home</Link>
          <span>/</span>
          {product.category && (
            <>
              <span className="text-blue-500">{product.category.name}</span>
              <span>/</span>
            </>
          )}
          <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* LEFT - IMAGE */}
          <div className="bg-gray-100 max-w-xl max-h-100 rounded-2xl p-6 flex items-center justify-center shadow-lg">
            <div className="relative w-full max-w-md aspect-square rounded-xl">
              <Image
                src={product?.additionalImages?.[0] || "/images/placeholder.png"}
                alt={product?.name || "Product"}
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* RIGHT - DETAILS */}
          <div>

            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
              {product.name}
            </h1>

            <p className="text-2xl font-bold text-blue-600 mb-4">
              ₹ {product.price}
            </p>

            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* INFO */}
            <div className="space-y-2 mb-6 text-gray-700">
              <p>
                <span className="font-semibold">Category:</span>{" "}
                {product.category?.name}
              </p>

              <p>
                <span className="font-semibold">Availability:</span>{" "}
                <span className="text-green-600 font-medium">
                  {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 flex-wrap">

              {/* ADD TO CART */}
              <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white px-6 py-3 rounded-xl font-medium transition">
                <ShoppingCartIcon className="w-5 h-5 fill-current" />
                Add to Cart
              </button>

              {/* VIEW CART */}
              <Link
                href="/cart"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition"
              >
                View Cart
              </Link>

            </div>

          </div>
        </div>

        <div className="mt-12 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Product Description
          </h2>
          <p className="text-gray-600">
            {product.description}
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Reviews</h2>

          {product.reviews?.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((r: any) => (
                <div key={r.id} className="bg-white p-4 rounded shadow">
                  <p className="font-semibold">⭐ {r.rating}</p>
                  <p className="text-gray-600">{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet</p>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">FAQs</h2>

          {product.faqs?.length > 0 ? (
            <div className="space-y-4">
              {product.faqs.map((f: any) => (
                <div key={f.id} className="bg-white p-4 rounded shadow">
                  <p className="font-semibold text-gray-800">{f.question}</p>
                  <p className="text-gray-600">{f.answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No FAQs available</p>
          )}
        </div>
      </div>
    </div>
  );
}