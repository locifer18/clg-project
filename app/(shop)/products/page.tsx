"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/(products)/ProductCard";
import ProductFilters from "@/components/(products)/ProductFilters";

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();

  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  if (isLoading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  let filteredProducts = products || [];

  filteredProducts = filteredProducts.filter(
    (p: any) => p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  if (sortBy === "price-low-high") {
    filteredProducts.sort((a: any, b: any) => a.price - b.price);
  } else if (sortBy === "price-high-low") {
    filteredProducts.sort((a: any, b: any) => b.price - a.price);
  }

  return (
    <section className="bg-gray-50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-6">

          <div className="md:col-span-1">
            <ProductFilters
              sortBy={sortBy}
              setSortBy={setSortBy}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </div>

          <div className="md:col-span-3">

            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Featured Products
              </h2>
              <p className="text-gray-500">
                {filteredProducts.length} products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <h3>No products found</h3>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}