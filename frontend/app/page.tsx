import { getPageBySlug } from "@/lib/api";
import SectionRenderer from "@/components/SectionRenderer";
import type { AcfSection } from "@/types/acf";


const DEFAULT_HOME_SECTIONS: AcfSection[] = [
  {
    acf_fc_layout: "hero",
    heading: "Modern Luxury Redefined",
    subheading:
      "Sculptural tailoring and unyielding materiality, conceived for longevity in form and presence.",
    button_text: "Shop New Arrivals",
    button_url: "/shop",
  },
  {
    acf_fc_layout: "product_grid",
    title: "Curated Essentials",
    category: "clothing",
    limit: 4,
  },
  {
    acf_fc_layout: "about_story",
    title: "The Atelier Story",
    content:
      "Rooted in architectural precision and unyielding craft, Atelier Épure bridges historical Parisian silhouettes with modern textile research.",
    image_position: "left",
  },
  {
    acf_fc_layout: "cta_banner",
    title: "Join the Inner Circle",
    button_text: "Discover Capsule",
    button_url: "/shop",
  },
];

export default async function HomePage() {
  const page = await getPageBySlug("home");

  const rawSections =
    page?.custom_sections ||
    page?.acf?.sections ||
    page?.sections ||
    [];

  const sections: AcfSection[] =
    Array.isArray(rawSections) && rawSections.length > 0
      ? (rawSections as AcfSection[])
      : DEFAULT_HOME_SECTIONS;

  return (
    <div className="w-full flex flex-col">
      <SectionRenderer sections={sections} />
    </div>
  );
}
