import React from "react";
import type { ValueAnchorsSection, ValueAnchorItem } from "@/types/acf";

const DEFAULT_ITEMS: ValueAnchorItem[] = [
  { label: "Material Origin", headline: "100% Traceable" },
  { label: "Atelier Standard", headline: "Small Batch Run" },
  { label: "Shipping", headline: "Carbon Neutral" },
  { label: "Client Experience", headline: "Private Concierge" },
];

export default function ValueAnchors({
  bg_color,
  items,
}: ValueAnchorsSection) {
  const displayItems = items && items.length > 0 ? items : DEFAULT_ITEMS;
  const backgroundColor = bg_color || "#f5f4ef";

  return (
    <section
      className="w-full py-5 bg-[#f5f4ef]"
      style={{ backgroundColor }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-[4.5rem] grid grid-cols-2 md:grid-cols-4 gap-6 py-1.5 text-center md:text-left">
        {displayItems.map((item, index) => {
          const label = item.label || "";
          const headline = item.headline || item.value || "";

          return (
            <div key={`anchor-${index}`} className="flex flex-col gap-1">
              <span className="font-sans text-[11px] leading-[14px] uppercase tracking-[0.12em] text-[#655d57] font-semibold">
                {label}
              </span>
              <span className="font-serif text-[22px] leading-[30px] tracking-[0.01em] text-[#1b1c19] font-normal">
                {headline}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
