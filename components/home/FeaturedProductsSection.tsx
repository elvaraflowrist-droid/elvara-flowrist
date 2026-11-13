"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Filter, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import ProductCard, { ProductItem } from "@/components/ProductCard";

const CATEGORIES = [
  { id: "all", label: "All Offerings" },
  { id: "bouquets", label: "Hand-Tied Bouquets" },
  { id: "collections", label: "Vessel Arrangements" },
  { id: "gifts", label: "Botanical Gifts" },
];

const POPULAR_TAGS = [
  "luxury",
  "roses",
  "peonies",
  "beautiful",
  "wedding",
  "dried",
  "sculptural",
  "orchids",
];

interface FeaturedProductsSectionProps {
  initialProducts?: ProductItem[];
}

export default function FeaturedProductsSection({ initialProducts = [] }: FeaturedProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("newest"); // Default newest so latest 4 are shown
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = initialProducts, isLoading } = useQuery<ProductItem[]>({
    queryKey: ["home-featured-products", { sort: sortOption, type: selectedCategory, tag: selectedTag }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sortOption) params.set("sort", sortOption);
      if (selectedCategory && selectedCategory !== "all") {
        params.set("type", selectedCategory);
      }
      if (selectedTag) params.set("tags", selectedTag);
      // Fetch up to 20 so client filtering has enough items to pick latest 4
      params.set("limit", "20");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      return (data.data as ProductItem[]) || [];
    },
    initialData: initialProducts.length > 0 && sortOption === "newest" && selectedCategory === "all" && !selectedTag
      ? initialProducts
      : undefined,
  });

  // Client-side search and filtering
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.assetType === selectedCategory;
    const matchesTag = !selectedTag || p.tags?.includes(selectedTag);
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTag && matchesSearch;
  });

  // Always show the latest 4 products matching the filter
  const latestFourProducts = filteredProducts.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar matching /collections */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "bg-white border border-stone-200 text-neutral-700 hover:border-neutral-400 hover:text-neutral-950"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Right: Search & Sort controls */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 size-3.5" />
              <input
                type="text"
                placeholder="Search blooms or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-stone-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none shadow-2xs"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none rounded-full border border-stone-200 bg-white pl-3.5 pr-8 py-2 text-xs font-medium text-neutral-800 focus:border-neutral-900 focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="newest">Latest 4 Arrivals</option>
                <option value="views">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <SlidersHorizontal className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-stone-400" />
            </div>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-stone-400 flex items-center gap-1 font-medium mr-1 text-[11px]">
            <Filter size={11} /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              selectedTag === null
                ? "bg-neutral-900 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-950"
            }`}
          >
            All tags
          </button>
          {POPULAR_TAGS.map((tag) => {
            const isTagActive = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(isTagActive ? null : tag)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                  isTagActive
                    ? "bg-neutral-900 text-white"
                    : "bg-white border border-stone-200 text-stone-600 hover:text-stone-950"
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Latest 4 Offerings */}
      {isLoading && latestFourProducts.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-6 animate-spin text-stone-400" />
          <p className="text-xs font-serif">Curating floral offerings...</p>
        </div>
      ) : latestFourProducts.length === 0 ? (
        <div className="rounded-3xl bg-white border border-stone-200/80 p-12 text-center max-w-md mx-auto">
          <p className="font-serif text-lg text-neutral-800">No offerings match your filters</p>
          <p className="text-xs text-stone-500 mt-1">Try clearing your search query or selecting &quot;All tags&quot;.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedTag(null);
              setSearchQuery("");
            }}
            className="mt-4 rounded-full bg-neutral-900 text-white px-4 py-2 text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestFourProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx === 0} />
          ))}
        </div>
      )}
    </div>
  );
}

