"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { loadStripe, Stripe, StripeCardElement } from "@stripe/stripe-js";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/types/commerce";
import {
  WORDPRESS_URL,
  getPaymentGateways,
  PaymentGateway,
} from "@/lib/api";

// Singleton cache for Stripe instances to prevent multiple instances
const stripePromiseCache: Record<string, Promise<Stripe | null>> = {};
function getStripeInstance(publishableKey: string) {
  if (!stripePromiseCache[publishableKey]) {
    stripePromiseCache[publishableKey] = loadStripe(publishableKey);
  }
  return stripePromiseCache[publishableKey];
}

interface StripeCardRef {
  card: StripeCardElement;
  stripe: Stripe;
}

/**
 * Dedicated Stripe Card Element component
 */
function StripeCardField({
  stripe,
  onReady,
  onChange,
}: {
  stripe: Stripe | null;
  onReady: (ref: StripeCardRef | null) => void;
  onChange: (complete: boolean, error: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onReadyRef.current = onReady;
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!stripe || !containerRef.current) return;

    containerRef.current.innerHTML = "";

    const elements = stripe.elements();
    const card = elements.create("card", {
      hidePostalCode: true,
      style: {
        base: {
          color: "#1b1c19",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
          fontSize: "15px",
          lineHeight: "24px",
          "::placeholder": {
            color: "#8A817C",
          },
          iconColor: "#7c5549",
        },
        invalid: {
          color: "#dc2626",
          iconColor: "#dc2626",
        },
      },
    });

    card.mount(containerRef.current);

    card.on("change", (e) => {
      onChangeRef.current(e.complete, e.error ? e.error.message : null);
    });

    onReadyRef.current({ card, stripe });

    return () => {
      try {
        card.destroy();
      } catch (e) {
        // cleanup safe
      }
      onReadyRef.current(null);
    };
  }, [stripe]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-3 min-h-[46px] transition-all focus-within:border-[#463F3A] focus-within:ring-1 focus-within:ring-[#463F3A]"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, refreshCart, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic Payment Gateways State
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<string>("stripe");

  // Stripe.js State
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeCard, setStripeCard] = useState<StripeCardRef | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("NY");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("US");

  // Populate from authenticated user if available
  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      if (user.first_name) setFirstName(user.first_name);
      if (user.last_name) setLastName(user.last_name);
    }
  }, [user]);

  // Fetch dynamic payment gateways
  useEffect(() => {
    const fetchGateways = async () => {
      try {
        setGatewaysLoading(true);
        const rawData = await getPaymentGateways();
        const data = Array.isArray(rawData) ? rawData : (rawData as any)?.data || [];

        if (Array.isArray(data) && data.length > 0) {
          setGateways(data);

          // Select stripe if available by default, else first available
          const hasStripe = data.some((g) => g.id === "stripe");
          const defaultMethod = hasStripe ? "stripe" : data[0].id;
          setSelectedPayment(defaultMethod);

          // If Stripe is active and has publishable key, load Stripe SDK
          const stripeGateway = data.find((g) => g.id === "stripe");
          if (stripeGateway?.stripe_params?.publishable_key) {
            setStripeLoading(true);
            try {
              const stripe = await getStripeInstance(
                stripeGateway.stripe_params.publishable_key
              );
              setStripeInstance(stripe);
            } catch (sErr) {
              console.error("Failed to load Stripe.js:", sErr);
            } finally {
              setStripeLoading(false);
            }
          }
        } else {
          // Fallback to COD if API unavailable
          setGateways([
            {
              id: "cod",
              title: "Cash on delivery",
              description:
                "Settle payment directly with our private courier upon bespoke white-glove inspection.",
            },
          ]);
          setSelectedPayment("cod");
        }
      } catch (err) {
        console.warn("Could not fetch payment gateways:", err);
      } finally {
        setGatewaysLoading(false);
      }
    };

    fetchGateways();
  }, []);

  const items = cart?.items || [];
  const totalFormatted = formatPrice(
    cart?.totals?.total_price,
    cart?.totals?.currency_symbol || "$",
    cart?.totals?.currency_minor_unit || 2
  );
  const subtotalFormatted = formatPrice(
    cart?.totals?.total_items,
    cart?.totals?.currency_symbol || "$",
    cart?.totals?.currency_minor_unit || 2
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setProcessingStage(
      selectedPayment === "stripe"
        ? "Securing credentials with Stripe..."
        : "Preparing order..."
    );

    try {
      // 1. Basic validation
      if (
        !firstName ||
        !lastName ||
        !address1 ||
        !city ||
        !state ||
        !postcode ||
        !country ||
        !email ||
        !phone
      ) {
        throw new Error(
          "Please fill in all required shipping and contact fields marked with *."
        );
      }

      let paymentData: Array<{ key: string; value: string }> = [];

      // 2. Process Stripe Payment Method if Stripe is selected
      if (selectedPayment === "stripe") {
        if (!stripeCard) {
          throw new Error(
            "Stripe payment gateway is still initializing. Please wait a moment and try again."
          );
        }

        if (!cardComplete) {
          throw new Error(
            "Please provide complete card details (Card Number, Expiry, and CVC)."
          );
        }

        setProcessingStage("Authorizing payment method with Stripe...");

        // Create PaymentMethod token securely with the exact Stripe instance that created the Card element
        const { paymentMethod, error: stripeErr } =
          await stripeCard.stripe.createPaymentMethod({
            type: "card",
            card: stripeCard.card,
            billing_details: {
              name: `${firstName} ${lastName}`.trim(),
              email: email,
              phone: phone,
              address: {
                line1: address1,
                line2: address2 || undefined,
                city: city,
                state: state,
                postal_code: postcode,
                country: country,
              },
            },
          });

        if (stripeErr || !paymentMethod) {
          throw new Error(
            stripeErr?.message ||
              "Could not verify your card. Please check the details and try again."
          );
        }

        // Pass payment method token and type to WooCommerce Store API
        paymentData = [
          {
            key: "payment_method",
            value: "stripe",
          },
          {
            key: "wc_stripe_selected_upe_payment_type",
            value: "card",
          },
          {
            key: "wc-stripe-payment-method",
            value: paymentMethod.id,
          },
        ];
      }

      setProcessingStage("Securing order with Atelier Store API...");

      // 3. Retrieve Session Tokens
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("wc_store_cart_token") || ""
          : "";
      const nonce =
        typeof window !== "undefined"
          ? localStorage.getItem("wc_store_nonce") || ""
          : "";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Cart-Token"] = token;
      if (nonce) headers["Nonce"] = nonce;

      const orderPayload = {
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          address_1: address1,
          address_2: address2,
          city,
          state,
          postcode,
          country,
          email,
          phone,
        },
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address_1: address1,
          address_2: address2,
          city,
          state,
          postcode,
          country,
        },
        payment_method: selectedPayment,
        payment_data: paymentData,
      };

      const res = await fetch(`${WORDPRESS_URL}/wp-json/wc/store/v1/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to process order.");
      }

      // 4. Handle 3D Secure / SCA confirmation if required
      if (selectedPayment === "stripe" && stripeCard) {
        const details = data.payment_result?.payment_details || [];
        const piSecretItem = Array.isArray(details)
          ? details.find(
              (d: any) =>
                d.key === "payment_intent_secret" || d.key === "client_secret"
            )
          : null;

        if (piSecretItem?.value) {
          setProcessingStage("Completing 3D Secure verification...");
          const { error: scaErr } = await stripeCard.stripe.confirmCardPayment(
            piSecretItem.value
          );
          if (scaErr) {
            throw new Error(
              scaErr.message ||
                "3D Secure authentication was not completed. Please try again."
            );
          }
        }
      }

      // 5. Handle external payment redirects if any gateway specifies a redirect URL
      if (
        selectedPayment !== "stripe" &&
        selectedPayment !== "cod" &&
        data.payment_result?.redirect_url
      ) {
        window.location.href = data.payment_result.redirect_url;
        return;
      }

      setProcessingStage("Order placed! Finalizing receipt...");

      // Clear the cart completely from state, localStorage, and Store API session
      await clearCart();
      setOrderComplete(data);
    } catch (err: any) {
      console.error("Order submission error:", err);
      setErrorMsg(
        err?.message ||
          "Could not process your order. Please verify that all required fields are filled."
      );
    } finally {
      setLoading(false);
      setProcessingStage("");
    }
  };

  // SUCCESS SCREEN
  if (orderComplete) {
    const orderId =
      orderComplete.order_id ||
      orderComplete.id ||
      "OUR-" + Math.floor(10000 + Math.random() * 90000);
    const activeGateway = gateways.find((g) => g.id === selectedPayment);
    const paymentProtocolTitle =
      selectedPayment === "stripe"
        ? "Credit / Debit Card (Stripe Secured)"
        : selectedPayment === "cod"
        ? "Cash on Delivery (Concierge Inspection)"
        : activeGateway?.title || selectedPayment;

    return (
      <div className="w-full min-h-screen bg-[#faf9f4] py-16 px-6 md:px-12 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-[#F4F3EE] rounded-[20px] border border-[#BCB8B1] p-8 sm:p-12 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-accent/20 text-[#654136] flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <span className="text-xs uppercase tracking-widest text-accent font-semibold block mb-2">
            Order Confirmed &bull; Atelier Monograph
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#463F3A] mb-3">
            Thank You for Your Order
          </h1>
          <p className="text-sm text-[#8A817C] mb-8 leading-relaxed max-w-lg mx-auto">
            Your piece has been reserved with reference{" "}
            <strong className="text-[#463F3A]">#{orderId}</strong>. A formal
            confirmation and tracking dispatch have been sent to{" "}
            <strong className="text-[#463F3A]">{email}</strong>.
          </p>

          <div className="bg-white/80 rounded-xl p-5 border border-[#BCB8B1]/40 mb-8 text-left text-xs space-y-2 text-[#514440]">
            <div className="flex justify-between font-semibold text-[#1b1c19] text-sm pb-2 border-b border-[#BCB8B1]/30">
              <span>Payment Protocol</span>
              <span className="uppercase text-accent font-bold">
                {paymentProtocolTitle}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Destination</span>
              <span>
                {address1}, {city}, {state} {postcode}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Recipient</span>
              <span>
                {firstName} {lastName} ({phone})
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#463F3A] text-[#F4F3EE] text-xs uppercase tracking-wider font-semibold hover:bg-accent hover:text-[#463F3A] transition-colors"
            >
              Continue Exploring
            </Link>
            <Link
              href="/profile"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[#BCB8B1] text-[#463F3A] text-xs uppercase tracking-wider font-semibold hover:border-accent transition-colors"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // HYDRATION GUARD: Prevent server/client markup mismatch for client-only cart state
  if (!mounted) {
    return (
      <div className="w-full min-h-screen bg-[#faf9f4] py-20 px-6 text-center max-w-xl mx-auto flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#463F3A] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest text-[#8A817C] font-semibold">
          Initializing Checkout...
        </span>
      </div>
    );
  }

  // EMPTY CART CHECKOUT WARNING
  if (items.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#faf9f4] py-20 px-6 text-center max-w-xl mx-auto flex flex-col items-center justify-center">
        <h2 className="font-serif text-3xl text-[#463F3A] mb-3">
          No Items to Check Out
        </h2>
        <p className="text-sm text-[#8A817C] mb-8">
          Please add items to your shopping bag before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="px-8 py-3.5 rounded-full bg-accent text-[#654136] text-xs uppercase tracking-wider font-bold shadow-sm"
        >
          Browse Collection →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#faf9f4] py-8 md:py-12">
      {/* Full-Screen Luxury Order Processing Modal */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b1c19]/75 backdrop-blur-md">
          <div className="bg-[#FAF9F4] border border-[#BCB8B1] rounded-2xl max-w-md w-full p-8 shadow-2xl text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-2 border-[#BCB8B1]/40 border-t-accent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[#463F3A]">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-accent font-bold block">
                Secure SSL Transaction
              </span>
              <h3 className="font-serif text-2xl text-[#463F3A]">
                Securing Your Order
              </h3>
              <p className="text-xs text-[#8A817C] leading-relaxed min-h-[38px] flex items-center justify-center font-medium">
                {processingStage || "Securing your transaction with payment gateway..."}
              </p>
            </div>

            <div className="pt-3 border-t border-[#BCB8B1]/40 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-[#8A817C]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>PCI-DSS Encrypted &bull; Please do not refresh</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb + Title */}
        <section className="mb-8">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8A817C] mb-4">
            <Link href="/" className="hover:text-[#463F3A]">
              Home
            </Link>
            <span className="text-[#BCB8B1]">›</span>
            <Link href="/cart" className="hover:text-[#463F3A]">
              Cart
            </Link>
            <span className="text-[#BCB8B1]">›</span>
            <span className="text-[#463F3A] font-semibold">Checkout</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#BCB8B1]">
            <h1 className="text-3xl md:text-5xl font-light tracking-[0.18em] text-[#463F3A] uppercase">
              Checkout
            </h1>
            <span className="text-xs uppercase tracking-wider text-[#8A817C]">
              Atelier Store API Protocol
            </span>
          </div>
        </section>

        {/* Step Indicator */}
        <section aria-label="Checkout Progress" className="mb-10 max-w-xl mx-auto">
          <div className="flex items-center justify-between relative px-2">
            <div className="flex items-center gap-2 z-10 bg-[#faf9f4] pr-3">
              <span className="w-7 h-7 rounded-full bg-accent text-[#654136] text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-[#463F3A]">
                Details
              </span>
            </div>
            <div className="flex-1 h-[1px] bg-[#BCB8B1] -mx-2" />
            <div className="flex items-center gap-2 z-10 bg-[#faf9f4] px-3">
              <span className="w-7 h-7 rounded-full bg-accent text-[#654136] text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-[#463F3A]">
                Dispatch
              </span>
            </div>
            <div className="flex-1 h-[1px] bg-[#BCB8B1] -mx-2" />
            <div className="flex items-center gap-2 z-10 bg-[#faf9f4] pl-3">
              <span className="w-7 h-7 rounded-full bg-accent text-[#654136] text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-[#463F3A]">
                Payment
              </span>
            </div>
          </div>
        </section>

        {/* Error Notification */}
        {errorMsg && (
          <div className="max-w-7xl mx-auto mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Main Form + Summary Split */}
        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16"
        >
          {/* Left Column (7 cols): Input Forms */}
          <div className="lg:col-span-7 space-y-8">
            {/* A. Contact Information */}
            <div className="bg-[#F4F3EE] border border-[#BCB8B1] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-[#463F3A]">
                  1. Contact Information
                </h2>
                {!user && (
                  <Link
                    href="/auth"
                    className="text-xs text-[#8A817C] underline hover:text-[#463F3A]"
                  >
                    Have an account? Log in
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexandra@domain.com"
                    className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-3 text-sm text-[#463F3A] placeholder-[#8A817C] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-3 text-sm text-[#463F3A] placeholder-[#8A817C] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* B. Shipping Address */}
            <div className="bg-[#F4F3EE] border border-[#BCB8B1] rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold tracking-tight text-[#463F3A]">
                2. Shipping Address
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alexandra"
                      className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Vance"
                      className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    placeholder="84 Crosby Street"
                    className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                    Apartment, Suite, etc. (Optional)
                  </label>
                  <input
                    type="text"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    placeholder="Loft 4B"
                    className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="NY"
                      className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="10012"
                      className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                    Country / Territory *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] outline-none cursor-pointer"
                  >
                    <option value="US">United States</option>
                    <option value="FR">France</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="IT">Italy</option>
                    <option value="JP">Japan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* C. Payment Method (Dynamic Gateways: Stripe, COD, etc.) */}
            <div className="bg-[#F4F3EE] border border-[#BCB8B1] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-[#463F3A]">
                  3. Payment Method
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-[#8A817C]">
                  {gateways.length} Gateway{gateways.length === 1 ? "" : "s"}{" "}
                  Available
                </span>
              </div>

              {gatewaysLoading ? (
                <div className="p-6 rounded-xl border border-[#BCB8B1]/40 bg-white/50 text-center text-xs text-[#8A817C] flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-[#463F3A] border-t-transparent rounded-full animate-spin"></span>
                  Loading payment options...
                </div>
              ) : (
                <div className="space-y-4">
                  {gateways.map((gw) => {
                    const isSelected = selectedPayment === gw.id;

                    return (
                      <div
                        key={gw.id}
                        onClick={() => setSelectedPayment(gw.id)}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#463F3A] bg-white shadow-sm ring-1 ring-[#463F3A]"
                            : "border-[#BCB8B1]/60 bg-[#faf9f4]/60 hover:border-[#BCB8B1] hover:bg-white/40"
                        }`}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <input
                            type="radio"
                            name="payment_gateway"
                            value={gw.id}
                            checked={isSelected}
                            onChange={() => setSelectedPayment(gw.id)}
                            className="mt-1 text-[#463F3A] accent-[#463F3A] cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs uppercase tracking-wider font-bold text-[#1b1c19]">
                                {gw.id === "stripe"
                                  ? "Credit / Debit Card (Stripe)"
                                  : gw.id === "cod"
                                  ? "Cash on Delivery (COD)"
                                  : gw.title}
                              </span>

                              {/* Card Brand Badges for Stripe */}
                              {gw.id === "stripe" && (
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-[#faf9f4] border border-[#BCB8B1]/60 text-[#1b1c19]">
                                    VISA
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-[#faf9f4] border border-[#BCB8B1]/60 text-[#1b1c19]">
                                    MC
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-[#faf9f4] border border-[#BCB8B1]/60 text-[#1b1c19]">
                                    AMEX
                                  </span>
                                </div>
                              )}

                              {gw.id === "cod" && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider bg-accent/20 text-[#654136]">
                                  CONCIERGE
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#8A817C] mt-1 leading-relaxed">
                              {gw.id === "stripe"
                                ? "Pay instantly with Visa, Mastercard, American Express, or debit card."
                                : gw.id === "cod"
                                ? "Settle payment directly with our private courier upon bespoke white-glove inspection."
                                : gw.description || "Complete payment securely."}
                            </p>

                            {/* Stripe Card Element Input Box */}
                            {gw.id === "stripe" && (
                              <div
                                className={
                                  isSelected
                                    ? "mt-4 pt-4 border-t border-[#BCB8B1]/40 space-y-3"
                                    : "hidden"
                                }
                                onClick={(e) => e.stopPropagation()}
                              >
                                {stripeLoading ? (
                                  <div className="flex items-center gap-2 text-xs text-[#8A817C] py-2">
                                    <span className="w-3 h-3 border-2 border-[#7c5549] border-t-transparent rounded-full animate-spin"></span>
                                    Loading secure Stripe payment interface...
                                  </div>
                                ) : stripeInstance ? (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold">
                                        Card Details *
                                      </label>
                                      <span className="text-[10px] text-emerald-800 font-medium uppercase tracking-wider flex items-center gap-1">
                                        <svg
                                          className="w-3 h-3 text-emerald-700"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        256-Bit SSL Encrypted
                                      </span>
                                    </div>

                                    <StripeCardField
                                      stripe={stripeInstance}
                                      onReady={(ref) => setStripeCard(ref)}
                                      onChange={(complete, err) => {
                                        setCardComplete(complete);
                                        setCardError(err);
                                      }}
                                    />

                                    {cardError && (
                                      <p className="text-xs text-red-600 font-medium mt-1">
                                        {cardError}
                                      </p>
                                    )}

                                    {gw.stripe_params?.testmode && (
                                      <div className="text-[11px] text-[#514440] bg-[#faf9f4] border border-[#d5c3be]/80 rounded-xl p-3 flex items-start gap-2.5">
                                        <span className="font-bold text-[#654136] uppercase text-[9px] tracking-wider px-1.5 py-0.5 bg-accent/25 rounded flex-shrink-0">
                                          Sandbox Mode
                                        </span>
                                        <span className="leading-snug">
                                          Test transactions are active. Use card{" "}
                                          <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#BCB8B1]/40 text-[#1b1c19] font-bold">
                                            4242 4242 4242 4242
                                          </code>{" "}
                                          with any future expiry and any 3-digit CVC.
                                        </span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-xs text-red-600">
                                    Stripe publishable key is not active in
                                    WooCommerce settings.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Order Review */}
          <div className="lg:col-span-5 bg-[#F4F3EE] rounded-2xl border border-[#BCB8B1] p-6 sm:p-8 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-bold text-[#463F3A] mb-6">
              Order Review ({items.length}{" "}
              {items.length === 1 ? "Item" : "Items"})
            </h2>

            {/* Mini Items List */}
            <div className="divide-y divide-[#BCB8B1]/40 max-h-80 overflow-y-auto mb-6 pr-1">
              {items.map((item) => {
                const img = item.images?.[0]?.src || "";
                return (
                  <div key={item.key} className="py-3 flex items-center gap-3">
                    {img && (
                      <div className="w-14 h-14 rounded-lg bg-[#efeee9] overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#1b1c19] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#8A817C]">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#1b1c19]">
                      {formatPrice(
                        item.totals?.line_total,
                        item.totals?.currency_symbol,
                        item.totals?.currency_minor_unit
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 pt-4 border-t border-[#BCB8B1] text-xs uppercase tracking-wider">
              <div className="flex justify-between text-[#8A817C]">
                <span>Subtotal</span>
                <span className="text-[#463F3A] font-bold">
                  {subtotalFormatted}
                </span>
              </div>
              <div className="flex justify-between text-[#8A817C]">
                <span>Carbon-Neutral Dispatch</span>
                <span className="text-accent font-bold">Complimentary</span>
              </div>
              <div className="flex justify-between text-[#463F3A] font-bold text-sm pt-2 border-t border-[#BCB8B1]">
                <span>Total Due</span>
                <span>{totalFormatted}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-accent text-[#654136] text-xs uppercase tracking-widest font-bold shadow-md hover:bg-[#edbbac] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#654136] border-t-transparent rounded-full animate-spin" />
                    <span>{processingStage || "Authorizing Order..."}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedPayment === "stripe"
                        ? "Authorize & Place Order"
                        : selectedPayment === "cod"
                        ? "Place Cash on Delivery Order"
                        : "Place Order"}
                    </span>
                    <span className="opacity-60">&bull;</span>
                    <span>{totalFormatted}</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-center text-[#8A817C] uppercase tracking-widest mt-4">
              Protected by Store API &amp; PCI-DSS 256-Bit Encryption
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
