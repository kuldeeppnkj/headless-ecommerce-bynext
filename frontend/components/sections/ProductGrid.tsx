"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ProductGridSection, CustomProductItem } from "@/types/acf";
import { useCart } from "@/context/CartContext";

const DEFAULT_PRODUCTS: CustomProductItem[] = [
  {
    badge: "Icon 01",
    material: "Virgin Wool Blend",
    product_name: "L’Atelier Structured Blazer",
    price: "$580",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSwuVqXpHCAmUejTFr01jAF-Q1UuhX0Ao2048iv4_QQka3u9lsyyjKfVhm7efj7s-A3e7rKrDXAUUECf-B-2mKeMWZ8StFtubprVO3sj_JPkWuHcEdRSlaB26jQe8LSZpHXKxeFrxnhVTsf91jmo4z4QsYHkRunzZwxPFNni522FIL3VDLK9ZXAZkeigDNcIjk1UgWL0XsIq0GLH8uZpUW3_qTG1ucj1WgZ8J6XTYAEG8AYIX7Npff",
    image_alt:
      "Editorial product shot of an oversized tailored double-breasted blazer in sand-toned wool melton against an off-white textured backdrop. Minimalist studio lighting, sculptural shoulders.",
    url: "/shop",
    product_id: 45,
  },
  {
    badge: "Icon 02",
    material: "Mulberry Silk",
    product_name: "Silk Georgette Slip Dress",
    price: "$340",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAGkwP86LWIX1vuNKoC2hvCoMySGAHk8hxQkU-wxvdsiwaE7Eg825PwtxcbbvVZ_wEnWerTsDeBRCqQmspQKbwK5zSAZn-Mc6l2-7ljsgvhN7kj0Edqjqz9Q4dlvMT_W6TmSQ1Cdmga8_Oo4oUxPmXSXj0tJepkBZrwQCNZunKcuTrSK1yPFYMJXVl5Pw-op8hhEimJS1EGLQBDwQb0OeMGoOTPkUhJgW8lpOBP81unLCg7Mr_mao_5",
    image_alt:
      "Still life photograph of a delicate bias-cut silk slip dress in dusty blush rose, suspended gracefully against a warm neutral wall. Luxurious soft fabric folds, tactile luster.",
    url: "/shop",
    product_id: 44,
  },
  {
    badge: "Icon 03",
    material: "Mongolian Cashmere",
    product_name: "Double-Faced Cashmere Robe",
    price: "$720",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAYR3GIpjKUpRUc_cPKxZhAvGzqjQSKfYQTHX_MmewhC_bZ--ypldnXm8RzcFc8fmx4BUpynLIsD7Gw_56vQvN7kH7Jh1-37l_K2BHXA43w1W53f0ErLbEBU_JL261J967avY_qUg2amnPBrYzv8c7Uy3juB-n4fm7ay0WuQKC1h0nnX33xb8DEosArFxDT7yI2PIAfHEaggGcyBMC-RcZ7oraKVGowpVL4y_6B0-S_bbs_gpYRIpvf",
    image_alt:
      "Editorial product visual of a full-length cashmere wrap coat in warm charcoal taupe. Belt cinched casually, opulent tactile cashmere weave caught in soft side studio lighting.",
    url: "/shop",
    product_id: 0,
  },
  {
    badge: "Icon 04",
    material: "Full Grain Calfskin",
    product_name: "Sculptural Calfskin Tote",
    price: "$490",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9hs16bm6UAfYg7YFqIxS9PX_keXee2nyMt96r_BpOU59-eTJiZGpbumv3D6x-hkvsMJ3xs1Tt32cAkme7V7fCHBs3pogzbSbbQEBOvIJq55OzfI0OsDM-yNyKfy5PhNxtPhS3SsJrtcEFrymU15Jfwo_8dNc1Cnc3hcTimz-u4hIsANkD0qI81qRV7lya9cqCY25PzJGSI64ZbMFs-dqYlY9Yrs02JlS1LwXmgLqy3BNkoFhgHR33",
    image_alt:
      "Studio photograph of structured leather equestrian-inspired minimalist tote bag in natural tanned calfskin. Smooth matte finish, clean architectural brass hardware accents.",
    url: "/shop",
    product_id: 35,
  },
];

function resolveImg(img?: string | { url: string; alt?: string; id?: number }): string {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img.url || "";
}

