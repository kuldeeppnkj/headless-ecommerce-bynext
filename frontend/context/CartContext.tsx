"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { StoreApiCart, StoreApiCartItem } from "@/types/commerce";
import { WORDPRESS_URL } from "@/lib/api";

export interface OptimisticProductDetails {
  name?: string;
  price?: string | number;
  image?: string;
}

interface CartContextType {
  cart: StoreApiCart | null;
  itemCount: number;
  loading: boolean;
  error: string | null;
  addToCart: (
    productId: number,
    quantity?: number,
    variationId?: number,
    details?: OptimisticProductDetails
  ) => Promise<boolean>;
  updateQuantity: (key: string, quantity: number) => Promise<boolean>;
  removeItem: (key: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  itemCount: 0,
  loading: false,
  error: null,
  addToCart: async () => false,
  updateQuantity: async () => false,
  removeItem: async () => false,
  refreshCart: async () => {},
  clearCart: async () => {},
});

// In-memory token storage for Store API
let memoryCartToken = "";
let memoryNonce = "";
let tokenAcquisitionPromise: Promise<{ cartToken: string; nonce: string }> | null = null;

function getTokens(): { cartToken: string; nonce: string } {
  if (typeof window !== "undefined") {
    if (!memoryCartToken) {
      memoryCartToken = localStorage.getItem("wc_store_cart_token") || "";
    }
    if (!memoryNonce) {
      memoryNonce = localStorage.getItem("wc_store_nonce") || "";
    }
  }
  return { cartToken: memoryCartToken, nonce: memoryNonce };
}

function saveTokens(cartToken?: string | null, nonce?: string | null) {
  if (cartToken) {
    memoryCartToken = cartToken;
    if (typeof window !== "undefined") {
      localStorage.setItem("wc_store_cart_token", cartToken);
    }
  }
  if (nonce) {
    memoryNonce = nonce;
    if (typeof window !== "undefined") {
      localStorage.setItem("wc_store_nonce", nonce);
    }
  }
}

// Ensure valid Nonce is present before executing write operations
async function ensureTokens(): Promise<{ cartToken: string; nonce: string }> {
  let tokens = getTokens();
  if (tokens.nonce) {
    return tokens;
  }

  if (!tokenAcquisitionPromise) {
    tokenAcquisitionPromise = (async () => {
      try {
        const res = await fetch(`${WORDPRESS_URL}/wp-json/wc/store/v1/cart`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const tokenHeader =
          res.headers.get("Cart-Token") || res.headers.get("cart-token");
        const nonceHeader =
          res.headers.get("Nonce") ||
          res.headers.get("nonce") ||
          res.headers.get("X-WC-Store-API-Nonce");
        saveTokens(tokenHeader, nonceHeader);
        return getTokens();
      } catch (e) {
        console.warn("Failed to acquire initial cart nonce", e);
        return getTokens();
      } finally {
        tokenAcquisitionPromise = null;
      }
    })();
  }

  return tokenAcquisitionPromise;
}

// Safely execute Store API write calls with automatic Nonce handling and 401 retry
async function postToStoreApi(
  endpoint: string,
  body: Record<string, any>
): Promise<StoreApiCart | null> {
  try {
    let tokens = await ensureTokens();

    const buildHeaders = (t: { cartToken: string; nonce: string }) => {
      const h: Record<string, string> = { "Content-Type": "application/json" };
      if (t.cartToken) h["Cart-Token"] = t.cartToken;
      if (t.nonce) h["Nonce"] = t.nonce;
      return h;
    };

    let res = await fetch(
      `${WORDPRESS_URL}/wp-json/wc/store/v1/cart/${endpoint}`,
      {
        method: "POST",
        headers: buildHeaders(tokens),
        body: JSON.stringify(body),
      }
    );

    saveTokens(
      res.headers.get("Cart-Token") || res.headers.get("cart-token"),
      res.headers.get("Nonce") ||
        res.headers.get("nonce") ||
        res.headers.get("X-WC-Store-API-Nonce")
    );

    // If 401 (e.g. stale nonce), re-acquire fresh tokens and retry once
    if (res.status === 401) {
      memoryNonce = "";
      if (typeof window !== "undefined") {
        localStorage.removeItem("wc_store_nonce");
      }
      tokens = await ensureTokens();

      res = await fetch(
        `${WORDPRESS_URL}/wp-json/wc/store/v1/cart/${endpoint}`,
        {
          method: "POST",
          headers: buildHeaders(tokens),
          body: JSON.stringify(body),
        }
      );

      saveTokens(
        res.headers.get("Cart-Token") || res.headers.get("cart-token"),
        res.headers.get("Nonce") ||
          res.headers.get("nonce") ||
          res.headers.get("X-WC-Store-API-Nonce")
      );
    }

    if (res.ok) {
      return await res.json();
    }

    console.warn(`Store API ${endpoint} response code: ${res.status}`);
    return null;
  } catch (err) {
    console.warn(`Store API ${endpoint} network error:`, err);
    return null;
  }
}

function getCachedCart(): StoreApiCart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("wc_cached_cart");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to read cached cart:", e);
  }
  return null;
}

