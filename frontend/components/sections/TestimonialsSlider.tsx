"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { TestimonialsSection, TestimonialSlide } from "@/types/acf";

const DEFAULT_SLIDES: TestimonialSlide[] = [
  {
    quote:
      "“The craftsmanship and subtle silhouette of these pieces speak for themselves. Truly timeless design in every stitch.”",
    author: "Sarah M.",
    verified_text: "Verified Patron • Private Client since 2021",
    is_verified: true,
  },
  {
    quote:
      "“An exquisite balance between masculine architecture and fluid femininity. The cashmere coat is an heirloom piece.”",
    author: "Elena V.",
    verified_text: "Verified Patron • Milan / Paris Atelier",
    is_verified: true,
  },
  {
    quote:
      "“Uncompromising materiality. You can feel the tactile integrity the moment you slip on the double-faced wool blazer.”",
    author: "Julian K.",
    verified_text: "Verified Patron • Private Client since 2022",
    is_verified: true,
  },
];

export default function TestimonialsSlider({
  heading,
  bg_color = "#efeee9",
  autoplay = true,
  autoplay_interval = 6,
  testimonials = [],
  items = [],
}: TestimonialsSection) {
  // Normalize slides
  const rawSlides =
    testimonials && testimonials.length > 0
      ? testimonials
      : items && items.length > 0
      ? items
      : DEFAULT_SLIDES;

  const slides = rawSlides.map((slide) => {
    let q = (slide.quote || "").trim();
    if (q && !q.startsWith("“") && !q.startsWith('"')) {
      q = `“${q}”`;
    }
    return {
      quote: q,
      author: slide.author || "Sarah M.",
      verified_text:
        slide.verified_text || "Verified Patron • Private Client since 2021",
      is_verified:
        slide.is_verified === true ||
        slide.is_verified === "yes" ||
        slide.is_verified === "1",
    };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const total = slides.length;

  const goToSlide = useCallback(
    (index: number) => {
      if (total === 0) return;
      setCurrentIndex((index + total) % total);
    },
    [total]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Autoplay
  const shouldAutoplay =
    autoplay === true || autoplay === "yes" || autoplay === "1";
  const intervalSeconds = Number(autoplay_interval) || 6;

  useEffect(() => {
    if (!shouldAutoplay || total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [shouldAutoplay, total, isPaused, intervalSeconds, currentIndex, goToSlide]);

  // Touch Swipe
  const minSwipeDistance = 45;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  if (total === 0) return null;

  return (
    <section
      className="relative w-full py-16 sm:py-20 md:py-28 bg-[#efeee9] flex items-center justify-center transition-colors duration-300"
      style={{ backgroundColor: bg_color || "#efeee9" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label="Client Testimonials"
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-8 md:px-12 w-full text-center flex flex-col items-center">
        {/* Optional Heading */}
        {heading && (
          <span className="text-xs uppercase tracking-[0.2em] text-[#655d57] font-semibold mb-6 block">
            {heading}
          </span>
        )}

        {/* Quote Glyph matching format_quote in user HTML */}
        <div className="text-[#7c5549] text-[36px] mb-3 opacity-80 flex items-center justify-center select-none">
          <svg
            className="w-9 h-9 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
          </svg>
        </div>

        {/* Testimonials Fade Container: Stacked Grid for pure fade transitions without jumping */}
        <div className="relative w-full grid grid-cols-1 grid-rows-1 items-center justify-items-center">
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;

            return (
              <div
                key={idx}
                className={`col-start-1 row-start-1 w-full max-w-3xl flex flex-col items-center transition-opacity duration-600 ease-in-out ${
                  isActive
                    ? "opacity-100 pointer-events-auto z-10"
                    : "opacity-0 pointer-events-none z-0"
                }`}
                aria-hidden={!isActive}
              >
                {/* Blockquote with exact font-display-md styling from design */}
                <blockquote className="font-serif italic text-2xl sm:text-3xl md:text-[2.5rem] lg:text-[2.75rem] text-[#1b1c19] leading-tight max-w-3xl">
                  {slide.quote}
                </blockquote>

                {/* Author & Verified Patron Badge */}
                <div className="mt-6 md:mt-8 flex flex-col items-center gap-1.5">
                  <span className="text-base md:text-lg font-medium text-[#655d57]">
                    — {slide.author}
                  </span>

                  {slide.is_verified && (
                    <div className="flex items-center gap-1.5 text-[#655d57]">
                      {/* Crisp dual-path SVG verified icon: Warm rosette badge with sharp white checkmark */}
                      <svg
                        className="w-[18px] h-[18px] flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-label="Verified"
                      >
                        <path
                          fill="#7c5549"
                          d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12z"
                        />
                        <path
                          fill="#ffffff"
                          d="M10.09 16.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"
                        />
                      </svg>
                      <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-[#655d57]">
                        {slide.verified_text}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimalist luxury slider navigation controls */}
        {total > 1 && (
          <div className="mt-8 md:mt-10 flex items-center justify-center gap-6 z-20">
            {/* Previous Slide Arrow */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous testimonial"
              className="group p-2 rounded-full border border-[#d5c3be]/70 text-[#514440] hover:text-[#1b1c19] hover:border-[#1b1c19] hover:bg-white/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7c5549]/30"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Pill / Dot Indicators */}
            <div className="flex items-center gap-2">
              {slides.map((_, dotIdx) => {
                const isActive = dotIdx === currentIndex;
                return (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => goToSlide(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                    className={`h-1.5 transition-all duration-400 rounded-full focus:outline-none ${
                      isActive
                        ? "w-8 bg-[#1b1c19]"
                        : "w-2 bg-[#837470]/40 hover:bg-[#837470]/70"
                    }`}
                  />
                );
              })}
            </div>

            {/* Next Slide Arrow */}
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next testimonial"
              className="group p-2 rounded-full border border-[#d5c3be]/70 text-[#514440] hover:text-[#1b1c19] hover:border-[#1b1c19] hover:bg-white/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7c5549]/30"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
