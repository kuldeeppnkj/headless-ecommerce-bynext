import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getGlobalSettings } from "@/lib/api";
import { Suspense } from "react";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { draftMode } from "next/headers";
import DraftBanner from "@/components/DraftBanner";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Épure Atelier | Modern Luxury Redefined",
  description:
    "Sculptural tailoring and unyielding materiality, conceived for longevity in form and presence.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getGlobalSettings();
  const draft = await draftMode();
  const isDraft = draft.isEnabled;

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          primaryColor={settings.primary_color}
          accentColor={settings.accent_color}
        >
          <AuthProvider>
            <CartProvider>
              <Suspense fallback={<div className="h-20 w-full bg-[#faf9f4]" />}>
                <Header logo={settings.logo} navItems={settings.header_nav} />
              </Suspense>
              <main className="flex-1 w-full pt-20">
                {children}
              </main>
              <Footer
                footer={settings.footer}
                social={settings.social}
                footerLinks={settings.footer_links}
              />
              {isDraft && <DraftBanner />}
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
