import React from "react";
import Link from "next/link";
import type { CuratedCollectionSection, CuratedCollectionCard } from "@/types/acf";

const DEFAULT_CARDS: CuratedCollectionCard[] = [
  {
    category: "Outerwear",
    title: "The Architectural Coat",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCw1ILVYS-T3BQnE81f55JUV0dYc-Iy9C-pScFDVpjl4nMwKh2QunRsgIUIgPcYu2DdB6hvLGdPLJ2k-ZFJGTmMDnGMwNXwGrfrjNTThvXWY-KGOSWsMGfyzR5KB0XsPZ6pUWcbsdimtrzTDc9Zktvbreyeux8UPjLGmE13JPghK5_D31DTFuC6m4VIx71_VasYDEr0CwaxCOjjUkJOSSAbbhD0w3njKdgf0kmz5X34yDPJ5y_6le50",
    image_alt:
      "Editorial look of an oversized camel and oatmeal alpaca-wool trench coat on a model in a minimal sunlit studio space. Muted warm earth tones, serene posture, tactile textural weave visible in fine detail, high-fashion campaign photography.",
    link_url: "/shop",
    link_label: "Explore",
    stagger_offset: false,
  },
  {
    category: "Essentials",
    title: "Foundational Separates",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZpaRnczbCAzM12FZswQnW5fZSubIECJTSHewP7YN6A1AiGsAcT9AcsQkaHvizwKAD2Xm0tZGKMGIwi3MpzZHTSNhX0Dq9hIFvtrI5lt3BxJ_2vMDPM2RjkAmKW9rJ2okdUl2TXFZdjAQP-idCdSWFiX-cVGsG1hmBtS7t_UhGBj92brJKo8uroKGARjhNNGuklpAywO0usKxrZfrkgN8-mxvcLwmEN4CqT_BKsXt23skO6yjLNS_U",
    image_alt:
      "Minimal studio portrait showcasing a model draped in a high-neck raw ivory silk blouse paired with crisp pleated wide-leg trousers. Soft sculptural shadows, clean architectural composition, warm monochrome aesthetic, luxury editorial lighting.",
    link_url: "/shop",
    link_label: "Explore",
    stagger_offset: true,
  },
  {
    category: "Evening",
    title: "Twilight Monologues",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDleN-iT2hsnTmx_JwZos1Z02kHJ2bMSGBbU7eU9s9ADOvdgx9G90OYMAesqqppdfWZb2dGyHyVmfvgdsMQYGJmN319AV9bb9541GjNekiXlHgO1B3QF3AgkNxxXs7YzVfoNVmeagrrM9ATd0NkSuyRHrfE8yTD_5lctXVnhmLDpVBP85PrVnjD-3_3cs2plLRQew6ynbSeyAdD3gUVdANeSFFYP6r_FXOBWFlyKxSM3Ci2mI8HEX5H",
    image_alt:
      "Editorial full-length photograph of an understated evening gown in deep espresso crepe de chine. Dramatic fluid silhouette with backless drape against a warm limestone wall with subtle morning light. Refined, poetic luxury.",
    link_url: "/shop",
    link_label: "Explore",
    stagger_offset: false,
  },
];

export default function CuratedCollection({
  eyebrow,
  heading,
  cards,
}: CuratedCollectionSection) {
  const displayEyebrow = eyebrow || "Discover Essentials";
  const displayHeading = heading || "Curated For You";
  const displayCards = cards && cards.length > 0 ? cards : DEFAULT_CARDS;

  return (
    <section className="w-full py-14 md:py-28 bg-[#faf9f4]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-[4.5rem] flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-xl mb-14">
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#655d57] block mb-1.5 font-medium">
            {displayEyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1b1c19] tracking-tight font-normal">
            {displayHeading}
          </h2>
          <div className="w-12 h-[2px] bg-[#e0afa0] mx-auto mt-3" />
        </div>

        {/* 3-Column Card Grid - Perfectly aligned across all devices */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-start">
          {displayCards.map((card, index) => {
            const imageUrl =
              typeof card.image === "string"
                ? card.image
                : card.image?.url || DEFAULT_CARDS[index % DEFAULT_CARDS.length].image;
            const altText =
              card.image_alt ||
              (typeof card.image === "object" ? card.image?.alt : "") ||
              card.title;
            const categoryText = card.category || "";
            const linkHref = card.link_url || "/shop";
            const linkText = card.link_label || "Explore";

            return (
              <article
                key={`collection-card-${index}`}
                className="group flex flex-col w-full"
              >
                {/* Image Container with 3:4 Aspect Ratio */}
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-[#efeee9]">
                  <img
                    src={imageUrl as string}
                    alt={altText}
                    data-alt={altText}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#1b1c19]/5 group-hover:bg-transparent transition-colors duration-300" />
                  <Link
                    href={linkHref}
                    aria-label={`${linkText} ${card.title}`}
                    className="absolute inset-0"
                  />
                </div>

                {/* Card Meta & Explore Action - Level aligned */}
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {categoryText && (
                      <span className="font-sans text-[11px] leading-[14px] uppercase tracking-[0.16em] text-[#655d57] font-semibold block mb-1">
                        {categoryText}
                      </span>
                    )}
                    <h3 className="font-serif text-xl sm:text-[22px] leading-snug sm:leading-[30px] text-[#1b1c19] font-normal">
                      {card.title}
                    </h3>
                  </div>

                  <Link
                    href={linkHref}
                    className="flex-shrink-0 pt-0.5 font-sans text-[11px] leading-[14px] text-[#7c5549] uppercase tracking-wider font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>{linkText}</span>
                    <svg
                      className="w-3.5 h-3.5"
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
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

