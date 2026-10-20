"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { FooterSettings, SocialLink, NavItem } from "@/lib/api";

interface FooterProps {
  footer?: FooterSettings;
  social?: SocialLink[];
  footerLinks?: NavItem[];
}

export default function Footer({
  footer,
  social = [],
  footerLinks = [],
}: FooterProps) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail("");
    }, 600);
  };

  const bgColor = footer?.bg_color || "#1b140f";
  const brandName = footer?.brand_name || "MadrissCosmoderma";
  const aboutText =
    footer?.about_text ||
    "Biomimetic dermatological skincare engineered with medical-grade actives, clinical trial precision, and plant-derived apothecary science.";
  const newsletterHeading = footer?.newsletter_heading || "Clinical Bulletin";
  const newsletterText =
    footer?.newsletter_text ||
    "Subscribe for clinical dermatology insights, formulation previews, and private apothecary releases.";
  const newsletterBtnText = footer?.newsletter_btn_text || "JOIN";
  const newsletterDisclaimer =
    footer?.newsletter_disclaimer ||
    "By joining you agree to receive medical skincare publications.";
  const copyright =
    footer?.copyright || "© 2026 MADRISSCOSMODERMA. ALL RIGHTS RESERVED.";

  // Dynamic Navigation Columns (Columns 2 & 3)
  const columns =
    footer?.columns && footer.columns.length > 0
      ? footer.columns
      : [
          {
            title: "Quick Links",
            links: [
              { label: "Shop", url: "/shop" },
              { label: "Best Sellers", url: "/shop" },
              { label: "Product Categories", url: "/shop" },
              { label: "About Us", url: "/about" },
            ],
          },
          {
            title: "Customer Care",
            links: [
              { label: "Shipping & Delivery", url: "/shipping" },
              { label: "Return & Refund Policy", url: "/returns" },
              { label: "Blogs", url: "/blog" },
            ],
          },
        ];

  // Dynamic Policy / Bottom Links
  const bottomLinks =
    footer?.bottom_links && footer.bottom_links.length > 0
      ? footer.bottom_links
      : footerLinks && footerLinks.length > 0
      ? footerLinks
      : [
          { label: "Privacy Policy", url: "/privacy" },
          { label: "Terms of Service", url: "/terms" },
          { label: "Accessibility", url: "/accessibility" },
        ];

  // Social icons renderer
  const renderSocialIcon = (network: string, icon?: string) => {
    const net = (network || icon || "").toLowerCase();

    if (net.includes("instagram")) {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    }
    if (net.includes("facebook")) {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
        </svg>
      );
    }
    if (net.includes("twitter") || net.includes("x")) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    }
    if (net.includes("linkedin")) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    }
    if (net.includes("pinterest")) {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0a12 12 0 0 0-4.37 23.18c-.05-.98-.1-2.48.02-3.55l.74-3.13s-.18-.37-.18-.92c0-.86.5-1.5 1.13-1.5.53 0 .79.4.79.88 0 .54-.34 1.34-.52 2.08-.15.62.31 1.13.92 1.13 1.1 0 1.95-1.16 1.95-2.84 0-1.48-1.07-2.52-2.59-2.52-1.76 0-2.8 1.32-2.8 2.69 0 .53.2.1.1.47-.03.11-.1.4-.13.53-.04.17-.15.21-.34.13-1.28-.59-2.07-2.46-2.07-3.95 0-3.22 2.34-6.17 6.74-6.17 3.54 0 6.29 2.52 6.29 5.89 0 3.51-2.22 6.34-5.3 6.34-1.03 0-2-.54-2.33-1.18l-.63 2.42c-.23.89-.86 2-1.28 2.69A12 12 0 1 0 12 0z" />
        </svg>
      );
    }

    // Default globe icon
    return (
      <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
        <path strokeWidth="1.5" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    );
  };

  return (
    <footer
      className="w-full text-[#e8e4dc] border-t border-[#3d2f26]/40 mt-auto transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 md:pt-20 pb-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Column 1: Brand & Socials (Span 4) */}
          <div className="lg:col-span-4 flex flex-col items-start">
            {footer?.logo ? (
              <Link href="/" className="mb-4 inline-block">
                <img
                  src={footer.logo}
                  alt={brandName}
                  className="h-8 w-auto object-contain brightness-110"
                />
              </Link>
            ) : (
              <Link
                href="/"
                className="font-serif text-2xl md:text-[26px] font-normal text-white tracking-tight leading-tight block mb-4 hover:opacity-90 transition-opacity"
              >
                {brandName}
              </Link>
            )}

            <p className="text-xs sm:text-[13px] text-[#b3a89b] leading-relaxed max-w-sm mb-6">
              {aboutText}
            </p>

            {/* Social Media Circular Buttons */}
            {social && social.length > 0 && (
              <div className="flex items-center gap-2.5">
                {social.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.network || `Social link ${idx + 1}`}
                    className="w-9 h-9 rounded-full bg-[#2a1f18] hover:bg-[#3d2f26] border border-[#3d2f26]/70 flex items-center justify-center text-[#d5c3be] hover:text-white transition-all duration-200 hover:scale-105 shadow-sm"
                  >
                    {renderSocialIcon(item.network, item.icon)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Dynamic Menu 1 (Quick Links) (Span 2) */}
          {columns[0] && (
            <div className="lg:col-span-2 flex flex-col">
              <h3 className="text-sm font-semibold text-white tracking-wide mb-5">
                {columns[0].title}
              </h3>
              <ul className="flex flex-col gap-3">
                {columns[0].links?.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.url || "#"}
                      className="text-xs sm:text-[13px] text-[#b3a89b] hover:text-white transition-colors duration-150 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 3: Dynamic Menu 2 (Customer Care) (Span 2) */}
          {columns[1] && (
            <div className="lg:col-span-2 flex flex-col">
              <h3 className="text-sm font-semibold text-white tracking-wide mb-5">
                {columns[1].title}
              </h3>
              <ul className="flex flex-col gap-3">
                {columns[1].links?.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.url || "#"}
                      className="text-xs sm:text-[13px] text-[#b3a89b] hover:text-white transition-colors duration-150 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 4: Newsletter / Bulletin (Span 4) */}
          <div className="lg:col-span-4 flex flex-col">
            <h3 className="text-sm font-semibold text-white tracking-wide mb-2.5">
              {newsletterHeading}
            </h3>
            <p className="text-xs sm:text-[13px] text-[#b3a89b] leading-relaxed mb-4 max-w-sm">
              {newsletterText}
            </p>

            {isSubscribed ? (
              <div className="p-3 rounded-md bg-[#2a1f18] border border-[#964827]/40 text-xs text-[#e8e4dc]">
                ✓ Thank you. You have been subscribed to our bulletin.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 bg-white text-[#1b1c19] text-xs sm:text-sm px-4 py-2.5 rounded-md placeholder-[#8a8075] focus:outline-none focus:ring-2 focus:ring-[#964827] border-0 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-[#964827] hover:bg-[#7e3a1d] active:scale-[0.98] text-white text-xs font-semibold tracking-wider uppercase rounded-md transition-all duration-200 flex-shrink-0 shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "..." : newsletterBtnText}
                  </button>
                </div>
                {newsletterDisclaimer && (
                  <p className="text-[11px] text-[#8a8075] leading-normal mt-1">
                    {newsletterDisclaimer}
                  </p>
                )}
              </form>
            )}
          </div>

        </div>

        {/* Subtle Divider Line */}
        <div className="w-full border-t border-[#3d2f26]/60 mt-14 mb-8" />

        {/* Bottom Bar / Sub-footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-wider text-[#8a8075] text-center md:text-left">
            {copyright}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#b3a89b]">
            {bottomLinks.map((link, bIdx) => (
              <Link
                key={bIdx}
                href={link.url || "#"}
                className="hover:text-white transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
