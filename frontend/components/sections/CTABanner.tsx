"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { CTABannerSection } from "@/types/acf";

export default function CTABanner({
  title,
  button_text,
  button_url,
}: CTABannerSection) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="w-full py-20 md:py-28 bg-[#faf9f4] border-b border-[#d5c3be]/30">
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
        
        {/* Inner Card Container */}
        <div className="bg-[#f5f4ef] rounded-2xl p-8 sm:p-12 md:p-16 shadow-sm border border-[#d5c3be]/40 relative overflow-hidden">
          
          {/* Subtle Decorative Geometry */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            
            {/* Overline */}
            <span className="text-xs uppercase tracking-[0.2em] text-[#655d57] font-semibold block mb-3">
              Correspondence &amp; Privileges
            </span>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1b1c19] tracking-tight mb-4">
              {title || "Join the Inner Circle"}
            </h2>

            {/* Description */}
            <p className="text-sm md:text-base text-[#655d57] leading-relaxed mb-8">
              Receive private salon invitations, preview access to unreleased capsules, and seasonal editorial dispatches directly from our atelier.
            </p>

            {/* Action Form / Buttons */}
            {button_text && button_url ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href={button_url}
                  className="inline-flex items-center justify-center px-9 py-4 rounded-xl bg-accent text-[#654136] text-xs sm:text-sm uppercase tracking-wider font-semibold shadow-sm hover:bg-[#edbbac] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {button_text}
                </Link>
                <Link
                  href="/shop"
                  className="text-xs uppercase tracking-wider text-[#655d57] hover:text-[#1b1c19] transition-colors py-2"
                >
                  Explore Current Capsule →
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-md flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={subscribed}
                  className="flex-1 h-[52px] px-5 rounded-lg bg-white border border-[#d5c3be] text-[#1b1c19] placeholder:text-[#837470] text-sm focus:outline-none focus:ring-1 focus:ring-[#1b1c19] transition-all shadow-sm"
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  className="h-[52px] px-8 rounded-lg bg-accent text-[#654136] font-semibold text-xs uppercase tracking-wider transition-all duration-300 hover:bg-[#edbbac] hover:-translate-y-0.5 shadow-sm whitespace-nowrap disabled:opacity-60"
                >
                  {subscribed ? "Subscribed" : "Subscribe"}
                </button>
              </form>
            )}

            {subscribed && (
              <p className="text-xs text-primary font-medium mt-4 animate-fadeIn">
                Thank you for joining. Your formal invitation is on its way.
              </p>
            )}

            {/* Footnote */}
            <p className="text-[10px] md:text-xs text-[#837470] uppercase tracking-widest mt-8">
              Strict confidentiality &bull; No surplus correspondence
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}
