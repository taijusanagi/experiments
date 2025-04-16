"use client"; // Keep this if it uses client-side hooks like useTheme

import React, { ReactNode } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext"; // Adjust path if needed
import Link from "next/link";

export function DefaultLayout({ children }: { children: ReactNode }) {
  // We still need context for:
  // 1. The toggle function itself (onClick)
  // 2. Knowing which icon (Sun/Moon) to display
  const { darkMode, toggleDarkMode } = useTheme();

  // Get the current year
  const currentYear = new Date().getFullYear();

  return (
    // Apply base (light mode) styles and dark: prefixed styles
    <div
      className="min-h-screen flex flex-col transition-colors duration-500
                 bg-[#fdfdfd] text-[#1a1a1a]
                 dark:bg-[#1e1e1e] dark:text-[#e5e5e5]"
    >
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        {/* Left side: Logo */}
        <Link
          href="/"
          className="text-sm font-medium opacity-60 transition-colors duration-300 ease-in-out
                     text-neutral-700 hover:text-teal-600
                     dark:text-neutral-300 dark:hover:text-teal-400"
        >
          Sanagi Labs
        </Link>

        {/* Right side: Navigation + Theme Toggle */}
        <div className="flex items-center gap-6">
          <nav>
            <ul className="flex items-center gap-5">
              <li>
                <Link
                  href="/notes"
                  className="text-sm font-medium transition-colors duration-300 ease-in-out
                             text-neutral-700 hover:text-teal-600
                             dark:text-neutral-300 dark:hover:text-teal-400"
                >
                  Notes
                </Link>
              </li>
              <li>
                <Link
                  href="/vibes"
                  className="text-sm font-medium transition-colors duration-300 ease-in-out
                             text-neutral-700 hover:text-teal-600
                             dark:text-neutral-300 dark:hover:text-teal-400"
                >
                  Vibes
                </Link>
              </li>
            </ul>
          </nav>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode} // This function MUST now toggle the 'dark' class on <html> or <body>
            className="p-2 rounded-full border transition-all duration-300 cursor-pointer
                       bg-neutral-100 border-teal-200 text-teal-600 hover:bg-neutral-200
                       dark:bg-neutral-800 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-neutral-700"
            aria-label="Toggle dark mode"
          >
            {/* Icon display still needs the darkMode state from context */}
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center w-full">
        {children}
      </main>
      {/* Footer */}
      <footer
        className="w-full text-sm text-center font-light py-4 mt-8
                   text-neutral-500
                   dark:text-neutral-600" // Added margin-top for spacing
      >
        © {currentYear} Taiju Sanagi. All experiments welcome.
      </footer>
    </div>
  );
}
