"use client";

export default function ProductFilters({
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
}: any) {
  return (
    <div className="bg-white rounded-xl p-5 shadow sticky top-5 text-gray-900">

      <h3 className="text-lg font-semibold mb-4 border-b pb-2">
        Filters
      </h3>

      {/* SORT */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Sort By</h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="newest">Newest</option>
          <option value="price-low-high">Price: Low → High</option>
          <option value="price-high-low">Price: High → Low</option>
        </select>
      </div>

      {/* PRICE RANGE */}
      <div>
        <h4 className="font-medium mb-2">Price Range</h4>

        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) =>
              setPriceRange([+e.target.value, priceRange[1]])
            }
            className="border p-2 rounded w-full"
            placeholder="Min"
          />
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], +e.target.value])
            }
            className="border p-2 rounded w-full"
            placeholder="Max"
          />
        </div>

        <input
          type="range"
          min="0"
          max="100000"
          value={priceRange[1]}
          onChange={(e) =>
            setPriceRange([priceRange[0], +e.target.value])
          }
          className="w-full"
        />
      </div>

      {/* RESET */}
      <button
        onClick={() => setPriceRange([0, 100000])}
        className="mt-5 w-full bg-gray-100 py-2 rounded hover:bg-gray-200"
      >
        Reset Filters
      </button>
    </div>
  );
}