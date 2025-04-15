// src/app/vibes/page.tsx
import React from "react";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { ArrowUpRightSquare } from "lucide-react";
import type { Metadata } from "next";
// Import the ASYNC helper function from the correct path
import { getVibeTitleFromHtml } from "@/lib/vibes"; // Assuming src/lib/vibes.ts path

// --- Function to get Vibe data (Now Async) ---
async function getSortedVibesData(): Promise<
  { slug: string; title: string }[]
> {
  const vibesDirectory = path.join(process.cwd(), "public", "vibes");
  try {
    const dirents = await fs.promises.readdir(vibesDirectory, {
      withFileTypes: true,
    });
    const directories = dirents.filter((dirent) => dirent.isDirectory());

    // Create an array of promises, each fetching a title
    const vibeDataPromises = directories.map(async (dirent) => {
      const slug = dirent.name;
      // Fetch the actual title asynchronously
      const title = await getVibeTitleFromHtml(slug);
      return { slug, title };
    });

    // Wait for all title fetches to complete
    const allVibesData = await Promise.all(vibeDataPromises);

    // Sort alphabetically by the fetched/fallback title
    allVibesData.sort((a, b) => a.title.localeCompare(b.title));

    return allVibesData;
  } catch (error) {
    console.warn(
      `Could not read public/vibes directory or fetch titles for index page: ${error}`
    );
    return []; // Return empty array on error
  }
}

// --- Page Metadata (Remains the same) ---
export const metadata: Metadata = {
  title: "Vibes | Your Site Name",
  description: "A collection of interactive vibes and experiments.",
  // ... rest of metadata
};

// --- Page Component (Now Async) ---
export default async function VibesIndexPage() {
  // Await the async function to get the data
  const allVibes = await getSortedVibesData();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 md:py-16">
      <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-neutral-800 dark:text-neutral-100 transition-colors duration-300 ease-in-out">
        Vibes Gallery
      </h1>

      {allVibes.length === 0 ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400">
          No vibes found. Check the <code>public/vibes</code> directory and
          ensure they contain valid <code>index.html</code> files.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {allVibes.map(({ slug, title }) => {
            // Use the fetched title directly
            const iframeSrc = `/vibes/${slug}/index.html`;
            const detailUrl = `/vibes/${slug}`;

            return (
              <div
                key={slug}
                className="group relative flex flex-col rounded-lg border overflow-hidden
                                            bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700/80
                                            shadow-md dark:shadow-neutral-900/50 transition-all duration-300 ease-in-out hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-600"
              >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-700/80">
                  <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 truncate pr-2">
                    {title}
                  </h2>
                  <Link
                    href={detailUrl}
                    title={`View ${title} full screen`}
                    className="flex-shrink-0 text-neutral-500 dark:text-neutral-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    aria-label={`View ${title} full screen`}
                  >
                    <ArrowUpRightSquare className="w-5 h-5" />
                  </Link>
                </div>

                {/* Iframe Preview Area */}
                <div className="w-full aspect-video bg-neutral-100 dark:bg-neutral-900/50 overflow-hidden">
                  <iframe
                    src={iframeSrc}
                    title={`${title} preview`}
                    className="block w-full h-full transform transition-transform duration-300 ease-in-out group-hover:scale-105"
                    style={{ border: "none" }}
                    loading="lazy"
                    // sandbox="allow-scripts allow-same-origin"
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