export default function ProductGrid({
  eyebrow = "Signature Silhouettes",
  title = "The Icons",
  subtitle = "Permanent wardrobe staples",
  view_all_label = "View All (18)",
  view_all_url = "/shop",
  products,
  custom_products,
  items,
  limit = 4,
}: ProductGridSection) {
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<Record<string | number, boolean>>({});

  const rawProducts =
    products && products.length > 0
      ? products
      : custom_products && custom_products.length > 0
      ? custom_products
      : items && items.length > 0
      ? items
      : DEFAULT_PRODUCTS;

  const numLimit = typeof limit === "string" ? parseInt(limit, 10) || 4 : limit;
  const displayProducts = rawProducts.slice(0, numLimit);

  const handleAddToCart = async (product: CustomProductItem, index: number) => {
    const key = product.product_id ? String(product.product_id) : `idx-${index}`;

    // Set immediate visual feedback on button
    setAddedItems((prev) => ({ ...prev, [key]: true }));

    // If WooCommerce product ID exists and is valid, trigger instant cart addition
    const pid =
      typeof product.product_id === "string"
        ? parseInt(product.product_id, 10)
        : product.product_id;

    if (pid && pid > 0) {
      try {
        const imageUrl =
          typeof product.image === "string"
            ? product.image
            : product.image?.url || "";

        await addToCart(pid, 1, undefined, {
          name: product.product_name,
          price: product.price,
          image: imageUrl,
        });
      } catch (err) {
        console.error("Failed to add product to cart:", err);
      }
    }

    // Revert state after 2 seconds matching the design spec
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  return (
    <section className="w-full py-14 md:py-20 bg-[#f5f4ef]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-[4.5rem]">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-3">
          <div>
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#655d57] block mb-1.5 font-medium">
              {eyebrow}
            </span>
            <h2 className="font-serif text-[2.25rem] md:text-[3.25rem] text-[#1b1c19] tracking-tight leading-[1.15] font-normal">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <span className="font-sans text-[15px] text-[#655d57]">
              {subtitle}
            </span>
            <Link
              href={view_all_url || "/shop"}
              className="font-sans text-sm uppercase tracking-wider text-[#7c5549] hover:underline underline-offset-8 transition-colors"
            >
              {view_all_label}
            </Link>
          </div>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, idx) => {
            const productName =
              product.product_name || product.title || product.name || "Signature Item";
            const productPrice = product.price || "";
            const productMaterial = product.material || "";
            const productBadge = product.badge || `Icon 0${idx + 1}`;
            const productImage = resolveImg(product.image);
            const productAlt = product.image_alt || productName;
            const productUrl = product.url || "/shop";
            const itemKey = product.product_id ? String(product.product_id) : `idx-${idx}`;
            const isAdded = !!addedItems[itemKey];

            return (
              <div
                key={itemKey}
                className="flex flex-col bg-white p-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md group"
              >
                {/* Visual Container */}
                <div className="relative w-full aspect-[4/5] bg-[#efeee9] rounded overflow-hidden flex items-center justify-center">
                  {productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={productImage}
                      alt={productAlt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#655d57]">
                      No Image
                    </div>
                  )}

                  {/* Icon Badge */}
                  <span className="absolute top-1.5 left-1.5 px-2 py-1 rounded bg-[#faf9f4] text-[#1b1c19] font-sans text-[11px] uppercase tracking-widest shadow-sm font-semibold">
                    {productBadge}
                  </span>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product, idx)}
                    className={`absolute bottom-3 left-3 right-3 py-2.5 rounded-lg font-sans text-xs uppercase tracking-wider shadow-sm transition-all font-medium text-center ${
                      isAdded
                        ? "bg-[#655d57] text-[#faf9f4] opacity-100"
                        : "bg-[#e0afa0] text-[#654136] opacity-90 group-hover:opacity-100 hover:bg-[#edbbac]"
                    }`}
                  >
                    {isAdded ? "Added to Bag" : "Add to Cart"}
                  </button>
                </div>

                {/* Details */}
                <div className="mt-3 flex flex-col gap-1">
                  {productMaterial && (
                    <span className="font-sans text-[11px] uppercase tracking-wider text-[#655d57]">
                      {productMaterial}
                    </span>
                  )}
                  <Link href={productUrl}>
                    <h4 className="font-sans text-[15px] font-semibold text-[#1b1c19] truncate hover:text-[#7c5549] transition-colors">
                      {productName}
                    </h4>
                  </Link>
                  {productPrice && (
                    <span className="font-sans text-[15px] text-[#655d57]">
                      {productPrice}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
