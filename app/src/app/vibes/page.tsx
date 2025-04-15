// src/app/vibes/page.tsx
import React from "react";
import Link from "next/link";
// Removed fs, path imports
import { ArrowUpRightSquare, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
// Import the data fetching function from the lib file
import { getSortedVibesData } from "@/lib/vibes"; // Correct import
import { formatDate } from "@/lib/utils";

// Metadata remains the same
export const metadata: Metadata = {
  title: "Vibes | Sanagi Labs",
  description: "A collection of vibes by Sanagi Labs.",
};

/**
 * Renders the Vibes index page using data fetched from the library.
 */
export default async function VibesIndexPage() {
  // Fetch sorted data using the imported function
  const allVibes = await getSortedVibesData();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold mb-10 text-center text-neutral-800 dark:text-neutral-100 transition-colors duration-300 ease-in-out">
        Vibes
      </h1>

      {allVibes.length === 0 ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400 transition-colors duration-300 ease-in-out">
          {/* Updated message slightly */}
          No vibes found or unable to read vibe data.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Destructure 'updated' */}
          {allVibes.map(({ slug, title, updated }) => {
            const detailUrl = `/vibes/${slug}`;
            const iframeSrc = `/vibes-standalone/${slug}`;
            const formattedDate = formatDate(updated);

            return (
              <Link
                href={detailUrl}
                key={slug}
                className="group relative flex flex-col justify-between p-5 rounded-lg border
                           bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700/80
                           shadow-md hover:border-neutral-300 dark:hover:border-neutral-600/90
                           hover:bg-neutral-50/70 dark:hover:bg-neutral-800/80
                           transition-all duration-300 ease-in-out overflow-hidden"
              >
                {/* Top Content Area */}
                <div>
                  {/* Vibe Title */}
                  <h2 className="text-xl font-semibold mb-1 text-neutral-800 dark:text-neutral-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300 ease-in-out">
                    {title}
                  </h2>

                  {/* Display Formatted Date */}
                  {formattedDate && (
                    <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mb-3 transition-colors duration-300 ease-in-out">
                      <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-70 flex-shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  )}

                  {/* Iframe Preview Container */}
                  <div className="w-full aspect-video bg-neutral-100 dark:bg-neutral-900/50 overflow-hidden rounded-md mb-4 shadow-inner dark:shadow-neutral-900/50">
                    <iframe
                      src={iframeSrc}
                      title={`${title} preview`}
                      className="block w-full h-full border-0 transform transition-transform duration-300 ease-in-out group-hover:scale-105 pointer-events-none"
                      loading="lazy"
                      aria-hidden="true"
                      // sandbox="allow-scripts"
                    />
                  </div>
                </div>

                {/* Bottom Link Area */}
                <div className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 mt-auto pt-2 transition-colors duration-300 ease-in-out">
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
