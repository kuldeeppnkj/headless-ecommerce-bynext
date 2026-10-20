"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { StoreApiProduct } from "@/types/commerce";
import { formatPrice } from "@/types/commerce";
import { useCart } from "@/context/CartContext";

interface ProductDetailClientProps {
  product: StoreApiProduct;
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0]?.src ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCw1ILVYS-T3BQnE81f55JUV0dYc-Iy9C-pScFDVpjl4nMwKh2QunRsgIUIgPcYu2DdB6hvLGdPLJ2k-ZFJGTmMDnGMwNXwGrfrjNTThvXWY-KGOSWsMGfyzR5KB0XsPZ6pUWcbsdimtrzTDc9Zktvbreyeux8UPjLGmE13JPghK5_D31DTFuC6m4VIx71_VasYDEr0CwaxCOjjUkJOSSAbbhD0w3njKdgf0kmz5X34yDPJ5y_6le50"
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Camel Melange");
  const [selectedSize, setSelectedSize] = useState("M");
  const [activeTab, setActiveTab] = useState<"desc" | "details" | "care" | "shipping">("desc");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addToCart, loading } = useCart();

  const priceFormatted = formatPrice(
    product.prices?.price,
    product.prices?.currency_symbol || "$",
    product.prices?.currency_minor_unit || 2
  );

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, quantity, undefined, {
      name: product.name,
      price: product.prices?.price,
      image: selectedImage,
    });
    if (success) {
      setToastMessage(`Added "${product.name}" to your shopping bag.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : [
    { id: 1, src: selectedImage, thumbnail: "", name: product.name, alt: product.name }
  ];

  return (
    <div className="w-full min-h-screen bg-[#faf9f4] pb-24">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1b1c19] text-[#faf9f4] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn border border-[#d5c3be]/30">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
          <Link href="/cart" className="ml-2 text-xs uppercase tracking-wider text-accent underline">
            View Bag
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-8 pb-12">
        
        {/* Breadcrumb Nav */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8A817C] mb-8">
          <Link href="/" className="hover:text-[#1b1c19] transition-colors">Home</Link>
          <span className="text-[#BCB8B1]">›</span>
          <Link href="/shop" className="hover:text-[#1b1c19] transition-colors">Shop</Link>
          <span className="text-[#BCB8B1]">›</span>
          <span className="text-[#1b1c19] font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Image Gallery (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Primary Visual */}
            <div className="relative w-full aspect-[4/5] bg-[#efeee9] rounded-2xl overflow-hidden shadow-sm border border-[#d5c3be]/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded bg-[#faf9f4]/95 backdrop-blur text-[#1b1c19] text-[10px] uppercase tracking-widest font-semibold shadow-sm">
                Atelier Edition
              </span>
            </div>

            {/* Thumbnail Gallery Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img.src)}
                    className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === img.src
                        ? "border-accent ring-2 ring-accent/30"
                        : "border-[#d5c3be]/50 hover:border-accent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Narrative & Actions (6 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            
            {/* Category / Batch Stamp */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-[#655d57] font-semibold">
                {product.categories?.[0]?.name || "Permanent Collection"}
              </span>
              <span className="text-xs uppercase tracking-wider text-[#8A817C]">
                Batch № 08 &bull; SKU: {product.sku || "EPA-08"}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1b1c19] tracking-tight mb-4">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl sm:text-3xl font-medium text-[#1b1c19]">
                {priceFormatted}
              </span>
              {product.on_sale && (
                <span className="text-xs px-3 py-1 rounded-full bg-accent/30 text-[#654136] font-semibold border border-accent">
                  Private Archive Pricing
                </span>
              )}
            </div>

            {/* Short Description */}
            <div
              className="text-sm md:text-base leading-relaxed text-[#514440] mb-8"
              dangerouslySetInnerHTML={{
                __html:
                  product.short_description ||
                  "Cut from double-faced virgin wool loomed in Biella, Italy. Engineered with a sculpted drop shoulder, relaxed kimono sleeve, and seamless hand-stitched hem for an unhurried, architectural silhouette.",
              }}
            />

            <hr className="border-[#d5c3be]/40 mb-8" />

            {/* Color Swatch Row */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1b1c19]">
                  Color: <span className="font-normal text-[#655d57]">{selectedColor}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { name: "Camel Melange", color: "#BCB8B1" },
                  { name: "Espresso Dark", color: "#463F3A" },
                  { name: "Warm Taupe", color: "#8A817C" },
                  { name: "Alabaster Cream", color: "#F4F3EE" },
                ].map((swatch) => (
                  <button
                    key={swatch.name}
                    type="button"
                    onClick={() => setSelectedColor(swatch.name)}
                    aria-label={swatch.name}
                    className={`relative w-8 h-8 rounded-full transition-all focus:outline-none border border-[#d5c3be] ${
                      selectedColor === swatch.name
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-[#faf9f4]"
                        : "hover:ring-1 hover:ring-accent"
                    }`}
                    style={{ backgroundColor: swatch.color }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1b1c19]">
                  Select Size
                </span>
                <span className="text-xs text-[#655d57] underline cursor-pointer hover:text-[#1b1c19]">
                  Atelier Sizing Guide
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {["S", "M", "L", "XL"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`h-12 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all focus:outline-none ${
                      selectedSize === sz
                        ? "bg-accent text-[#654136] border border-accent shadow-sm"
                        : "border border-[#d5c3be] bg-[#f5f4ef] text-[#655d57] hover:border-accent hover:text-[#1b1c19]"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & Add to Bag CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {/* Stepper */}
              <div className="flex items-center justify-between h-[52px] w-full sm:w-32 px-3 rounded-xl border border-[#d5c3be] bg-[#f5f4ef]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-[#1b1c19] hover:text-accent font-semibold text-lg"
                >
                  −
                </button>
                <span className="text-sm font-bold text-[#1b1c19]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-[#1b1c19] hover:text-accent font-semibold text-lg"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={loading}
                className="flex-1 h-[52px] px-8 rounded-xl bg-accent text-[#654136] text-xs uppercase tracking-wider font-bold shadow-md hover:bg-[#edbbac] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{loading ? "Adding to Bag..." : "Add to Bag"}</span>
                <span className="opacity-60">&bull;</span>
                <span>{priceFormatted}</span>
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                aria-label="Save to Wishlist"
                className="h-[52px] w-[52px] shrink-0 rounded-xl border border-[#d5c3be] text-[#1b1c19] hover:bg-accent hover:border-accent hover:text-[#654136] transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-[#d5c3be]/40 flex flex-col space-y-3">
              <div className="flex items-center gap-3 text-xs text-[#655d57]">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Complimentary Carbon-Neutral Shipping worldwide on orders over $300</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#655d57]">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>30-Day Complimentary Atelier Returns &amp; Exchanges</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#655d57]">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Encrypted &amp; Authenticated Store API Checkout</span>
              </div>
            </div>

          </div>

        </div>

        {/* Tabbed Section (Description, Details, Care, Shipping) */}
        <div className="mt-16 md:mt-24 pt-12 border-t border-[#d5c3be]/40">
          <div className="flex border-b border-[#d5c3be]/40 space-x-8 overflow-x-auto scrollbar-none mb-8">
            <button
              onClick={() => setActiveTab("desc")}
              className={`pb-3 text-xs uppercase tracking-wider font-semibold transition-all whitespace-nowrap ${
                activeTab === "desc"
                  ? "border-b-2 border-accent text-[#1b1c19]"
                  : "text-[#8A817C] hover:text-[#1b1c19]"
              }`}
            >
              Description &amp; Provenance
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-3 text-xs uppercase tracking-wider font-semibold transition-all whitespace-nowrap ${
                activeTab === "details"
                  ? "border-b-2 border-accent text-[#1b1c19]"
                  : "text-[#8A817C] hover:text-[#1b1c19]"
              }`}
            >
              Atelier Architecture
            </button>
            <button
              onClick={() => setActiveTab("care")}
              className={`pb-3 text-xs uppercase tracking-wider font-semibold transition-all whitespace-nowrap ${
                activeTab === "care"
                  ? "border-b-2 border-accent text-[#1b1c19]"
                  : "text-[#8A817C] hover:text-[#1b1c19]"
              }`}
            >
              Care Protocol
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-3 text-xs uppercase tracking-wider font-semibold transition-all whitespace-nowrap ${
                activeTab === "shipping"
                  ? "border-b-2 border-accent text-[#1b1c19]"
                  : "text-[#8A817C] hover:text-[#1b1c19]"
              }`}
            >
              Shipping &amp; Duties
            </button>
          </div>

          <div className="max-w-3xl text-sm leading-relaxed text-[#514440] space-y-4">
            {activeTab === "desc" && (
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    product.description ||
                    "<p>Conceived as an architectural response to the velocity of seasonal fashion, this piece embodies quiet permanence. Woven from 100% certified virgin fleece in Biella, Italy, each piece undergoes meticulous double-face splitting and blind hand-stitching.</p>",
                }}
              />
            )}

            {activeTab === "details" && (
              <div className="space-y-3">
                <div className="flex justify-between border-b border-[#d5c3be]/40 pb-2">
                  <span className="text-[#8A817C]">Fabric Composition</span>
                  <span className="font-medium text-[#1b1c19]">100% Traceable Virgin Wool (Biella)</span>
                </div>
                <div className="flex justify-between border-b border-[#d5c3be]/40 pb-2">
                  <span className="text-[#8A817C]">Internal Architecture</span>
                  <span className="font-medium text-[#1b1c19]">Seamless Hand-Stitched Double Face</span>
                </div>
                <div className="flex justify-between border-b border-[#d5c3be]/40 pb-2">
                  <span className="text-[#8A817C]">Closure Suite</span>
                  <span className="font-medium text-[#1b1c19]">Concealed Real Buffalo Horn Buttons</span>
                </div>
                <div className="flex justify-between border-b border-[#d5c3be]/40 pb-2">
                  <span className="text-[#8A817C]">Origin &amp; Atelier</span>
                  <span className="font-medium text-[#1b1c19]">Artisanal Workshop, Lyon, France</span>
                </div>
              </div>
            )}

            {activeTab === "care" && (
              <div className="space-y-3">
                <p>To preserve the structural integrity and loft of natural fibers:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Eco Dry Clean only with specialized wool artisans</li>
                  <li>Do not wash or tumble dry</li>
                  <li>Store on contoured cedar hangers in breathable garment covers</li>
                  <li>Steam lightly between seasonal wear to refresh fibers</li>
                </ul>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-3">
                <p>Every piece is dispatched from our central European atelier wrapped in unbleached archival tissue and protective storage boxes.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>European Union: Express 24-48h delivery</li>
                  <li>United Kingdom &amp; North America: DHL Express 2-3 business days (all duties included)</li>
                  <li>Asia Pacific &amp; Rest of World: 3-5 business days</li>
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

