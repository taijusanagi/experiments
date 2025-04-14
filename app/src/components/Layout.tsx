"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { Sun, Moon } from "lucide-react";

export default function SanagiLayout({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-100"
          : "bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-900"
      }`}
    >
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <span className="text-sm font-mono opacity-50">Sanagi Labs</span>
        <button
          onClick={() => setDarkMode(!darkMode)}
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
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer
        className={`w-full text-sm text-center font-light py-4 ${
          darkMode ? "text-neutral-600" : "text-neutral-500"
        }`}
      >
        © 2025 Taiju Sanagi. All experiments welcome.
      </footer>
    </div>
  );
}
