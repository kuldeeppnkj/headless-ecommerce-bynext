import React from "react";
import type {
  AcfSection,
  HeroSection,
  ValueAnchorsSection,
  CuratedCollectionSection,
  ProductGridSection,
  TestimonialsSection,
  AboutStorySection,
  CTABannerSection,
} from "@/types/acf";
import Hero from "@/components/sections/Hero";
import ValueAnchors from "@/components/sections/ValueAnchors";
import CuratedCollection from "@/components/sections/CuratedCollection";
import ProductGrid from "@/components/sections/ProductGrid";
import TestimonialsSlider from "@/components/sections/TestimonialsSlider";
import AboutStory from "@/components/sections/AboutStory";
import CTABanner from "@/components/sections/CTABanner";

interface SectionRendererProps {
  sections?: AcfSection[];
}

export default function SectionRenderer({ sections = [] }: SectionRendererProps) {
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col">
      {sections.map((section, index) => {
        const layout = section.acf_fc_layout || section._type;

        switch (layout) {
          case "hero":
            return <Hero key={`hero-${index}`} {...(section as HeroSection)} />;

          case "value_anchors":
          case "value_props":
            return (
              <ValueAnchors
                key={`anchors-${index}`}
                {...(section as ValueAnchorsSection)}
              />
            );

          case "curated_collection":
          case "featured_collection":
            return (
              <CuratedCollection
                key={`curated-${index}`}
                {...(section as CuratedCollectionSection)}
              />
            );

          case "product_grid":
          case "the_icons":
          case "best_sellers":
            return (
              <ProductGrid
                key={`pgrid-${index}`}
                {...(section as ProductGridSection)}
              />
            );

          case "testimonials":
          case "testimonials_slider":
            return (
              <TestimonialsSlider
                key={`testimonials-${index}`}
                {...(section as TestimonialsSection)}
              />
            );

          case "about_story":
          case "brand_heritage":
          case "craftsmanship":
            return (
              <AboutStory
                key={`astory-${index}`}
                {...(section as AboutStorySection)}
              />
            );

          case "cta_banner":
            return (
              <CTABanner
                key={`cta-${index}`}
                {...(section as CTABannerSection)}
              />
            );

          default:
            return (
              <div
                key={`unknown-${index}`}
                className="w-full max-w-4xl mx-auto my-6 p-4 rounded border border-amber-300 bg-amber-50 text-amber-900 text-xs font-mono"
              >
                <strong>Unrecognized ACF Layout:</strong> &quot;{layout}&quot;
                <pre className="mt-2 text-[11px] overflow-x-auto">
                  {JSON.stringify(section, null, 2)}
                </pre>
              </div>
            );
        }
      })}
    </div>
  );
}