function setCachedCart(cart: StoreApiCart | null) {
  if (typeof window === "undefined") return;
  try {
    if (cart) {
      localStorage.setItem("wc_cached_cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("wc_cached_cart");
    }
  } catch (e) {
    console.warn("Failed to write cached cart:", e);
  }
}

function createEmptyCart(): StoreApiCart {
  return {
    items: [],
    items_count: 0,
    needs_shipping: true,
    totals: {
      total_items: "0",
      total_discount: "0",
      total_shipping: "0",
      total_price: "0",
      total_tax: "0",
      currency_code: "USD",
      currency_symbol: "$",
      currency_minor_unit: 2,
    },
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize immediately from localStorage cache for 0ms initial render
  const [cart, setCart] = useState<StoreApiCart | null>(() => getCachedCart());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timers for rapid +/- quantity clicks
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Helper to extract tokens from response headers
  const handleHeaders = useCallback((res: Response) => {
    const tokenHeader =
      res.headers.get("Cart-Token") || res.headers.get("cart-token");
    const nonceHeader =
      res.headers.get("Nonce") ||
      res.headers.get("nonce") ||
      res.headers.get("X-WC-Store-API-Nonce");

    saveTokens(tokenHeader, nonceHeader);
  }, []);

  // Fetch the current cart session silently in background
  const refreshCart = useCallback(async () => {
    try {
      setError(null);

      const { cartToken, nonce } = getTokens();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (cartToken) headers["Cart-Token"] = cartToken;
      if (nonce) headers["Nonce"] = nonce;

      const res = await fetch(`${WORDPRESS_URL}/wp-json/wc/store/v1/cart`, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      handleHeaders(res);

      if (res.ok) {
        const data: StoreApiCart = await res.json();
        setCart(data);
        setCachedCart(data);
      }
    } catch (err: any) {
      console.warn("Error refreshing cart:", err);
    } finally {
      setLoading(false);
    }
  }, [handleHeaders]);

  // Clear cart completely after order placement
  const clearCart = useCallback(async () => {
    try {
      const empty = createEmptyCart();
      setCart(empty);
      setCachedCart(empty);

      if (typeof window !== "undefined") {
        localStorage.removeItem("wc_cached_cart");
        localStorage.removeItem("wc_store_cart_token");
        localStorage.removeItem("wc_store_nonce");
      }
      memoryCartToken = "";
      memoryNonce = "";

      // Acquire fresh clean tokens for the next session
      ensureTokens();
    } catch (e) {
      console.warn("Error clearing cart:", e);
    }
  }, []);

  // Initial silent cart validation on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Add Item to Store API Cart with Instant Optimistic UI
  const addToCart = async (
    productId: number,
    quantity = 1,
    variationId?: number,
    details?: OptimisticProductDetails
  ): Promise<boolean> => {
    setError(null);

    // 1. Instant Optimistic State Update (0ms latency)
    setCart((prevCart) => {
      const nextCart = prevCart
        ? {
            ...prevCart,
            items: [...prevCart.items],
            totals: { ...prevCart.totals },
          }
        : createEmptyCart();

      const existingIndex = nextCart.items.findIndex((i) => i.id === productId);

      let priceVal = 0;
      if (details?.price) {
        if (typeof details.price === "number") {
          priceVal = details.price;
        } else {
          const num = parseInt(details.price.replace(/[^0-9]/g, ""), 10);
          priceVal = details.price.includes(".") ? num : num * 100;
        }
      }

      if (existingIndex >= 0) {
        const item = { ...nextCart.items[existingIndex] };
        const oldQty = item.quantity;
        const newQty = oldQty + quantity;
        item.quantity = newQty;

        const unitPrice =
          parseInt(item.prices?.price || String(priceVal), 10) || 0;
        item.totals = {
          ...item.totals,
          line_total: String(unitPrice * newQty),
          line_subtotal: String(unitPrice * newQty),
        };
        nextCart.items[existingIndex] = item;
      } else {
        const unitPrice = priceVal || 0;
        const newItem: StoreApiCartItem = {
          key: `temp-${productId}-${Date.now()}`,
          id: productId,
          quantity,
          name: details?.name || "Product",
          short_description: "",
          sku: "",
          images: details?.image
            ? [
                {
                  id: 0,
                  src: details.image,
                  thumbnail: details.image,
                  name: details?.name || "",
                  alt: details?.name || "",
                },
              ]
            : [],
          prices: {
            price: String(unitPrice),
            regular_price: String(unitPrice),
            sale_price: String(unitPrice),
            currency_code: nextCart.totals?.currency_code || "USD",
            currency_symbol: nextCart.totals?.currency_symbol || "$",
            currency_minor_unit: nextCart.totals?.currency_minor_unit ?? 2,
          },
          totals: {
            line_subtotal: String(unitPrice * quantity),
            line_total: String(unitPrice * quantity),
            currency_code: nextCart.totals?.currency_code || "USD",
            currency_symbol: nextCart.totals?.currency_symbol || "$",
            currency_minor_unit: nextCart.totals?.currency_minor_unit ?? 2,
          },
        };
        nextCart.items.push(newItem);
      }

      nextCart.items_count = (nextCart.items_count || 0) + quantity;
      const currentTotal = parseInt(nextCart.totals.total_price || "0", 10);
      const addedTotal = priceVal ? priceVal * quantity : 0;
      nextCart.totals.total_price = String(currentTotal + addedTotal);
      nextCart.totals.total_items = String(
        parseInt(nextCart.totals.total_items || "0", 10) + addedTotal
      );

      setCachedCart(nextCart);
      return nextCart;
    });

    // 2. Background Safe Server Sync
    const payload: Record<string, any> = {
      id: productId,
      quantity,
    };
    if (variationId) {
      payload.variation = [{ id: variationId }];
    }

    // Execute in background without blocking UI
    postToStoreApi("add-item", payload).then((serverCart) => {
      if (serverCart) {
        setCart(serverCart);
        setCachedCart(serverCart);
      } else {
        refreshCart();
      }
    });

    return true;
  };

  // Update item quantity in Cart with Instant Optimistic UI + Debounced Server Call
  const updateQuantity = async (
    key: string,
    quantity: number
  ): Promise<boolean> => {
    setError(null);

    // 1. Instant Optimistic State Update (0ms latency)
    setCart((prevCart) => {
      if (!prevCart) return null;
      const nextCart = {
        ...prevCart,
        items: [...prevCart.items],
        totals: { ...prevCart.totals },
      };

      const itemIndex = nextCart.items.findIndex((i) => i.key === key);
      if (itemIndex === -1) return prevCart;

      const item = { ...nextCart.items[itemIndex] };
      const oldQty = item.quantity;

      if (quantity <= 0) {
        // Optimistic item removal
        nextCart.items.splice(itemIndex, 1);
        nextCart.items_count = Math.max(0, (nextCart.items_count || 0) - oldQty);
        const lineTotal = parseInt(item.totals?.line_total || "0", 10);
        nextCart.totals.total_price = String(
          Math.max(0, parseInt(nextCart.totals.total_price || "0", 10) - lineTotal)
        );
        nextCart.totals.total_items = String(
          Math.max(0, parseInt(nextCart.totals.total_items || "0", 10) - lineTotal)
        );
      } else {
        const diffQty = quantity - oldQty;
        item.quantity = quantity;
        const unitPrice = parseInt(item.prices?.price || "0", 10);
        const oldLineTotal = parseInt(item.totals?.line_total || "0", 10);
        const newLineTotal = unitPrice * quantity;
        const diffPrice = newLineTotal - oldLineTotal;

        item.totals = {
          ...item.totals,
          line_total: String(newLineTotal),
          line_subtotal: String(newLineTotal),
        };
        nextCart.items[itemIndex] = item;
        nextCart.items_count = Math.max(0, (nextCart.items_count || 0) + diffQty);
        nextCart.totals.total_price = String(
          Math.max(0, parseInt(nextCart.totals.total_price || "0", 10) + diffPrice)
        );
        nextCart.totals.total_items = String(
          Math.max(0, parseInt(nextCart.totals.total_items || "0", 10) + diffPrice)
        );
      }

      setCachedCart(nextCart);
      return nextCart;
    });

    // 2. Debounce Server Call (300ms window) so rapid clicks (e.g. 1 -> 2 -> 3)
    // send only ONE consolidated network request to WooCommerce
    if (debounceTimersRef.current[key]) {
      clearTimeout(debounceTimersRef.current[key]);
    }

    debounceTimersRef.current[key] = setTimeout(() => {
      delete debounceTimersRef.current[key];

      const endpoint = quantity <= 0 ? "remove-item" : "update-item";
      const body = quantity <= 0 ? { key } : { key, quantity };

      postToStoreApi(endpoint, body).then((serverCart) => {
        if (serverCart) {
          setCart(serverCart);
          setCachedCart(serverCart);
        } else {
          refreshCart();
        }
      });
    }, 300);

    return true;
  };

  // Remove item from Cart with Instant Optimistic UI
  const removeItem = async (key: string): Promise<boolean> => {
    setError(null);

    // Cancel any pending debounced updates for this key
    if (debounceTimersRef.current[key]) {
      clearTimeout(debounceTimersRef.current[key]);
      delete debounceTimersRef.current[key];
    }

    // 1. Instant Optimistic State Update (0ms latency)
    setCart((prevCart) => {
      if (!prevCart) return null;
      const removedItem = prevCart.items.find((i) => i.key === key);
      const nextCart = {
        ...prevCart,
        items: prevCart.items.filter((i) => i.key !== key),
        totals: { ...prevCart.totals },
      };

      if (removedItem) {
        const lineTotal = parseInt(removedItem.totals?.line_total || "0", 10);
        nextCart.items_count = Math.max(
          0,
          (nextCart.items_count || 0) - removedItem.quantity
        );
        nextCart.totals.total_price = String(
          Math.max(
            0,
            parseInt(nextCart.totals.total_price || "0", 10) - lineTotal
          )
        );
        nextCart.totals.total_items = String(
          Math.max(
            0,
            parseInt(nextCart.totals.total_items || "0", 10) - lineTotal
          )
        );
      }

      setCachedCart(nextCart);
      return nextCart;
    });

    // 2. Background Safe Server Sync
    postToStoreApi("remove-item", { key }).then((serverCart) => {
      if (serverCart) {
        setCart(serverCart);
        setCachedCart(serverCart);
      } else {
        refreshCart();
      }
    });

    return true;
  };

  const itemCount = cart?.items_count ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
