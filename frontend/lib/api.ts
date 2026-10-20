/**
 * WordPress & WooCommerce REST API Client.
 */

export const WORDPRESS_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_URL || "http://paradise.test";

export interface NavItem {
  label: string;
  url: string;
}

export interface FooterColumn {
  title: string;
  links: NavItem[];
}

export interface SocialLink {
  network: string;
  url: string;
  icon?: string;
}

export interface FooterSettings {
  bg_color?: string;
  logo?: string;
  brand_name?: string;
  about_text?: string;
  newsletter_heading?: string;
  newsletter_text?: string;
  newsletter_btn_text?: string;
  newsletter_disclaimer?: string;
  copyright?: string;
  columns?: FooterColumn[];
  bottom_links?: NavItem[];
}

export interface GlobalSettings {
  logo: string;
  primary_color: string;
  accent_color: string;
  header_nav: NavItem[];
  footer_links: NavItem[];
  footer?: FooterSettings;
  social?: SocialLink[];
}

export interface PageResponse {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content?: {
    rendered: string;
  };
  acf?: {
    sections?: any[];
  };
  sections?: any[];
  custom_sections?: any[];
}

/**
 * Default fallback settings when WordPress is initializing or offline.
 */
export const DEFAULT_SETTINGS: GlobalSettings = {
  logo: "",
  primary_color: "#463F3A",
  accent_color: "#E0AFA0",
  header_nav: [
    { label: "Home", url: "/" },
    { label: "Shop", url: "/shop" },
    { label: "About", url: "/about" },
    { label: "Cart", url: "/cart" },
  ],
  footer_links: [
    { label: "Privacy Policy", url: "/privacy" },
    { label: "Terms of Service", url: "/terms" },
    { label: "Accessibility", url: "/accessibility" },
  ],
  footer: {
    bg_color: "#1b140f",
    logo: "",
    brand_name: "MadrissCosmoderma",
    about_text:
      "Biomimetic dermatological skincare engineered with medical-grade actives, clinical trial precision, and plant-derived apothecary science.",
    newsletter_heading: "Clinical Bulletin",
    newsletter_text:
      "Subscribe for clinical dermatology insights, formulation previews, and private apothecary releases.",
    newsletter_btn_text: "JOIN",
    newsletter_disclaimer:
      "By joining you agree to receive medical skincare publications.",
    copyright: "© 2026 MADRISSCOSMODERMA. ALL RIGHTS RESERVED.",
    columns: [
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
    ],
    bottom_links: [
      { label: "Privacy Policy", url: "/privacy" },
      { label: "Terms of Service", url: "/terms" },
      { label: "Accessibility", url: "/accessibility" },
    ],
  },
  social: [
    { network: "Instagram", url: "https://instagram.com", icon: "instagram" },
    { network: "Facebook", url: "https://facebook.com", icon: "facebook" },
    { network: "Twitter / X", url: "https://x.com", icon: "twitter" },
    { network: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
  ],
};

/**
 * Fetch Global Settings (Carbon Fields Theme Options & fallback).
 */
export async function getGlobalSettings(): Promise<GlobalSettings> {
  try {
    // 1. Try Carbon Fields /our/v1/theme-settings endpoint
    try {
      const themeRes = await fetch(
        `${WORDPRESS_URL}/wp-json/our/v1/theme-settings`,
        { next: { revalidate: 60 } }
      );
      if (themeRes.ok) {
        const themeData = await themeRes.json();
        // Support direct JSON or wrapped in envelope
        const payload = themeData.data || themeData;
        if (payload && (payload.primary_color || payload.header_nav || payload.footer)) {
          const rawFooter = payload.footer || {};
          const columns =
            Array.isArray(rawFooter.columns) && rawFooter.columns.length > 0
              ? rawFooter.columns
              : Array.isArray(payload.footer_cols) && payload.footer_cols.length > 0
              ? payload.footer_cols
              : DEFAULT_SETTINGS.footer?.columns;

          const social =
            Array.isArray(payload.social) && payload.social.length > 0
              ? payload.social
              : DEFAULT_SETTINGS.social;

          const bottomLinks =
            Array.isArray(rawFooter.bottom_links) && rawFooter.bottom_links.length > 0
              ? rawFooter.bottom_links
              : DEFAULT_SETTINGS.footer?.bottom_links;

          return {
            logo: payload.logo || DEFAULT_SETTINGS.logo,
            primary_color: payload.primary_color || DEFAULT_SETTINGS.primary_color,
            accent_color: payload.accent_color || DEFAULT_SETTINGS.accent_color,
            header_nav: Array.isArray(payload.header_nav) && payload.header_nav.length > 0
              ? payload.header_nav
              : DEFAULT_SETTINGS.header_nav,
            footer_links: Array.isArray(payload.footer_links) && payload.footer_links.length > 0
              ? payload.footer_links
              : DEFAULT_SETTINGS.footer_links,
            footer: {
              bg_color: rawFooter.bg_color || DEFAULT_SETTINGS.footer?.bg_color,
              logo: rawFooter.logo || payload.logo || DEFAULT_SETTINGS.footer?.logo,
              brand_name: rawFooter.brand_name || DEFAULT_SETTINGS.footer?.brand_name,
              about_text: rawFooter.about_text || DEFAULT_SETTINGS.footer?.about_text,
              newsletter_heading:
                rawFooter.newsletter_heading || DEFAULT_SETTINGS.footer?.newsletter_heading,
              newsletter_text:
                rawFooter.newsletter_text || DEFAULT_SETTINGS.footer?.newsletter_text,
              newsletter_btn_text:
                rawFooter.newsletter_btn_text || DEFAULT_SETTINGS.footer?.newsletter_btn_text,
              newsletter_disclaimer:
                rawFooter.newsletter_disclaimer || DEFAULT_SETTINGS.footer?.newsletter_disclaimer,
              copyright: rawFooter.copyright || DEFAULT_SETTINGS.footer?.copyright,
              columns,
              bottom_links: bottomLinks,
            },
            social,
          };
        }
      }
    } catch (carbonErr) {
      console.warn("Carbon Fields theme-settings fetch error:", carbonErr);
    }

    // 2. Fallback to /our/v1/options
    const res = await fetch(`${WORDPRESS_URL}/wp-json/our/v1/options`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`Failed to fetch global settings, HTTP ${res.status}`);
      return DEFAULT_SETTINGS;
    }

    const json = await res.json();
    if (json.success && json.data) {
      return {
        logo: json.data.logo || DEFAULT_SETTINGS.logo,
        primary_color: json.data.primary_color || DEFAULT_SETTINGS.primary_color,
        accent_color: json.data.accent_color || DEFAULT_SETTINGS.accent_color,
        header_nav: Array.isArray(json.data.header_nav) && json.data.header_nav.length > 0
          ? json.data.header_nav
          : DEFAULT_SETTINGS.header_nav,
        footer_links: Array.isArray(json.data.footer_links) && json.data.footer_links.length > 0
          ? json.data.footer_links
          : DEFAULT_SETTINGS.footer_links,
      };
    }

    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error fetching global settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Helper to check if Next.js draft mode is active.
 * Uses dynamic import of 'next/headers' so client components importing types
 * or WORDPRESS_URL from lib/api are unaffected.
 */
export async function isDraftModeActive(): Promise<boolean> {
  try {
    const { draftMode } = await import("next/headers");
    const draft = await draftMode();
    return draft.isEnabled;
  } catch {
    return false;
  }
}

/**
 * Fetch a Page by its slug with ACF sections.
 * Automatically detects draft mode or accepts forceDraft flag to bypass cache
 * and retrieve draft/preview revisions from WordPress.
 */
export async function getPageBySlug(
  slug: string,
  forceDraft?: boolean
): Promise<PageResponse | null> {
  try {
    const isDraft =
      forceDraft !== undefined ? forceDraft : await isDraftModeActive();
    const normalizedSlug = slug.replace(/^\/|\/$/g, "") || "home";

    // When draft mode is active: bypass Next.js cache and query drafts
    if (isDraft) {
      const previewSecret =
        process.env.DRAFT_SECRET || "paradise_preview_secret_2026";

      // 1. Attempt to fetch via dedicated headless preview endpoint
      try {
        const previewRes = await fetch(
          `${WORDPRESS_URL}/wp-json/our/v1/preview-page?slug=${normalizedSlug}&secret=${previewSecret}`,
          {
            cache: "no-store",
          }
        );

        if (previewRes.ok) {
          const json = await previewRes.json();
          if (json.success && json.data) {
            return json.data.id ? json.data : (json.data.data || json.data);
          }
        }
      } catch (previewErr) {
        console.warn("Headless preview endpoint error:", previewErr);
      }

      // 2. Fallback to status=any on WP REST API without cache
      const draftRes = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/pages?slug=${normalizedSlug}&status=any&_embed`,
        {
          cache: "no-store",
        }
      );

      if (draftRes.ok) {
        const pages = await draftRes.json();
        if (Array.isArray(pages) && pages.length > 0) {
          return pages[0];
        }
      }

      return null;
    }

    // Standard cached fetch for published pages
    const res = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/pages?slug=${normalizedSlug}&_embed`,
      {
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) {
      return null;
    }

    const pages = await res.json();
    if (Array.isArray(pages) && pages.length > 0) {
      return pages[0];
    }

    return null;
  } catch (error) {
    console.error(`Error fetching page slug "${slug}":`, error);
    return null;
  }
}

/**
 * Generic fetch wrapper for WooCommerce Store API.
 */
export async function fetchStoreAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${WORDPRESS_URL}/wp-json/wc/store/v1/${endpoint.replace(/^\//, "")}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

export interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  icon?: string;
  supports?: string[];
  stripe_params?: {
    publishable_key: string;
    testmode: boolean;
  };
}

export async function getPaymentGateways(): Promise<PaymentGateway[]> {
  try {
    const res = await fetch(`${WORDPRESS_URL}/wp-json/our/v1/payment-gateways`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    return [];
  } catch (err) {
    console.error("Failed to fetch payment gateways:", err);
    return [];
  }
}

