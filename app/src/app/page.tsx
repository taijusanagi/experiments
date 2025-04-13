"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Code, ExternalLink } from "lucide-react";

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center px-6 py-16 transition-colors duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-100"
          : "bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-900"
      }`}
    >
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center">
        <span className="text-sm font-mono opacity-50">taijusanagi.com</span>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full transition-all duration-300 ${
            darkMode
              ? "bg-neutral-800 text-yellow-300 hover:bg-neutral-700"
              : "bg-neutral-200 text-indigo-600 hover:bg-neutral-300"
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

      <div className="w-24 h-24 mb-6 relative">
        <div
          className={`absolute inset-0 rounded-xl flex items-center justify-center ${
            darkMode ? "bg-cyan-900/20" : "bg-cyan-100"
          }`}
        >
          <Code
            className={`w-12 h-12 ${
              darkMode ? "text-cyan-400" : "text-cyan-600"
            }`}
          />
        </div>
      </div>

      <h1
        className={`text-5xl font-bold mb-3 tracking-tight ${
          darkMode ? "text-white" : "text-neutral-900"
        }`}
      >
        Sanagi Labs
      </h1>

      <p
        className={`text-lg mb-10 font-light ${
          darkMode ? "text-neutral-400" : "text-neutral-500"
        }`}
      >
        <span className="font-medium">code</span>-driven curiosity
      </p>

      <div className="flex gap-5 mb-16">
        <a
          href="/notes"
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all transform hover:scale-105 ${
            darkMode
              ? "bg-cyan-800/30 text-cyan-100 border border-cyan-700 hover:bg-cyan-700"
              : "bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100"
          }`}
        >
          Notes <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
        </a>
      </div>

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
