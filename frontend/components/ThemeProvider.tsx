"use client";

import React, { useEffect } from "react";

interface ThemeProviderProps {
  primaryColor?: string;
  accentColor?: string;
  children: React.ReactNode;
}

export default function ThemeProvider({
  primaryColor = "#463F3A",
  accentColor = "#E0AFA0",
  children,
}: ThemeProviderProps) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--primary-color", primaryColor);
      document.documentElement.style.setProperty("--accent-color", accentColor);
    }
  }, [primaryColor, accentColor]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --primary-color: ${primaryColor};
            --accent-color: ${accentColor};
          }
        `
      }} />
      <div className="min-h-screen flex flex-col bg-[#FAF9F4] text-[#1B1C19]">
        {children}
      </div>
    </>
  );
}

