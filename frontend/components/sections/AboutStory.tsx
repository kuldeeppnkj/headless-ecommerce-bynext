import React from "react";
import type { AboutStorySection } from "@/types/acf";

export default function AboutStory({
  eyebrow = "Origin & Heritage",
  title = "Craftsmanship Without Compromise",
  content = "We believe everyday garments should be designed with precision and tailored to perfection.",
  quote_text = "“True luxury does not clamor for attention; it commands presence through silence and immaculate cut.”",
  quote_author = "— Atelier Épure Archives",
  image,
  image_alt,
  image_position = "left",
  badge_location = "7ème Arrondissement",
  badge_tagline = "Hand-Draped & Finished",
  badge_label = "Master Atelier",
}: AboutStorySection) {
  const imageUrl =
    typeof image === "string"
      ? image
      : image?.url || "http://paradise.test/wp-content/uploads/about-story.jpg";

  const isLeft = image_position === "left";

  return (
    <section className="w-full py-20 md:py-28 px-6 md:px-12 lg:px-20 bg-[#faf9f4] border-b border-[#d5c3be]/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Narrative Column */}
          <div
            className={`lg:col-span-6 flex flex-col justify-center ${
              isLeft ? "lg:order-2" : "lg:order-1"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-[#837470]"></span>
              <span className="text-xs uppercase tracking-widest text-[#514440] font-semibold">
                {eyebrow}
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-[#1b1c19] mb-6 leading-tight">
              {title}
            </h2>
            <div
              className="text-sm md:text-base text-[#514440] leading-relaxed space-y-4 mb-8 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {quote_text && (
              <div className="p-6 rounded-xl bg-[#f5f4ef] border border-[#d5c3be]/40 shadow-sm">
                <p className="font-serif italic text-base md:text-lg text-[#1b1c19] mb-2 leading-snug">
                  {quote_text}
                </p>
                {quote_author && (
                  <span className="text-xs uppercase tracking-wider text-[#655d57] font-medium">
                    {quote_author}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Editorial Visual Column */}
          <div
            className={`lg:col-span-6 relative ${
              isLeft ? "lg:order-1" : "lg:order-2"
            }`}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-[#efeee9] group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={image_alt || title || "Craftsmanship Without Compromise"}
                className="w-full h-[440px] md:h-[540px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#faf9f4]/95 backdrop-blur-md border border-[#d5c3be]/40 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#514440] font-semibold">
                    {badge_location}
                  </p>
                  <p className="text-[11px] text-[#655d57]">
                    {badge_tagline}
                  </p>
                </div>
                <span className="text-[10px] md:text-xs uppercase tracking-wider text-primary font-bold bg-[#faf9f4] px-2.5 py-1 rounded border border-[#d5c3be]/50">
                  {badge_label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
