"use client"; // Keep this if it uses client-side hooks like useTheme

import React, { ReactNode } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext"; // Adjust path if needed
import Link from "next/link";

export function DefaultLayout({ children }: { children: ReactNode }) {
  // Get theme state and toggle function from context
  const { darkMode, toggleDarkMode } = useTheme();

  // Get the current year
  const currentYear = new Date().getFullYear();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode
          ? "bg-[#1e1e1e] text-[#e5e5e5]" // Slightly softer dark bg and text
          : "bg-[#fdfdfd] text-[#1a1a1a]" // Cleaner light mode contrast
      }`}
    >
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center dark:border-neutral-800">
        {/* Left side: Logo */}
        <Link
          href="/"
          className="text-sm font-mono opacity-60 hover:opacity-100 transition-opacity"
        >
          Sanagi Labs
        </Link>

        {/* Right side: Navigation + Theme Toggle */}
        <div className="flex items-center gap-6">
          {" "}
          {/* Container for right elements, adjust gap as needed */}
          <nav>
            <ul className="flex items-center gap-5">
              {" "}
              {/* Spacing between nav links */}
              <li>
                <Link
                  href="/notes"
                  className={`text-sm font-medium transition-colors duration-300 ease-in-out ${
                    darkMode
                      ? "text-neutral-300 hover:text-teal-400"
                      : "text-neutral-700 hover:text-teal-600"
                  }`}
                >
                  Notes
                </Link>
              </li>
              <li>
                <Link
                  href="/vibes"
                  className={`text-sm font-medium transition-colors duration-300 ease-in-out ${
                    darkMode
                      ? "text-neutral-300 hover:text-teal-400"
                      : "text-neutral-700 hover:text-teal-600"
                  }`}
                >
                  Vibes
                </Link>
              </li>
            </ul>
          </nav>
          {/* Theme Toggle Button (Now part of the right-side group) */}
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
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center w-full">
        {children}
      </main>

      {/* Footer */}
      <footer
        className={`w-full text-sm text-center font-light py-4 mt-8 ${
          // Added margin-top for spacing
          darkMode ? "text-neutral-600" : "text-neutral-500"
        }`}
      >
        © {currentYear} Taiju Sanagi. All experiments welcome.
      </footer>
    </div>
  );
}
