"use client"; // Keep this if it uses client-side hooks like useTheme

import React, { ReactNode } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext"; // Adjust path if needed
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DefaultLayout({ children }: { children: ReactNode }) {
  // Get theme state and toggle function from context
  const { darkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith("/vibes/");

  return (
    <div
      // The background/text colors are now primarily controlled by the class
      // applied to the <body> tag via ThemeContext, but you can keep
      // these gradients if you like the specific effect.
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode
          ? "bg-[#1e1e1e] text-[#e5e5e5]" // Slightly softer dark bg and text
          : "bg-[#fdfdfd] text-[#1a1a1a]" // Cleaner light mode contrast
      }`}
    >
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href="/" className="text-sm font-mono opacity-50 hover:underline">
          Sanagi Labs
        </Link>
        <button
          onClick={toggleDarkMode} // Use the function from context
          className={`p-2 rounded-full border transition-all duration-300 ${
            darkMode
              ? "bg-neutral-800 border-teal-800 text-teal-400 hover:bg-neutral-700"
              : "bg-neutral-100 border-teal-200 text-teal-600 hover:bg-neutral-200"
          }`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </header>

      {/* Main content */}
      {/* Removed justify-center from default layout to better suit notes pages */}
      <main className="flex-1 flex flex-col items-center w-full">
        {children}
      </main>

      {/* Footer */}
      {!hideFooter && (
        <footer
          className={`w-full text-sm text-center font-light py-4 ${
            darkMode ? "text-neutral-600" : "text-neutral-500"
          }`}
        >
          © {new Date().getFullYear()} Taiju Sanagi. All experiments welcome.
        </footer>
      )}
    </div>
  );
}
