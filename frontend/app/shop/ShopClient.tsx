"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { StoreApiProduct } from "@/types/commerce";
import { formatPrice } from "@/types/commerce";
import { useCart } from "@/context/CartContext";

interface ShopClientProps {
  initialProducts: StoreApiProduct[];
}

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [addedId, setAddedId] = useState<number | null>(null);

  const { addToCart } = useCart();

  // Extract unique categories from products
  const categories = useMemo(() => {
    const catMap = new Map<string, string>();
    initialProducts.forEach((p) => {
      p.categories?.forEach((c) => {
        catMap.set(c.slug, c.name);
      });
    });
    return Array.from(catMap.entries()).map(([slug, name]) => ({ slug, name }));
  }, [initialProducts]);

  // Client-side filtering and sorting
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((p) =>
        p.categories?.some((c) => c.slug === selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.short_description?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-asc":
        result.sort(
          (a, b) =>
            parseInt(a.prices?.price || "0", 10) -
            parseInt(b.prices?.price || "0", 10)
        );
        break;
      case "price-desc":
        result.sort(
          (a, b) =>
            parseInt(b.prices?.price || "0", 10) -
            parseInt(a.prices?.price || "0", 10)
        );
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        // Default order
        break;
    }

    return result;
  }, [initialProducts, selectedCategory, searchQuery, sortBy]);

  const handleQuickAdd = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await addToCart(productId, 1);
    if (success) {
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 2000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#faf9f4]">
      
      {/* 1. Slim Editorial Header (matching docs/shop.html) */}
      <section className="w-full bg-[#f5f4ef] py-12 md:py-16 px-6 md:px-12 lg:px-20 border-b border-[#d5c3be]/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-accent inline-block" />
              <span className="text-xs uppercase tracking-widest text-[#514440] font-medium">
                Permanent &amp; Seasonal Monographs
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-[#1b1c19] tracking-tight">
              Shop – Modern
            </h1>
          </div>
          <div className="md:max-w-md">
            <p className="text-sm md:text-base text-[#655d57] leading-relaxed">
              Permanent Wardrobe &amp; Seasonal Monograph Editions. Engineered through sculptural volume, intentional drape, and tactile purity.
            </p>
          </div>
        </div>

        {/* Soft Decorative Ambient Background */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      </section>

      {/* 2. Filter & Utility Control Bar (Sticky) */}
      <section className="w-full bg-[#faf9f4] sticky top-20 z-30 border-b border-[#d5c3be]/40 backdrop-blur-md bg-opacity-95 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-accent text-[#654136] shadow-sm"
                  : "bg-[#efeee9] text-[#1b1c19] hover:bg-[#e9ddd6]"
              }`}
            >
              All Pieces
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? "bg-accent text-[#654136] shadow-sm"
                    : "bg-[#efeee9] text-[#1b1c19] hover:bg-[#e9ddd6]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <svg
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#837470]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collection..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-[#f5f4ef] text-xs md:text-sm text-[#1b1c19] placeholder:text-[#837470] border border-[#d5c3be]/40 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#837470] hover:text-[#1b1c19]"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[170px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort collection"
                className="w-full h-10 pl-4 pr-8 rounded-full bg-[#f5f4ef] text-xs uppercase tracking-wider font-medium text-[#1b1c19] border border-[#d5c3be]/40 appearance-none focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary cursor-pointer transition-all duration-200"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <svg
                className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#837470] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Catalog Grid */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20 py-10 md:py-14">
        
        {/* Results Counter */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#d5c3be]/40">
          <p className="text-xs uppercase tracking-widest text-[#655d57] font-medium">
            Showing {filteredProducts.length} curated {filteredProducts.length === 1 ? "piece" : "pieces"}
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs text-primary underline hover:text-[#1b1c19]"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <h3 className="font-serif text-2xl text-[#1b1c19] mb-3">No Pieces Found</h3>
            <p className="text-sm text-[#655d57] mb-6">
              We couldn&apos;t find any pieces matching your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-6 py-2.5 rounded-lg bg-accent text-[#654136] text-xs uppercase tracking-wider font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => {
              const primaryImage =
                product.images?.[0]?.src ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBSwuVqXpHCAmUejTFr01jAF-Q1UuhX0Ao2048iv4_QQka3u9lsyyjKfVhm7efj7s-A3e7rKrDXAUUECf-B-2mKeMWZ8StFtubprVO3sj_JPkWuHcEdRSlaB26jQe8LSZpHXKxeFrxnhVTsf91jmo4z4QsYHkRunzZwxPFNni522FIL3VDLK9ZXAZkeigDNcIjk1UgWL0XsIq0GLH8uZpUW3_qTG1ucj1WgZ8J6XTYAEG8AYIX7Npff";

              const categoryLabel =
                product.categories?.[0]?.name || "Permanent Collection";

              const priceFormatted = formatPrice(
                product.prices?.price,
                product.prices?.currency_symbol || "$",
                product.prices?.currency_minor_unit || 2
              );

              const isAdded = addedId === product.id;

              return (
                <article
                  key={product.id}
                  className="flex flex-col bg-white p-3.5 rounded-xl shadow-sm border border-[#d5c3be]/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative w-full aspect-[4/5] bg-[#efeee9] rounded-lg overflow-hidden flex items-center justify-center block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Stock / Sale Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#faf9f4]/95 backdrop-blur-sm text-[#1b1c19] text-[10px] uppercase tracking-widest font-semibold shadow-sm">
                      {product.on_sale ? "Special Edition" : "Atelier Run"}
                    </span>

                    {/* Quick Add Overlay Button */}
                    <button
                      onClick={(e) => handleQuickAdd(e, product.id)}
                      className={`absolute bottom-3 left-3 right-3 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        isAdded
                          ? "bg-[#463F3A] text-white opacity-100"
                          : "bg-accent text-[#654136] opacity-0 group-hover:opacity-100 hover:bg-[#edbbac]"
                      }`}
                    >
                      {isAdded ? "Added to Bag ✓" : "Add to Bag"}
                    </button>
                  </Link>

                  <div className="mt-3.5 flex flex-col gap-1 px-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#655d57]">
                      {categoryLabel}
                    </span>
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm font-semibold text-[#1b1c19] truncate group-hover:text-primary transition-colors"
                    >
                      {product.name}
                    </Link>
                    <span className="text-sm font-medium text-[#1b1c19] mt-0.5">
                      {priceFormatted}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
}

