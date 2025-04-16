import React from "react";
// No longer need useTheme here if only used for conditional styling
// import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  description: "A space for learning, building, and soft experiments in AI",
  pagePath: "/",
});

export default function Home() {
  // const { darkMode } = useTheme(); // Removed - no longer needed here

  return (
    <div className="flex flex-col items-center justify-center text-center flex-1 px-4">
      {/* Logo */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 mb-6 relative">
        <Image
          src="/character.webp"
          alt="tofupunch"
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Title - Already using dark: variant */}
      <h1 className="text-5xl sm:text-6xl font-extrabold mb-2 tracking-tight text-neutral-800 dark:text-neutral-100 transition-colors duration-300 ease-in-out">
        Sanagi Labs
      </h1>

      {/* Tagline - Already using dark: variant */}
      <p className="text-lg sm:text-xl mb-10 font-light text-neutral-500 dark:text-neutral-400 transition-colors duration-300 ease-in-out">
        a space for learning, building, and soft experiments in AI
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-5 mb-4">
        <Link
          href="/notes"
          // Combined light and dark styles using dark: prefix
          className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 border transition-all duration-300 ease-in-out
                     bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100 hover:border-teal-300
                     dark:bg-teal-900/50 dark:text-teal-100 dark:border-teal-700/80 dark:hover:bg-teal-800/70 dark:hover:border-teal-600"
        >
          Notes
        </Link>

        <Link
          href="/vibes"
          // Combined light and dark styles using dark: prefix
          className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 border transition-all duration-300 ease-in-out
                     bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 hover:border-purple-300
                     dark:bg-purple-900/50 dark:text-purple-100 dark:border-purple-700/80 dark:hover:bg-purple-800/70 dark:hover:border-purple-600"
        >
          Vibes
        </Link>
      </div>
    </div>
  );
}
