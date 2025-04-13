"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, ExternalLink } from "lucide-react";

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center px-6 py-16 transition-colors duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-100"
          : "bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-900"
      }`}
    >
      {/* Topbar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center">
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
      </div>

      {/* Logo */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 mb-6 relative">
        <img
          src="/character.png"
          alt="Sanagi Character"
          className="object-contain w-full h-full"
        />
      </div>

      {/* Title */}
      <h1
        className={`text-5xl sm:text-6xl font-extrabold mb-2 tracking-tight ${
          darkMode ? "text-white" : "text-neutral-900"
        }`}
      >
        Sanagi Labs
      </h1>

      {/* Tagline */}
      <p
        className={`text-center text-lg sm:text-xl mb-10 font-light ${
          darkMode ? "text-neutral-400" : "text-neutral-500"
        }`}
      >
        Sanagi Labs is a space for learning, building, and soft experiments in
        AI
      </p>

      {/* CTA Button */}
      <div className="flex gap-5 mb-16">
        <a
          href="/notes"
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105 border ${
            darkMode
              ? "bg-teal-900/30 text-teal-100 border-teal-700 hover:bg-teal-800"
              : "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100"
          }`}
        >
          Notes <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
        </a>
      </div>

      {/* Footer */}
      <footer
        className={`text-sm absolute bottom-4 font-light ${
          darkMode ? "text-neutral-600" : "text-neutral-500"
        }`}
      >
        © 2025 Taiju Sanagi. All experiments welcome.
      </footer>
    </main>
  );
}
