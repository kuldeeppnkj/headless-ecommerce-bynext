"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, login, register } = useAuth();

  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign In Form State
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register Form State
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = await login(loginUsername, loginPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Welcome back. Redirecting to your atelier profile...");
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } else {
      setErrorMsg(res.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = await register({
      username: regUsername,
      email: regEmail,
      password: regPassword,
      first_name: regFirstName,
      last_name: regLastName,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Your account has been created successfully. Welcome to Épure Atelier.");
      setTimeout(() => {
        router.push("/profile");
      }, 1200);
    } else {
      setErrorMsg(res.message || "Could not complete registration.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#faf9f4] py-8 md:py-12">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-wider text-[#8A817C]">
          <Link href="/" className="hover:text-[#1b1c19] transition-colors">
            Home
          </Link>
          <span className="text-[#BCB8B1]">›</span>
          <span className="text-[#1b1c19] font-medium">My Account</span>
        </nav>

        {/* Split Layout Container matching docs/login-register.html */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[20px] overflow-hidden border border-[#BCB8B1] bg-[#F4F3EE] shadow-sm">
          
          {/* Left Side: Editorial Panel (Desktop 6 cols) */}
          <div className="relative hidden lg:flex lg:col-span-6 flex-col justify-between p-12 xl:p-16 min-h-[720px] overflow-hidden rounded-r-[20px] bg-[#1b1c19]">
            {/* Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoxbI-Q0S1tXfHHsJNdxD2OgSBqhi1JHjSczy35ltKizBS49Po5iGlnjrmb3RJP2iQrIyVLO9Gv-CD9JOopnNZcpMbNesauogiMrceXPsxtqEpfxdidbKHm3RRdOia9SaHJiTlqHj_pPne5xlIqze8Hw-0BmSm6U5LUKmzmepx2Z01aT0TcI7EyoS6QLqzQjBUmKc_zZzPZrSRHbK7sz9WcbGOzTzeZ0whkDU2Ufh5KHs3_btBtMOE"
              alt="Atelier Épure Collection"
              className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-90"
            />
            {/* Dark Brand Overlay */}
            <div className="absolute inset-0 bg-[#1b1c19]/50 z-10 backdrop-blur-[1px]" />

            {/* Overlaid Top Branding */}
            <div className="relative z-20">
              <span className="inline-block px-3.5 py-1 bg-[#1b1c19]/70 backdrop-blur-md rounded-full text-[10px] font-semibold tracking-[0.25em] text-accent uppercase border border-accent/40 mb-3">
                WELCOME TO
              </span>
              <h2 className="text-5xl xl:text-6xl font-serif text-[#faf9f4] tracking-tight drop-shadow-sm">
                Épure Atelier
              </h2>
              <p className="mt-4 text-sm font-light text-[#faf9f4]/90 max-w-sm leading-relaxed">
                Sign in to track orders, save delivery archives, and enjoy bespoke client privileges.
              </p>
              <div className="w-16 h-0.5 bg-accent my-6 rounded-full" />
            </div>

            {/* Overlaid Benefit Rows */}
            <div className="relative z-20 space-y-4 max-w-md pt-8 border-t border-white/20">
              <div className="flex items-center gap-3.5 text-[#faf9f4] text-xs uppercase tracking-wider font-medium">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Private Salon &amp; Capsule Access</span>
              </div>
              <div className="flex items-center gap-3.5 text-[#faf9f4] text-xs uppercase tracking-wider font-medium">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Seamless Native Store API Checkout</span>
              </div>
              <div className="flex items-center gap-3.5 text-[#faf9f4] text-xs uppercase tracking-wider font-medium">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Complimentary Global Returns</span>
              </div>
            </div>
          </div>

          {/* Right Side: Authentication Forms (6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 xl:p-16 flex flex-col justify-center">
            
            {/* Tab Pill Switcher */}
            <div className="inline-flex p-1 rounded-full bg-[#efeee9] border border-[#d5c3be]/40 mb-8 self-start">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeTab === "signin"
                    ? "bg-accent text-[#654136] shadow-sm"
                    : "text-[#655d57] hover:text-[#1b1c19]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeTab === "register"
                    ? "bg-accent text-[#654136] shadow-sm"
                    : "text-[#655d57] hover:text-[#1b1c19]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error / Success Notifications */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-medium">
                {successMsg}
              </div>
            )}

            {/* TAB 1: SIGN IN */}
            {activeTab === "signin" ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#463F3A] mb-2">
                    Welcome Back
                  </h3>
                  <p className="text-xs text-[#8A817C] uppercase tracking-wider mb-6">
                    Enter your credentials to access your account.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-2">
                    Username or Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Enter username or email"
                    className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-3 text-sm text-[#463F3A] placeholder-[#8A817C] focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold">
                      Password *
                    </label>
                    <span className="text-xs text-[#8A817C] hover:text-[#463F3A] cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-3 text-sm text-[#463F3A] placeholder-[#8A817C] focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-accent text-[#654136] text-xs uppercase tracking-widest font-bold shadow-md hover:bg-[#edbbac] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#654136] border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>Sign In to Atelier</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: REGISTER */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#463F3A] mb-2">
                    Create Atelier Account
                  </h3>
                  <p className="text-xs text-[#8A817C] uppercase tracking-wider mb-6">
                    Join to unlock personal archiving and early capsule access.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] placeholder-[#8A817C] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] placeholder-[#8A817C] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="janedoe"
                    className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] placeholder-[#8A817C] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jane.doe@domain.com"
                    className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] placeholder-[#8A817C] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#463F3A] font-semibold mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#faf9f4] border border-[#BCB8B1] rounded-xl px-4 py-2.5 text-sm text-[#463F3A] placeholder-[#8A817C] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-accent text-[#654136] text-xs uppercase tracking-widest font-bold shadow-md hover:bg-[#edbbac] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#654136] border-t-transparent rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

