// src/app/vibes/page.tsx
import React from "react";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { ArrowUpRightSquare } from "lucide-react";
import type { Metadata } from "next";
import { getVibeTitleFromHtml } from "@/lib/vibes"; // Ensure this path is correct

// Define the expected shape of vibe data
interface VibeData {
  slug: string;
  title: string;
}

/**
 * Fetches data for all vibes, including their titles parsed
 * from their respective index.html files asynchronously.
 */
async function getSortedVibesData(): Promise<VibeData[]> {
  const vibesDirectory = path.join(process.cwd(), "public", "vibes");
  try {
    const dirents = await fs.promises.readdir(vibesDirectory, {
      withFileTypes: true,
    });
    const directories = dirents.filter((dirent) => dirent.isDirectory());

    const vibeDataPromises = directories.map(
      async (dirent): Promise<VibeData> => {
        const slug = dirent.name;
        const title = await getVibeTitleFromHtml(slug);
        return { slug, title };
      }
    );

    const allVibesData = await Promise.all(vibeDataPromises);
    allVibesData.sort((a, b) => a.title.localeCompare(b.title));
    return allVibesData;
  } catch (error) {
    // Log the error with more detail for server-side debugging
    console.error(
      `[VibesIndexPage] Error fetching vibes data: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return [];
  }
}

// Metadata for the Vibes index page
export const metadata: Metadata = {
  title: "Vibes | Sanagi Labs",
  description:
    "A collection of interactive web experiments and vibes by Sanagi Labs.",
  openGraph: {
    title: "Vibes | Sanagi Labs",
    description: "Explore interactive web experiments and vibes.",
    url: "https://taijusanagi.com/vibes", // Replace with your actual URL
    siteName: "Sanagi Labs",
    // Consider adding a relevant Open Graph image
    // images: [ { url: '/ogp/vibes-gallery.png', width: 1200, height: 630 } ],
  },
  twitter: {
    card: "summary_large_image", // Suitable if you have an OG image
    title: "Vibes | Sanagi Labs",
    description: "Explore interactive web experiments and vibes.",
    // images: [`/ogp/vibes-gallery.png`], // Match OG image URL
    // site: '@yourTwitterHandle', // Optional: Add your Twitter handle
    // creator: '@yourTwitterHandle', // Optional: Add creator handle
  },
  // Add canonical URL if this page might be accessible via multiple URLs
  // alternates: { canonical: "https://taijusanagi.com/vibes" },
};

/**
 * Renders the Vibes index page using a card layout
 * similar to the Notes page, including a non-interactive iframe preview.
 */
export default async function VibesIndexPage() {
  const allVibes = await getSortedVibesData();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold mb-10 text-center text-neutral-800 dark:text-neutral-100 transition-colors duration-300 ease-in-out">
        Vibes
      </h1>

      {allVibes.length === 0 ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400 transition-colors duration-300 ease-in-out">
          No vibes found. Check the <code>public/vibes</code> directory setup.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allVibes.map(({ slug, title }) => {
            const detailUrl = `/vibes/${slug}`;
            const iframeSrc = `/vibes/${slug}/index.html`;

            return (
              // Card Link: Outer container, clickable, styled like Notes card.
              <Link
                href={detailUrl}
                key={slug}
                className="group relative flex flex-col justify-between p-5 rounded-lg border
                           bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700/80
                           shadow-md hover:border-neutral-300 dark:hover:border-neutral-600/90
                           hover:bg-neutral-50/70 dark:hover:bg-neutral-800/80
                           transition-all duration-300 ease-in-out overflow-hidden" // overflow-hidden helps contain scaling effect
              >
                {/* Top Content Area: Contains Title and Iframe */}
                <div>
                  {/* Vibe Title */}
                  <h2 className="text-xl font-semibold mb-3 text-neutral-800 dark:text-neutral-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300 ease-in-out">
                    {title}
                  </h2>

                  {/* Iframe Preview Container */}
                  <div className="w-full aspect-video bg-neutral-100 dark:bg-neutral-900/50 overflow-hidden rounded-md mb-4 shadow-inner dark:shadow-neutral-900/50">
                    <iframe
                      src={iframeSrc}
                      title={`${title} preview`}
                      // Added 'pointer-events-none' to make iframe non-interactive
                      className="block w-full h-full border-0 transform transition-transform duration-300 ease-in-out group-hover:scale-105 pointer-events-none"
                      loading="lazy"
                      // The sandbox attribute restricts iframe capabilities for security.
                      // 'allow-scripts' is often needed for JS animations, but be cautious.
                      // Removing 'allow-same-origin' enhances security if scripts don't need origin access.
                      // sandbox="allow-scripts"
                      aria-hidden="true" // Hide from accessibility tree as it's non-interactive preview
                    />
                  </div>
                </div>

                {/* Bottom Link Area: Pushed to the bottom */}
                <div className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 mt-auto pt-2 group-hover:underline transition-colors duration-300 ease-in-out">
                  <ArrowUpRightSquare className="w-4 h-4 mr-2 opacity-80 flex-shrink-0" />
                  View Vibe
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
