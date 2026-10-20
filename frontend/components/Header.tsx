"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/api";
import { useCart } from "@/context/CartContext";

interface HeaderProps {
  logo?: string;
  navItems?: NavItem[];
}

export default function Header({ logo, navItems = [] }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { itemCount } = useCart();

  // Fallback nav if empty
  const navList = navItems.length > 0 ? navItems : [
    { label: "Shop", url: "/shop" },
    { label: "About", url: "/about" },
    { label: "Contact", url: "/contact" }
  ];

  const hasLogo = Boolean(
    logo &&
    logo.trim() !== "" &&
    logo !== "/logo.svg" &&
    !logo.includes("uploads/logo.svg")
  );

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#faf9f4]/90 backdrop-blur-md border-b border-[#d5c3be]/40">
      <div className="h-20 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between">
        
        {/* Left: Desktop Nav Items */}
        <div className="flex-1 flex items-center">
          <nav className="hidden md:flex items-center gap-6">
            {navList.map((item, idx) => {
              const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url));
              return (
                <Link
                  key={idx}
                  href={item.url}
                  className={`text-xs uppercase tracking-widest transition-all duration-200 pb-0.5 ${
                    isActive
                      ? "text-[#1b1c19] font-semibold border-b border-[#1b1c19]"
                      : "text-[#514440] hover:text-[#1b1c19]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Logo (if added) OR Brand Title by default */}
        {hasLogo ? (
          <div className="flex-shrink-0 text-center flex items-center justify-center">
            <Link
              href="/"
              className="flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo}
                alt="Épure Atelier"
                className="h-8 md:h-9 w-auto object-contain max-h-12"
              />
            </Link>
          </div>
        ) : (
          <div className="flex-shrink-0 text-center">
            <Link
              className="font-serif text-2xl md:text-3xl text-[#1b1c19] tracking-tight hover:opacity-90 transition-opacity"
              href="/"
            >
              Épure Atelier
            </Link>
          </div>
        )}

        {/* Right: Actions (Search, Profile, Cart, Mobile Toggle) */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
          {/* Search */}
          <Link
            href="/shop"
            aria-label="Search store"
            className="p-1.5 text-[#1b1c19] hover:text-[#7c5549] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>

          {/* Account */}
          <Link
            href="/profile"
            aria-label="Account profile"
            className="p-1.5 text-[#1b1c19] hover:text-[#7c5549] transition-colors hidden sm:inline-flex"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>

          {/* Cart Bag */}
          <Link
            href="/cart"
            aria-label="Shopping bag"
            className="p-1.5 text-[#1b1c19] hover:text-[#7c5549] transition-colors relative flex items-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span
              className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
              style={{ backgroundColor: "var(--primary-color, #463F3A)" }}
            >
              {itemCount}
            </span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#1b1c19] hover:text-[#7c5549] md:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf9f4] border-b border-[#d5c3be]/40 px-6 py-6 shadow-xl animate-fadeIn">
          <nav className="flex flex-col gap-4">
            {navList.map((item, idx) => (
              <Link
                key={idx}
                href={item.url}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm uppercase tracking-wider py-2 transition-colors ${
                  pathname === item.url ? "text-[#1b1c19] font-bold" : "text-[#514440] hover:text-[#1b1c19]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-[#d5c3be]/40 flex flex-col gap-3">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm uppercase tracking-wider text-[#514440] hover:text-[#1b1c19] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account / Profile
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm uppercase tracking-wider text-[#514440] hover:text-[#1b1c19] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Shopping Bag
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

