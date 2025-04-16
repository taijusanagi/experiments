"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { darkMode } = useTheme();

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

      {/* Title */}
      <h1 className="text-5xl sm:text-6xl font-extrabold mb-2 tracking-tight text-neutral-800 dark:text-neutral-100 transition-colors duration-300 ease-in-out">
        Sanagi Labs
      </h1>

      {/* Tagline */}
      <p className="text-lg sm:text-xl mb-10 font-light text-neutral-500 dark:text-neutral-400 transition-colors duration-300 ease-in-out">
        a space for learning, building, and soft experiments in AI
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-5 mb-4">
        <Link
          href="/notes"
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 border transition-all duration-300 ease-in-out ${
            darkMode
              ? "bg-teal-900/50 text-teal-100 border-teal-700/80 hover:bg-teal-800/70 hover:border-teal-600"
              : "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100 hover:border-teal-300"
          }`}
        >
          Notes
        </Link>

        <Link
          href="/vibes"
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 border transition-all duration-300 ease-in-out ${
            darkMode
              ? "bg-purple-900/50 text-purple-100 border-purple-700/80 hover:bg-purple-800/70 hover:border-purple-600"
              : "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 hover:border-purple-300"
          }`}
        >
          Vibes
        </Link>
      </div>
    </div>
  );
}
