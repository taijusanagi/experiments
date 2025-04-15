// src/app/vibes/[slug]/page.tsx
import fs from "fs"; // Use Node.js fs module for reading directories
import path from "path";
import { notFound } from "next/navigation";
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { X } from "lucide-react"; // Using lucide icon like in notes

// --- Helper Function (Optional, similar to notes) ---
// You might want a shared helper or define it here
function formatSlugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word
}

// --- generateStaticParams: Find directories in public/vibes ---
export async function generateStaticParams() {
  // Define the path to your vibes directory within 'public'
  const vibesDirectory = path.join(process.cwd(), "public", "vibes");

  try {
    // Read the directory contents
    const directories = fs
      .readdirSync(vibesDirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory()) // Ensure we only get directories
      .map((dirent) => dirent.name); // Get the directory name (which is our slug)

    // Return the array of slugs for Next.js to pre-render
    return directories.map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    // If the directory doesn't exist or there's an error, return empty array
    // This prevents build errors if the directory is missing initially.
    console.warn(
      `Could not read public/vibes directory during generateStaticParams: ${error}`
    );
    return [];
  }
}

// --- Props Type (Simplified for this page) ---
type Props = { params: { slug: string } };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // ... (logic to get title remains the same)
  const { slug } = params;
  const displayTitle = `Vibe: ${formatSlugToTitle(slug)}`;
  return {
    title: `${displayTitle} | Your Site Name`,
    description: `View the interactive vibe: ${formatSlugToTitle(slug)}.`, // Simplified
    // ... (rest of metadata)
  };
}

// --- The Page Component ---
export default function VibePage({ params }: Props) {
  const { slug } = params;
  const displayTitle = `Vibe: ${formatSlugToTitle(slug)}`;
  const iframeSrc = `/vibes/${slug}/index.html`;

  return (
    <div className="flex flex-col w-full flex-1 relative">
      {/* Close button */}
      <div className="absolute top-2 right-2 z-10">
        <Link
          href="/vibes"
          title="Close vibe and return to gallery"
          className="p-2 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-all"
          aria-label="Close vibe"
        >
          <X className="w-5 h-5" />
        </Link>
      </div>
      {/* Full-height iframe */}
      <iframe
        src={iframeSrc}
        title={displayTitle}
        className="w-full h-full flex-1"
        style={{ border: "none" }}
      />
    </div>
  );
}
