"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/types/commerce";

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const items = cart?.items || [];
  const itemCount = cart?.items_count || 0;

  const subtotalFormatted = formatPrice(
    cart?.totals?.total_items,
    cart?.totals?.currency_symbol || "$",
    cart?.totals?.currency_minor_unit || 2
  );

  const totalFormatted = formatPrice(
    cart?.totals?.total_price,
    cart?.totals?.currency_symbol || "$",
    cart?.totals?.currency_minor_unit || 2
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim()) {
      setPromoApplied(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#faf9f4] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8A817C] mb-6">
          <Link href="/" className="hover:text-[#463F3A] transition-colors">
            Home
          </Link>
          <span className="text-[#BCB8B1]">›</span>
          <span className="text-[#463F3A] font-semibold">Shopping Bag</span>
        </nav>

        {/* Page Title */}
        <div className="mb-8 pb-4 border-b border-[#BCB8B1]/40 flex items-baseline justify-between">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.15em] uppercase text-[#463F3A]">
            YOUR CART
          </h1>
          <span className="text-xs uppercase tracking-widest text-[#8A817C]">
            {itemCount} {itemCount === 1 ? "Piece" : "Pieces"}
          </span>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-[#F4F3EE] rounded-[16px] border border-[#BCB8B1] p-12 md:p-20 text-center max-w-2xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-accent/20 text-[#654136] flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-[#463F3A] mb-3">
              Your Bag is Empty
            </h2>
            <p className="text-sm text-[#8A817C] max-w-md mx-auto mb-8 leading-relaxed">
              You haven&apos;t added any pieces to your shopping bag yet. Explore our latest seasonal monographs and permanent atelier silhouettes.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#463F3A] text-[#F4F3EE] hover:bg-accent hover:text-[#463F3A] text-xs uppercase tracking-wider font-semibold transition-all shadow-sm"
            >
              Explore Collection →
            </Link>
          </div>
        ) : (
          /* Main Two-Column Layout (Matching docs/cart.html) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
            
            {/* Left Column (8 cols): Cart Items Card */}
            <div className="lg:col-span-8 bg-[#F4F3EE] rounded-[16px] border border-[#BCB8B1] p-4 sm:p-6 shadow-sm">
              <div className="divide-y divide-[#BCB8B1]">
                {items.map((item) => {
                  const imageSrc =
                    item.images?.[0]?.src ||
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCw1ILVYS-T3BQnE81f55JUV0dYc-Iy9C-pScFDVpjl4nMwKh2QunRsgIUIgPcYu2DdB6hvLGdPLJ2k-ZFJGTmMDnGMwNXwGrfrjNTThvXWY-KGOSWsMGfyzR5KB0XsPZ6pUWcbsdimtrzTDc9Zktvbreyeux8UPjLGmE13JPghK5_D31DTFuC6m4VIx71_VasYDEr0CwaxCOjjUkJOSSAbbhD0w3njKdgf0kmz5X34yDPJ5y_6le50";

                  const lineTotal = formatPrice(
                    item.totals?.line_total || item.prices?.price,
                    item.totals?.currency_symbol || "$",
                    item.totals?.currency_minor_unit || 2
                  );

                  return (
                    <div
                      key={item.key}
                      className="py-6 first:pt-2 last:pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative"
                    >
                      {/* Product Thumbnail + Info */}
                      <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[12px] bg-[#BCB8B1]/30 flex-shrink-0 overflow-hidden border border-[#BCB8B1]/50 p-1 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageSrc}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-[10px]"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-[#463F3A] leading-snug">
                            {item.name}
                          </h3>
                          <div className="mt-1 space-y-0.5 text-xs sm:text-sm text-[#8A817C]">
                            {item.variation && item.variation.length > 0 ? (
                              item.variation.map((v, i) => (
                                <p key={i}>
                                  {v.attribute}:{" "}
                                  <span className="text-[#463F3A] font-medium">
                                    {v.value}
                                  </span>
                                </p>
                              ))
                            ) : (
                              <p className="text-[#8A817C]">Standard Edition</p>
                            )}
                          </div>
                          <div className="mt-3 text-lg sm:text-[22px] font-bold text-[#463F3A]">
                            {lineTotal}
                          </div>
                        </div>
                      </div>

                      {/* Stepper & Trash Removal Actions */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 self-end sm:self-center mt-2 sm:mt-0">
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          aria-label="Remove item"
                          className="absolute top-2 right-2 sm:static text-accent hover:text-[#463F3A] p-1.5 transition-colors"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        {/* Quantity Stepper Pill */}
                        <div className="inline-flex items-center bg-[#F4F3EE] border border-[#BCB8B1] rounded-full px-2 py-1 shadow-sm hover:border-accent transition-colors">
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity > 1
                                ? updateQuantity(item.key, item.quantity - 1)
                                : removeItem(item.key)
                            }
                            aria-label="Decrease quantity"
                            className="w-7 h-7 flex items-center justify-center text-[#463F3A] hover:text-accent font-semibold text-base transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-[#463F3A]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 flex items-center justify-center text-[#463F3A] hover:text-accent font-semibold text-base transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column (4 cols): Sticky Order Summary Card */}
            <div className="lg:col-span-4 bg-[#F4F3EE] rounded-[16px] border border-[#BCB8B1] p-6 sm:p-7 shadow-sm lg:sticky lg:top-28">
              <h2 className="text-xl sm:text-[22px] font-bold text-[#463F3A] mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm sm:text-base">
                <div className="flex justify-between items-center text-[#8A817C]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#463F3A]">{subtotalFormatted}</span>
                </div>

                <div className="flex justify-between items-center text-[#8A817C]">
                  <span>Shipping</span>
                  <span className="font-medium text-[#463F3A]">
                    Calculated at Checkout
                  </span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between items-center text-accent">
                    <span>Atelier Privilege Code</span>
                    <span className="font-bold">Active</span>
                  </div>
                )}
              </div>

              <div className="my-5 border-t border-[#BCB8B1]" />

              <div className="flex justify-between items-center mb-6 text-lg sm:text-[22px] font-bold text-[#463F3A]">
                <span>Total</span>
                <span>{totalFormatted}</span>
              </div>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Add promo code"
                    className="w-full pl-4 pr-3 py-2.5 bg-[#F4F3EE] text-[#463F3A] placeholder-[#8A817C] text-xs sm:text-sm rounded-full border border-[#BCB8B1] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#463F3A] text-[#F4F3EE] text-xs sm:text-sm font-semibold rounded-full hover:bg-accent hover:text-[#463F3A] transition-colors whitespace-nowrap shadow-sm"
                >
                  Apply
                </button>
              </form>

              {promoApplied && (
                <p className="text-xs text-primary font-medium mb-4">
                  Privilege code &quot;{promoCode}&quot; noted for checkout.
                </p>
              )}

              {/* Primary Go to Checkout Button */}
              <Link
                href="/checkout"
                className="w-full py-3.5 px-6 bg-[#463F3A] text-[#F4F3EE] font-semibold text-sm sm:text-base rounded-full flex items-center justify-center gap-2 hover:bg-accent hover:text-[#463F3A] transition-all shadow-md group"
              >
                <span>Go to Checkout</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

          </div>
        )}

        {/* Newsletter Banner matching docs/cart.html */}
        <section className="relative w-full rounded-[16px] overflow-hidden bg-[#463F3A] text-[#F4F3EE] p-8 sm:p-12 mb-16 shadow-lg">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-serif tracking-[0.06em] uppercase text-[#F4F3EE] leading-tight mb-2">
                Stay Connected for Exclusive Capsules
              </h2>
              <p className="text-xs uppercase tracking-widest text-[#cfc4bd]">
                Private previews &bull; Limited run announcements
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-full bg-white/10 text-white placeholder:text-white/60 border border-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="button"
                className="px-6 py-3 rounded-full bg-accent text-[#654136] text-xs uppercase tracking-wider font-bold hover:bg-[#edbbac] transition-all"
              >
                Subscribe
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

