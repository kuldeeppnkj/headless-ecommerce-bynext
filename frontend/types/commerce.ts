/**
 * TypeScript Interfaces for WooCommerce Store API
 */

export interface StoreApiPrice {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
}

export interface StoreApiImage {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
}

export interface StoreApiProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface StoreApiProductAttributeTerm {
  id: number;
  name: string;
  slug: string;
}

export interface StoreApiProductAttribute {
  id: number;
  name: string;
  taxonomy: string | null;
  has_variations: boolean;
  terms: StoreApiProductAttributeTerm[];
}

export interface StoreApiProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  sku: string;
  description: string;
  short_description: string;
  type: string;
  on_sale: boolean;
  prices: StoreApiPrice;
  price_html?: string;
  images: StoreApiImage[];
  categories: StoreApiProductCategory[];
  attributes?: StoreApiProductAttribute[];
  is_in_stock: boolean;
  add_to_cart?: {
    text: string;
    description: string;
    minimum: number;
    maximum: number;
  };
}

export interface StoreApiCartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  sku: string;
  images: StoreApiImage[];
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
  totals: {
    line_subtotal: string;
    line_total: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
  variation?: Array<{ attribute: string; value: string }>;
}

export interface StoreApiCartTotals {
  total_items: string;
  total_discount: string;
  total_shipping: string | null;
  total_price: string;
  total_tax: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
}

export interface StoreApiCart {
  items: StoreApiCartItem[];
  items_count: number;
  totals: StoreApiCartTotals;
  payment_methods?: string[];
  needs_shipping?: boolean;
}

export function formatPrice(
  rawPrice: string | number | undefined,
  currencySymbol = "$",
  minorUnit = 2
): string {
  if (rawPrice === undefined || rawPrice === null) return `${currencySymbol}0.00`;
  const num = typeof rawPrice === "string" ? parseInt(rawPrice, 10) : rawPrice;
  if (isNaN(num)) return `${currencySymbol}0.00`;
  const formatted = (num / Math.pow(10, minorUnit)).toFixed(minorUnit);
  return `${currencySymbol}${formatted}`;
}

