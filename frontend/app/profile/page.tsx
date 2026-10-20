"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  subtotal?: string;
  total: string;
}

interface OrderRecord {
  id: number;
  order_number?: string;
  status: string;
  status_label?: string;
  date_created: string;
  total: string;
  currency?: string;
  currency_symbol?: string;
  items?: OrderItem[];
  line_items?: OrderItem[];
}

interface AddressRecord {
  id: string;
  label: string;
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  is_default?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<"details" | "orders" | "addresses">("details");

  // Orders State
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    state: "NY",
    postcode: "",
    country: "US",
    is_default: true,
  });

  // Profile Edit State
  const [displayName, setDisplayName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Redirect if not authenticated once auth check finishes
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || user.username || "");
    }
  }, [user]);

  // Load orders when active tab switches to orders
  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated) {
      setLoadingOrders(true);
      fetch("/api/user/orders")
        .then((res) => res.json())
        .then((data) => {
          let list: OrderRecord[] = [];
          if (data?.success && data?.data) {
            if (Array.isArray(data.data.orders)) {
              list = data.data.orders;
            } else if (Array.isArray(data.data)) {
              list = data.data;
            }
          } else if (Array.isArray(data?.orders)) {
            list = data.orders;
          } else if (Array.isArray(data)) {
            list = data;
          }
          setOrders(list);
        })
        .catch((err) => console.error("Error loading orders:", err))
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab, isAuthenticated]);

  // Load addresses when active tab switches to addresses
  useEffect(() => {
    if (activeTab === "addresses" && isAuthenticated) {
      setLoadingAddresses(true);
      fetch("/api/user/addresses")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setAddresses(data.data);
          } else if (Array.isArray(data)) {
            setAddresses(data);
          }
        })
        .catch((err) => console.error("Error loading addresses:", err))
        .finally(() => setLoadingAddresses(false));
    }
  }, [activeTab, isAuthenticated]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg("Atelier credentials updated successfully.");
        refreshProfile();
      } else {
        setProfileMsg(data.message || "Failed to update profile.");
      }
    } catch {
      setProfileMsg("Network error updating profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Handle Add Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddressForm(false);
        // Refresh addresses list
        const refRes = await fetch("/api/user/addresses");
        const refData = await refRes.json();
        if (refData.success && Array.isArray(refData.data)) {
          setAddresses(refData.data);
        }
      }
    } catch (err) {
      console.error("Error creating address:", err);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#faf9f4] flex items-center justify-center">
        <div className="text-xs uppercase tracking-widest text-[#8A817C] animate-pulse">
          Loading Atelier Account...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-[#faf9f4] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8A817C] mb-6">
          <Link href="/" className="hover:text-[#463F3A]">Home</Link>
          <span className="text-[#BCB8B1]">›</span>
          <span className="text-[#463F3A] font-semibold">My Account</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-light tracking-[0.18em] uppercase text-[#463F3A]">
            MY ACCOUNT
          </h1>
          <p className="text-xs uppercase tracking-wider text-[#8A817C] mt-1.5">
            Personal archives, delivery itineraries, and bespoke privileges.
          </p>
        </div>

        {/* Profile Summary Card matching docs/profile.html */}
        <section className="bg-[#F4F3EE] rounded-2xl border border-[#BCB8B1] p-6 sm:p-7 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 sm:gap-6 min-w-0">
            {/* Monogram Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent text-[#654136] font-serif font-bold text-2xl flex items-center justify-center ring-2 ring-accent ring-offset-2 ring-offset-[#F4F3EE] flex-shrink-0">
              {displayName.charAt(0).toUpperCase() || "A"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#463F3A] truncate">
                  {displayName}
                </h2>
                <span className="bg-accent text-[#654136] text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Tier II Collector
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8A817C] mt-1 truncate">
                {user.email}
              </p>
              <div className="flex items-center gap-3 text-xs text-[#8A817C] mt-1">
                <span>Atelier Member</span>
                <span className="text-[#BCB8B1]">&bull;</span>
                <span className="text-[#463F3A] font-medium">Bespoke Concierge Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className="rounded-full border border-[#463F3A] text-[#463F3A] px-5 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-accent hover:border-accent hover:text-[#463F3A] transition-all"
            >
              Edit Details
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-[#8A817C] hover:text-accent text-xs uppercase tracking-wider font-semibold px-3 py-2 transition-colors flex items-center gap-1.5"
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* Two-Column Tabs Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Sidebar (3 cols) */}
          <aside className="md:col-span-3 w-full">
            <div className="bg-[#F4F3EE] rounded-2xl border border-[#BCB8B1] p-3 sm:p-4 shadow-sm">
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`w-full text-left rounded-xl px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-between whitespace-nowrap ${
                    activeTab === "details"
                      ? "bg-accent text-[#654136] shadow-sm"
                      : "text-[#463F3A] hover:bg-white/60"
                  }`}
                >
                  <span>Atelier Details</span>
                  <span className="opacity-60">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left rounded-xl px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-between whitespace-nowrap ${
                    activeTab === "orders"
                      ? "bg-accent text-[#654136] shadow-sm"
                      : "text-[#463F3A] hover:bg-white/60"
                  }`}
                >
                  <span>Orders Archive</span>
                  <span className="opacity-60">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full text-left rounded-xl px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-between whitespace-nowrap ${
                    activeTab === "addresses"
                      ? "bg-accent text-[#654136] shadow-sm"
                      : "text-[#463F3A] hover:bg-white/60"
                  }`}
                >
                  <span>Saved Addresses</span>
                  <span className="opacity-60">→</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Right Main Content (9 cols) */}
          <main className="md:col-span-9 w-full">
            
            {/* TAB 1: DETAILS */}
            {activeTab === "details" && (
              <div className="bg-[#F4F3EE] rounded-2xl border border-[#BCB8B1] p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#463F3A]">
                    Personal Information
                  </h3>
                  <p className="text-xs text-[#8A817C] uppercase tracking-wider mt-1">
                    Manage your identity and correspondence preferences.
                  </p>
                </div>

                {profileMsg && (
                  <div className="p-3.5 rounded-xl bg-white border border-[#BCB8B1] text-xs font-medium text-[#463F3A]">
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                      Account Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full bg-black/5 border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#8A817C] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user.username}
                      className="w-full bg-black/5 border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#8A817C] cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="px-8 py-3 rounded-xl bg-accent text-[#654136] text-xs uppercase tracking-wider font-bold shadow-sm hover:bg-[#edbbac] transition-all disabled:opacity-60"
                    >
                      {updatingProfile ? "Updating..." : "Save Details"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: ORDERS ARCHIVE */}
            {activeTab === "orders" && (
              <div className="bg-[#F4F3EE] rounded-2xl border border-[#BCB8B1] p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#463F3A]">
                    Orders &amp; Acquisitions
                  </h3>
                  <p className="text-xs text-[#8A817C] uppercase tracking-wider mt-1">
                    Historical monographs and current delivery dispatches.
                  </p>
                </div>

                {loadingOrders ? (
                  <div className="py-12 text-center text-xs uppercase tracking-widest text-[#8A817C] animate-pulse">
                    Querying Orders Archive...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center max-w-sm mx-auto">
                    <p className="text-sm text-[#8A817C] mb-4">
                      No order acquisitions found in your account history.
                    </p>
                    <Link
                      href="/shop"
                      className="inline-block px-6 py-2.5 rounded-full bg-accent text-[#654136] text-xs uppercase tracking-wider font-semibold"
                    >
                      Visit Shop →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => {
                      const orderItems =
                        ord.line_items && ord.line_items.length > 0
                          ? ord.line_items
                          : ord.items || [];
                      const isCompleted =
                        ord.status === "completed" || ord.status === "processing";
                      const isCancelled =
                        ord.status === "cancelled" || ord.status === "failed";

                      return (
                        <div
                          key={ord.id}
                          className="bg-white rounded-xl p-5 border border-[#BCB8B1]/50 shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#BCB8B1]/30 gap-2">
                            <div>
                              <span className="text-xs font-bold text-[#463F3A]">
                                Order #{ord.order_number || ord.id}
                              </span>
                              <span className="text-xs text-[#8A817C] ml-3">
                                {ord.date_created
                                  ? new Date(ord.date_created).toLocaleDateString(undefined, {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                                  isCompleted
                                    ? "bg-green-100 text-green-800"
                                    : isCancelled
                                    ? "bg-stone-200 text-stone-700"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {ord.status_label || ord.status}
                              </span>
                              <span className="text-sm font-bold text-[#463F3A]">
                                {ord.currency_symbol || "$"}{ord.total}
                              </span>
                            </div>
                          </div>

                          {orderItems.length > 0 && (
                            <div className="space-y-1.5 text-xs text-[#514440]">
                              {orderItems.map((it) => (
                                <div key={it.id} className="flex justify-between">
                                  <span>
                                    {it.name} &times; {it.quantity}
                                  </span>
                                  <span className="font-medium">
                                    {ord.currency_symbol || "$"}{it.total}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SAVED ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="bg-[#F4F3EE] rounded-2xl border border-[#BCB8B1] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#463F3A]">
                      Saved Addresses
                    </h3>
                    <p className="text-xs text-[#8A817C] uppercase tracking-wider mt-1">
                      Manage your delivery and billing destinations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="px-4 py-2 rounded-full bg-accent text-[#654136] text-xs uppercase tracking-wider font-semibold shadow-sm"
                  >
                    {showAddressForm ? "Cancel" : "+ Add Address"}
                  </button>
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                  <form
                    onSubmit={handleAddAddress}
                    className="p-5 rounded-xl bg-white border border-[#BCB8B1] space-y-4"
                  >
                    <h4 className="text-sm font-bold text-[#463F3A] uppercase tracking-wider">
                      New Destination
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#463F3A] font-semibold mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.label}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, label: e.target.value })
                          }
                          placeholder="Home / Atelier"
                          className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#463F3A] font-semibold mb-1">
                          Country
                        </label>
                        <select
                          value={newAddress.country}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, country: e.target.value })
                          }
                          className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-lg px-3 py-2 text-xs"
                        >
                          <option value="US">United States</option>
                          <option value="FR">France</option>
                          <option value="GB">United Kingdom</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#463F3A] font-semibold mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.first_name}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, first_name: e.target.value })
                          }
                          className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#463F3A] font-semibold mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.last_name}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, last_name: e.target.value })
                          }
                          className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#463F3A] font-semibold mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.address_1}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, address_1: e.target.value })
                        }
                        className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-lg px-3 py-2 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#463F3A] font-semibold mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, city: e.target.value })
                          }
                          className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#463F3A] font-semibold mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, state: e.target.value })
                          }
                          className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#463F3A] font-semibold mb-1">
                          ZIP
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.postcode}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, postcode: e.target.value })
                          }
                          className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-accent text-[#654136] text-xs uppercase tracking-wider font-bold"
                    >
                      Save Destination
                    </button>
                  </form>
                )}

                {/* Addresses Cards Grid */}
                {loadingAddresses ? (
                  <div className="py-12 text-center text-xs uppercase tracking-widest text-[#8A817C] animate-pulse">
                    Querying Delivery Archives...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-12 text-center max-w-sm mx-auto">
                    <p className="text-sm text-[#8A817C] mb-4">
                      No saved addresses found. Add a delivery destination for faster checkout.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr, idx) => (
                      <div
                        key={addr.id || idx}
                        className="bg-white rounded-xl p-5 border border-[#BCB8B1]/50 shadow-sm relative space-y-1.5 text-xs text-[#514440]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-[#463F3A] uppercase tracking-wider">
                            {addr.label || "Address"}
                          </span>
                          {addr.is_default && (
                            <span className="bg-accent/30 text-[#654136] border border-accent text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-[#1b1c19]">
                          {addr.first_name} {addr.last_name}
                        </p>
                        <p>{addr.address_1}</p>
                        {addr.address_2 && <p>{addr.address_2}</p>}
                        <p>
                          {addr.city}, {addr.state} {addr.postcode}
                        </p>
                        <p className="text-[#8A817C]">{addr.country}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}

