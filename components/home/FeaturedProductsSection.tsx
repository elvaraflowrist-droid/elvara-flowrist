"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Filter, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import ProductCard, { ProductItem } from "@/components/ProductCard";
import { getDynamicCategories, getDynamicTags } from "@/lib/catalog";

interface FeaturedProductsSectionProps {
  initialProducts?: ProductItem[];
}

export default function FeaturedProductsSection({ initialProducts = [] }: FeaturedProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("newest"); // Default newest so latest 4 are shown
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allProducts = initialProducts, isLoading } = useQuery<ProductItem[]>({
    queryKey: ["home-featured-products", { sort: sortOption }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sortOption) params.set("sort", sortOption);
      // Fetch up to 100 so client filtering has all created offerings
      params.set("limit", "100");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      return (data.data as ProductItem[]) || [];
    },
    initialData:
      initialProducts.length > 0 && sortOption === "newest"
        ? initialProducts
        : undefined,
  });

  // Dynamic categories derived from the offerings created
  const categories = useMemo(() => getDynamicCategories(allProducts), [allProducts]);

  // Dynamic tags derived from the offerings created (relevant to selected category)
  const dynamicTags = useMemo(
    () => getDynamicTags(allProducts, selectedCategory),
    [allProducts, selectedCategory]
  );

  // If the active category is no longer present in existing offerings, reset to 'all'
  useEffect(() => {
    if (selectedCategory !== "all" && !categories.some((c) => c.id === selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [categories, selectedCategory]);

  // If the active tag is no longer present in available tags, reset to null
  useEffect(() => {
    if (selectedTag && !dynamicTags.some((t) => t.tag === selectedTag)) {
      setSelectedTag(null);
    }
  }, [dynamicTags, selectedTag]);

  // Client-side search and filtering
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" ||
        p.assetType?.toLowerCase().trim() === selectedCategory.toLowerCase().trim();
      const matchesTag =
        !selectedTag ||
        (Array.isArray(p.tags) &&
          p.tags.some(
            (t) => t?.toLowerCase().trim().replace(/^#+/, "") === selectedTag
          ));
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [allProducts, selectedCategory, selectedTag, searchQuery]);

  // Always show the latest 4 products matching the filter
  const latestFourProducts = filteredProducts.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar matching /collections */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
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

        {/* Dynamic Tag Filters based on created offerings */}
        {dynamicTags.length > 0 && (
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
            {dynamicTags.map(({ tag }) => {
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
        )}
      </div>

      {/* Grid of Latest 4 Offerings */}
      {isLoading && latestFourProducts.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-6 animate-spin text-stone-400" />
          <p className="text-xs">Curating atelier arrangements...</p>
        </div>
      ) : latestFourProducts.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 rounded-3xl border border-dashed border-stone-200 bg-white/50 p-8">
          <p className="font-serif text-lg text-neutral-900">No offerings match your filter</p>
          <p className="text-xs text-stone-500 mt-1">Try clearing your search query or selecting &quot;All tags&quot;.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedTag(null);
              setSearchQuery("");
            }}
            className="mt-4 inline-flex items-center rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestFourProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* View Full Atelier Collection Link */}
      <div className="pt-4 text-center">
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-xs font-medium text-neutral-900 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all shadow-2xs group"
        >
          <span>Explore All Atelier Creations</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
