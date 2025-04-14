"use client"; // May not be needed anymore unless you have other client interactions

import React from "react";
import { useTheme } from "@/context/ThemeContext"; // Only needed if styles depend directly on darkMode state here
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { darkMode } = useTheme(); // Get theme if needed for specific element styles

  return (
    // The outer div with bg/text colors is handled by SanagiLayout and body class
    // We center the content specific to the home page here
    <div className="flex flex-col items-center justify-center text-center flex-1">
      {/* Logo */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 mb-6 relative">
        <Image
          src="/character.png"
          alt="tofupunch"
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Title */}
      {/* Rely on inherited text color or specify if needed */}
      <h1 className="text-5xl sm:text-6xl font-extrabold mb-2 tracking-tight">
        Sanagi Labs
      </h1>

      {/* Tagline */}
      {/* Rely on inherited text color, prose classes, or specify if needed */}
      <p className="text-lg sm:text-xl mb-10 font-light text-neutral-500 dark:text-neutral-400">
        a space for learning, building, and soft experiments in AI
      </p>

      {/* CTA Button */}
      <div className="flex gap-5 mb-4">
        <Link
          href="/notes"
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105 border ${
            darkMode // Example of using darkMode state directly if needed for specific styles
              ? "bg-teal-900/30 text-teal-100 border-teal-700 hover:bg-teal-800"
              : "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100"
          }`}
        >
          Notes
        </Link>
      </div>
    </div>
  );
}
