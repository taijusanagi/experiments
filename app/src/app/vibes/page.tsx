// src/app/vibes/page.tsx
import React from "react";
import Link from "next/link";
import fs from "fs"; // Use Node.js fs module for reading directories
import path from "path";
import { ArrowUpRightSquare } from "lucide-react"; // Icon for link to detail page
import type { Metadata } from "next";

// --- Helper Function (can be shared from lib/ or defined here) ---
function formatSlugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word
}

// --- Function to get Vibe data (run server-side) ---
function getSortedVibesData() {
  const vibesDirectory = path.join(process.cwd(), "public", "vibes");
  try {
    const directories = fs
      .readdirSync(vibesDirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory()) // Only get directories
      .map((dirent) => {
        const slug = dirent.name;
        return {
          slug: slug,
          title: formatSlugToTitle(slug),
          // Add other potential metadata if you ever store it (e.g., read from a json file)
        };
      });

    // Sort alphabetically by title
    return directories.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.warn(
      `Could not read public/vibes directory for index page: ${error}`
    );
    return []; // Return empty array on error
  }
}

// --- Page Metadata ---
export const metadata: Metadata = {
  title: "Vibes | Your Site Name", // Replace with your site name
  description: "A collection of interactive vibes and experiments.",
  openGraph: {
    title: "Vibes | Your Site Name",
    description: "A collection of interactive vibes and experiments.",
    url: "https://your-domain.com/vibes", // Replace with your actual domain
    // Add an OGP image for the index page if you have one
    // images: [ { url: '/ogp/vibes-index.png', width: 1200, height: 630, alt: 'Vibes Index OGP' } ],
  },
  // Add Twitter card if desired
};

export default function VibesIndexPage() {
  const allVibes = getSortedVibesData();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
      {" "}
      {/* Wider max-width */}
      <h1 className="text-4xl font-bold mb-10 text-center text-neutral-800 dark:text-neutral-100 transition-colors duration-300 ease-in-out">
        Vibes Gallery
      </h1>
      {allVibes.length === 0 ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400">
          No vibes found. Check the <code>public/vibes</code> directory.
        </p>
      ) : (
        // Adjust grid columns for iframe previews
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {allVibes.map(({ slug, title }) => {
            const iframeSrc = `/vibes/${slug}/index.html`;
            const detailUrl = `/vibes/${slug}`;

            return (
              // Changed from Link to div as the main container
              <div
                key={slug}
                className="relative flex flex-col rounded-lg border overflow-hidden
                                            bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700/80
                                            shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl"
              >
                {/* Header within the card */}
                <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-700/80">
                  <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                    {title}
                  </h2>
                  <Link
                    href={detailUrl}
                    title={`View ${title} full screen`}
                    className="text-neutral-500 dark:text-neutral-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    <ArrowUpRightSquare className="w-5 h-5" />
                  </Link>
                </div>

                {/* Iframe Preview Area */}
                {/* Using aspect-video for 16:9. Adjust as needed (e.g., aspect-square) */}
                <div className="w-full aspect-video bg-neutral-100 dark:bg-neutral-800">
                  <iframe
                    src={iframeSrc}
                    title={title} // Use descriptive title
                    className="block w-full h-full" // Let aspect ratio control size
                    style={{ border: "none" }}
                    loading="lazy" // Crucial for performance
                    // sandbox="allow-scripts allow-same-origin" // Consider uncommenting
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
