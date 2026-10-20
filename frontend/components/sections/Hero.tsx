import React from "react";
import Link from "next/link";
import type { HeroSection } from "@/types/acf";

export default function Hero({
  collection_tag,
  heading,
  subheading,
  bg_image,
  bg_image_alt,
  button_text,
  button_url,
  secondary_button_text,
  secondary_button_url,
  edition_label,
  edition_locations,
}: HeroSection) {
  const imageUrl =
    typeof bg_image === "string"
      ? bg_image
      : bg_image?.url ||
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBoxbI-Q0S1tXfHHsJNdxD2OgSBqhi1JHjSczy35ltKizBS49Po5iGlnjrmb3RJP2iQrIyVLO9Gv-CD9JOopnNZcpMbNesauogiMrceXPsxtqEpfxdidbKHm3RRdOia9SaHJiTlqHj_pPne5xlIqze8Hw-0BmSm6U5LUKmzmepx2Z01aT0TcI7EyoS6QLqzQjBUmKc_zZzPZrSRHbK7sz9WcbGOzTzeZ0whkDU2Ufh5KHs3_btBtMOE";

  const altDescription =
    bg_image_alt ||
    (typeof bg_image === "object" ? bg_image?.alt : "") ||
    "Editorial fashion campaign photograph featuring an elegant female model in a structured architectural beige double-faced wool coat. She is positioned against a warm concrete and travertine modernist brutalist gallery interior. Soft cinematic daylight streams from the side, delicate parchment neutral tones, desaturated warm palette with muted espresso undertones, quiet luxury minimalist styling.";

  const tagText = collection_tag || "Autumn / Winter 2024 Collection";
  const mainHeading = heading || "Modern Luxury Redefined";
  const description =
    subheading ||
    "Sculptural tailoring and unyielding materiality, conceived for longevity in form and presence.";
  const primaryBtnText = button_text || "Shop New Arrivals";
  const primaryBtnUrl = button_url || "/shop";
  const secondaryBtnText = secondary_button_text || "View Lookbook N°08";
  const secondaryBtnUrl = secondary_button_url || "/lookbook";
  const editionBadge = edition_label || "Edition Nº 04/24";
  const locations = edition_locations || "Paris — Florence — Kyoto";

  return (
    <section className="relative w-full -mt-20 overflow-hidden bg-[#30312e]">
      <div
        className="relative w-full min-h-[942px] flex items-end pb-14 pt-32 px-5 md:px-10 lg:px-16 bg-cover bg-center"
        data-alt={altDescription}
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#30312e]/85 via-[#30312e]/30 to-transparent" />

        {/* Content Container */}
        <div className="relative z-10 max-w-4xl flex flex-col items-start gap-3 mb-4">
          {/* Eyebrow / Tagline */}
          <div className="flex items-center gap-1.5">
            <span className="w-8 h-[1px] bg-[#edbbac]" />
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#edbbac] font-medium">
              {tagText}
            </span>
          </div>

          {/* Display Headline */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-[#faf9f4] tracking-tight max-w-3xl leading-[1.05]">
            {mainHeading}
          </h1>

          {/* Subheading Description */}
          <p className="font-sans text-lg text-[#e9e8e3] max-w-xl font-light leading-relaxed">
            {description}
          </p>

          {/* Action CTAs */}
          <div className="pt-5 flex flex-wrap items-center gap-5">
            <Link
              href={primaryBtnUrl}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-[#e0afa0] text-[#654136] font-sans text-sm uppercase tracking-wider font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-[#edbbac]"
            >
              {primaryBtnText}
            </Link>

            <Link
              href={secondaryBtnUrl}
              className="inline-flex items-center gap-2 font-sans text-sm uppercase tracking-wider text-[#faf9f4] hover:text-[#e0afa0] transition-colors duration-200 group"
            >
              <span>{secondaryBtnText}</span>
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right-aligned Edition Details (Desktop) */}
        <div className="hidden lg:flex absolute bottom-14 right-16 flex-col items-end text-right z-10">
          <span className="font-sans text-[11px] uppercase tracking-widest text-[#dbdad5] font-medium">
            {editionBadge}
          </span>
          <span className="font-sans text-xs text-[#e9e8e3]">
            {locations}
          </span>
        </div>
      </div>
    </section>
  );
}
