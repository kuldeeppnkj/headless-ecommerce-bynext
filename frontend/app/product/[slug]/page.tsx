import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WORDPRESS_URL } from "@/lib/api";
import type { StoreApiProduct } from "@/types/commerce";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const FALLBACK_PRODUCTS: Record<string, StoreApiProduct> = {
  "the-drape-wool-overcoat": {
    id: 13,
    name: "The Drape Wool Overcoat",
    slug: "the-drape-wool-overcoat",
    permalink: "/product/the-drape-wool-overcoat",
    sku: "DrapeWoolOvercoat",
    short_description:
      "Cut from double-faced virgin wool loomed in Biella, Italy. Engineered with a sculpted drop shoulder, relaxed kimono sleeve, and seamless hand-stitched hem.",
    description:
      "<p>Conceived as an architectural response to the velocity of seasonal fashion, <strong>The Drape Wool Overcoat</strong> embodies quiet permanence. Woven from 100% certified virgin fleece in Biella, Italy, each piece undergoes meticulous double-face splitting and blind hand-stitching along the lapels and perimeter.</p>",
    type: "variable",
    on_sale: false,
    prices: {
      price: "76800",
      regular_price: "76800",
      sale_price: "76800",
      currency_code: "USD",
      currency_symbol: "$",
      currency_minor_unit: 2,
      currency_prefix: "$",
      currency_suffix: "",
    },
    images: [
      {
        id: 1,
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCw1ILVYS-T3BQnE81f55JUV0dYc-Iy9C-pScFDVpjl4nMwKh2QunRsgIUIgPcYu2DdB6hvLGdPLJ2k-ZFJGTmMDnGMwNXwGrfrjNTThvXWY-KGOSWsMGfyzR5KB0XsPZ6pUWcbsdimtrzTDc9Zktvbreyeux8UPjLGmE13JPghK5_D31DTFuC6m4VIx71_VasYDEr0CwaxCOjjUkJOSSAbbhD0w3njKdgf0kmz5X34yDPJ5y_6le50",
        thumbnail: "",
        name: "Drape Wool Overcoat Main",
        alt: "Drape Wool Overcoat Main",
      },
      {
        id: 2,
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSwuVqXpHCAmUejTFr01jAF-Q1UuhX0Ao2048iv4_QQka3u9lsyyjKfVhm7efj7s-A3e7rKrDXAUUECf-B-2mKeMWZ8StFtubprVO3sj_JPkWuHcEdRSlaB26jQe8LSZpHXKxeFrxnhVTsf91jmo4z4QsYHkRunzZwxPFNni522FIL3VDLK9ZXAZkeigDNcIjk1UgWL0XsIq0GLH8uZpUW3_qTG1ucj1WgZ8J6XTYAEG8AYIX7Npff",
        thumbnail: "",
        name: "Drape Wool Overcoat Angle",
        alt: "Drape Wool Overcoat Angle",
      },
    ],
    categories: [{ id: 1, name: "Outerwear", slug: "outerwear" }],
    is_in_stock: true,
  },
  "latelier-structured-blazer": {
    id: 14,
    name: "L’Atelier Structured Blazer",
    slug: "latelier-structured-blazer",
    permalink: "/product/latelier-structured-blazer",
    sku: "StructuredBlazer",
    short_description: "Virgin wool blend tailored blazer with architectural lapels.",
    description: "An iconic structured blazer crafted for modern formal versatility.",
    type: "simple",
    on_sale: false,
    prices: {
      price: "58000",
      regular_price: "58000",
      sale_price: "58000",
      currency_code: "USD",
      currency_symbol: "$",
      currency_minor_unit: 2,
      currency_prefix: "$",
      currency_suffix: "",
    },
    images: [
      {
        id: 2,
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSwuVqXpHCAmUejTFr01jAF-Q1UuhX0Ao2048iv4_QQka3u9lsyyjKfVhm7efj7s-A3e7rKrDXAUUECf-B-2mKeMWZ8StFtubprVO3sj_JPkWuHcEdRSlaB26jQe8LSZpHXKxeFrxnhVTsf91jmo4z4QsYHkRunzZwxPFNni522FIL3VDLK9ZXAZkeigDNcIjk1UgWL0XsIq0GLH8uZpUW3_qTG1ucj1WgZ8J6XTYAEG8AYIX7Npff",
        thumbnail: "",
        name: "Structured Blazer",
        alt: "Structured Blazer",
      },
    ],
    categories: [{ id: 2, name: "Tailoring", slug: "tailoring" }],
    is_in_stock: true,
  },
};

async function getProductBySlug(slug: string): Promise<StoreApiProduct | null> {
  try {
    const res = await fetch(
      `${WORDPRESS_URL}/wp-json/wc/store/v1/products?slug=${slug}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
    }

    if (FALLBACK_PRODUCTS[slug]) {
      return FALLBACK_PRODUCTS[slug];
    }

    return null;
  } catch (error) {
    console.error(`Error fetching product slug ${slug}:`, error);
    return FALLBACK_PRODUCTS[slug] || null;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | Épure Atelier" };
  }

  return {
    title: `${product.name} | Épure Atelier`,
    description: product.short_description?.replace(/<[^>]+>/g, "").slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

