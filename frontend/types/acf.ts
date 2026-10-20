/**
 * TypeScript Interfaces for ACF Flexible Content Layouts
 */

export interface HeroSection {
  acf_fc_layout?: "hero";
  _type?: "hero";
  collection_tag?: string;
  heading: string;
  subheading?: string;
  bg_image?: string | { url: string; alt?: string; id?: number };
  bg_image_alt?: string;
  button_text?: string;
  button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  edition_label?: string;
  edition_locations?: string;
}

export interface ValueAnchorItem {
  _type?: string;
  label?: string;
  headline?: string;
  value?: string;
}

export interface ValueAnchorsSection {
  acf_fc_layout?: "value_anchors" | "value_props";
  _type?: "value_anchors" | "value_props";
  bg_color?: string;
  items?: ValueAnchorItem[];
}

export interface CuratedCollectionCard {
  _type?: string;
  category?: string;
  title: string;
  image?: string | { url: string; alt?: string; id?: number };
  image_alt?: string;
  link_url?: string;
  link_label?: string;
  stagger_offset?: boolean;
}

export interface CuratedCollectionSection {
  acf_fc_layout?: "curated_collection" | "featured_collection";
  _type?: "curated_collection" | "featured_collection";
  eyebrow?: string;
  heading?: string;
  cards?: CuratedCollectionCard[];
}

export interface CustomProductItem {
  _type?: string;
  badge?: string;
  material?: string;
  product_name?: string;
  name?: string;
  title?: string;
  price?: string;
  image?: string | { url: string; alt?: string; id?: number };
  image_alt?: string;
  url?: string;
  product_id?: number | string;
}

export interface ProductGridSection {
  acf_fc_layout?: "product_grid" | "the_icons" | "best_sellers";
  _type?: "product_grid" | "the_icons" | "best_sellers";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  view_all_label?: string;
  view_all_url?: string;
  category?: string;
  limit?: number | string;
  products?: CustomProductItem[];
  custom_products?: CustomProductItem[];
  items?: CustomProductItem[];
}

export interface AboutStorySection {
  acf_fc_layout?: "about_story" | "brand_heritage" | "craftsmanship";
  _type?: "about_story" | "brand_heritage" | "craftsmanship";
  eyebrow?: string;
  title: string;
  content: string;
  quote_text?: string;
  quote_author?: string;
  image?: string | { url: string; alt?: string; id?: number };
  image_alt?: string;
  image_position?: "left" | "right";
  badge_location?: string;
  badge_tagline?: string;
  badge_label?: string;
}

export interface TestimonialSlide {
  _type?: string;
  quote: string;
  author?: string;
  verified_text?: string;
  is_verified?: boolean | string;
}

export interface TestimonialsSection {
  acf_fc_layout?: "testimonials" | "testimonials_slider";
  _type?: "testimonials" | "testimonials_slider";
  heading?: string;
  bg_color?: string;
  autoplay?: boolean | string;
  autoplay_interval?: number | string;
  testimonials?: TestimonialSlide[];
  items?: TestimonialSlide[];
}

export interface CTABannerSection {
  acf_fc_layout?: "cta_banner";
  _type?: "cta_banner";
  title: string;
  button_text?: string;
  button_url?: string;
  background_color?: string;
}



export type AcfSection =
  | HeroSection
  | ValueAnchorsSection
  | CuratedCollectionSection
  | ProductGridSection
  | TestimonialsSection
  | AboutStorySection
  | CTABannerSection;

