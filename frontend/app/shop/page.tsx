import type { Metadata } from "next";
import { WORDPRESS_URL } from "@/lib/api";
import type { StoreApiProduct } from "@/types/commerce";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop – Modern | Épure Atelier",
  description:
    "Explore permanent wardrobe staples and seasonal monograph editions from Atelier Épure.",
};

const FALLBACK_PRODUCTS: StoreApiProduct[] = [
  {
    id: 13,
    name: "The Drape Wool Overcoat",
    slug: "the-drape-wool-overcoat",
    permalink: "/product/the-drape-wool-overcoat",
    sku: "DrapeWoolOvercoat",
    short_description:
      "Cut from double-faced virgin wool loomed in Biella, Italy. Engineered with a sculpted drop shoulder.",
    description: "Conceived as an architectural response to the velocity of seasonal fashion.",
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
        name: "Drape Wool Overcoat",
        alt: "Drape Wool Overcoat",
      },
    ],
    categories: [{ id: 1, name: "Outerwear", slug: "outerwear" }],
    is_in_stock: true,
  },
  {
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
  {
    id: 15,
    name: "Silk Georgette Slip Dress",
    slug: "silk-georgette-slip-dress",
    permalink: "/product/silk-georgette-slip-dress",
    sku: "SilkSlipDress",
    short_description: "Mulberry silk slip dress with delicate bias cut.",
    description: "Sensorial luxury in 100% Mulberry silk.",
    type: "simple",
    on_sale: true,
    prices: {
      price: "34000",
      regular_price: "40000",
      sale_price: "34000",
      currency_code: "USD",
      currency_symbol: "$",
      currency_minor_unit: 2,
      currency_prefix: "$",
      currency_suffix: "",
    },
    images: [
      {
        id: 3,
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGkwP86LWIX1vuNKoC2hvCoMySGAHk8hxQkU-wxvdsiwaE7Eg825PwtxcbbvVZ_wEnWerTsDeBRCqQmspQKbwK5zSAZn-Mc6l2-7ljsgvhN7kj0Edqjqz9Q4dlvMT_W6TmSQ1Cdmga8_Oo4oUxPmXSXj0tJepkBZrwQCNZunKcuTrSK1yPFYMJXVl5Pw-op8hhEimJS1EGLQBDwQb0OeMGoOTPkUhJgW8lpOBP81unLCg7Mr_mao_5",
        thumbnail: "",
        name: "Silk Slip Dress",
        alt: "Silk Slip Dress",
      },
    ],
    categories: [{ id: 3, name: "Dresses", slug: "dresses" }],
    is_in_stock: true,
  },
  {
    id: 16,
    name: "Double-Faced Cashmere Robe",
    slug: "double-faced-cashmere-robe",
    permalink: "/product/double-faced-cashmere-robe",
    sku: "CashmereRobe",
    short_description: "Plush Mongolian cashmere robe coat.",
    description: "Exquisite softness and fluid warmth for effortless drape.",
    type: "simple",
    on_sale: false,
    prices: {
      price: "89000",
      regular_price: "89000",
      sale_price: "89000",
      currency_code: "USD",
      currency_symbol: "$",
      currency_minor_unit: 2,
      currency_prefix: "$",
      currency_suffix: "",
    },
    images: [
      {
        id: 4,
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYR3GIpjKUpRUc_cPKxZhAvGzqjQSKfYQTHX_MmewhC_bZ--ypldnXm8RzcFc8fmx4BUpynLIsD7Gw_56vQvN7kH7Jh1-37l_K2BHXA43w1W53f0ErLbEBU_JL261J967avY_qUg2amnPBrYzv8c7Uy3juB-n4fm7ay0WuQKC1h0nnX33xb8DEosArFxDT7yI2PIAfHEaggGcyBMC-RcZ7oraKVGowpVL4y_6B0-S_bbs_gpYRIpvf",
        thumbnail: "",
        name: "Cashmere Robe",
        alt: "Cashmere Robe",
      },
    ],
    categories: [{ id: 1, name: "Outerwear", slug: "outerwear" }],
    is_in_stock: true,
  },
];

async function getProducts(): Promise<StoreApiProduct[]> {
  try {
    const res = await fetch(`${WORDPRESS_URL}/wp-json/wc/store/v1/products?per_page=30`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`Failed to fetch store products: HTTP ${res.status}`);
      return FALLBACK_PRODUCTS;
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return FALLBACK_PRODUCTS;
  } catch (error) {
    console.error("Error fetching WooCommerce store products:", error);
    return FALLBACK_PRODUCTS;
  }
}

export default async function ShopPage() {
  const products = await getProducts();

  return <ShopClient initialProducts={products} />;
}

