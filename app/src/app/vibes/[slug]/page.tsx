// src/app/vibes/[slug]/page.tsx
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"; // Base icons

// Import functions from lib/vibes (getVibeDataFromHtml now returns codepenUrl)
import {
  getVibeDataFromHtml,
  formatSlugToTitle,
  getVibeNavigation,
  getSortedVibesData,
  getVibeCodeForPrefill,
} from "@/lib/vibes";

// --- NEW: CodePen Icon Component ---
const CodePenIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 100 100"
    fill="none" // Use fill="none" and stroke="currentColor" for outline logos
    stroke="currentColor" // Use currentColor for stroke
    strokeWidth="7" // Adjust stroke width as needed
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-1.5 align-text-bottom" // Match ColabIcon classes
  >
    {/* CodePen Logo Outline Path Data - more standard representation */}
    <path d="M50 92.5L6.2 63.1V36.9L50 7.5l43.8 29.4v26.2L50 92.5z" />
    <path d="M50 68.1L6.2 38.7l43.8-29.4 43.8 29.4-43.8 29.4z" />
    <path d="M50 7.5v29.4" />
    <path d="M50 68.1v24.4" />
    <path d="M93.8 36.9L50 52.5 6.2 36.9" />
  </svg>
);
// ---------------------------------

// generateStaticParams... (implementation unchanged)
export async function generateStaticParams() {
  const allVibes = await getSortedVibesData();
  if (!allVibes || allVibes.length === 0) return [];
  return allVibes.map((vibe) => ({ slug: vibe.slug }));
}

// Props type... (unchanged)
type Props = {
  params: Promise<{ slug: string }>;
};

// generateMetadata... (implementation unchanged, already fetches title/date)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Note: getVibeDataFromHtml is called again here, unavoidable without changing SSG structure significantly
  const { title: actualTitle, updated } = await getVibeDataFromHtml(slug);
  const siteName = "Sanagi Labs";
  const pageTitle = `${actualTitle} | ${siteName}`;
  const description = `Explore the interactive vibe '${actualTitle}' on ${siteName}. Updated: ${
    updated ? formatDate(updated) : "N/A"
  }.`;
  return {
    title: pageTitle,
    description: description,
    openGraph: {
      /* ... */
    },
    twitter: {
      /* ... */
    },
  };
}

// formatDate helper... (implementation unchanged)
function formatDate(dateString: string | null): string | null {
  // ...
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return null;
  }
}

/**
 * Renders the individual vibe page with CodePen Prefill Form button,
 * using code extracted directly from index.html.
 */
export default async function VibePage({ params }: Props) {
  const { slug } = await params;

  // Fetch metadata (title, date) and navigation data
  // Note: getVibeDataFromHtml might re-read the file, could optimize later if needed
  const vibeData = await getVibeDataFromHtml(slug);
  const { prev, next } = await getVibeNavigation(slug);

  // --- Fetch Parsed Code Content for Prefill ---
  const { htmlBodyContent, css, js, js_external } = await getVibeCodeForPrefill(
    slug
  );
  // ---------------------------------------------

  if (!vibeData) {
    // Check basic data first
    notFound();
  }

  const { title: displayTitle, updated: updatedDate } = vibeData;
  const formattedDate = formatDate(updatedDate);
  const iframeSrc = `/vibes/${slug}/index.html`;

  // --- Prepare JSON data for CodePen ---
  let jsonStringData: string | null = null;
  // Check if we have *any* code content to send before stringifying
  if (htmlBodyContent || css || js || js_external) {
    const prefillData = {
      title: displayTitle || formatSlugToTitle(slug), // Use fetched title
      html: htmlBodyContent || "", // Use extracted body HTML
      css: css || "", // Use extracted <style> content
      js: js || "", // Use extracted embedded <script> content
      js_external: js_external || "", // Pass semicolon-separated external script URLs
    };
    try {
      // Ensure quotes within the code are handled correctly by JSON.stringify
      jsonStringData = JSON.stringify(prefillData);
    } catch (e) {
      console.error("Failed to stringify prefill data for CodePen:", e);
      jsonStringData = null;
    }
  }
  // -----------------------------------

  return (
    <div className="w-full flex flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full max-w-6xl">
        {/* Top Nav (Back Link) */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/vibes"
            className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 ease-in-out group"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Vibes
          </Link>
        </div>

        <article className="mb-16">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-3 transition-colors duration-300 ease-in-out">
              {displayTitle}
            </h1>
            {/* Header Meta Row */}
            <div className="flex justify-between items-center flex-wrap gap-y-2 text-sm text-neutral-500 dark:text-neutral-400 transition-colors duration-300 ease-in-out">
              {/* Date Display */}
              {formattedDate && (
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1.5 opacity-80" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {!formattedDate && <div className="h-[20px]"></div>}

              {/* --- CodePen Prefill Form Button --- */}
              {jsonStringData ? ( // Render only if we successfully prepared the JSON data
                <form
                  action="https://codepen.io/pen/define"
                  method="POST"
                  target="_blank"
                  className="inline-block"
                >
                  <input type="hidden" name="data" value={jsonStringData} />
                  <button
                    type="submit"
                    className="inline-flex items-center px-2.5 py-1 rounded-md border border-transparent bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700/90 hover:border-neutral-300 dark:hover:border-neutral-600/80 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-300 ease-in-out shadow-sm"
                    aria-label="Create a new CodePen with this vibe's code"
                  >
                    <CodePenIcon />
                    Open in CodePen
                  </button>
                </form>
              ) : (
                // Fallback if no code found or stringify failed
                <div></div>
              )}
              {/* ------------------------------------ */}
            </div>
          </header>

          {/* Main Content Area: Iframe */}
          <div className="mt-8">
            <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-neutral-100 dark:bg-neutral-900">
              <iframe
                src={iframeSrc}
                title={displayTitle}
                className="w-full h-full block border-0"
                loading="lazy"
              />
            </div>
          </div>
        </article>

        {/* Bottom Navigation */}
        {(prev || next) && (
          <nav className="w-full pt-6 flex justify-between items-start gap-6 sm:gap-8">
            {" "}
            {/* Added border-top */}
            {/* Previous Link Area */}
            <div className="flex-1 text-left">
              {prev && (
                <Link
                  href={`/vibes/${prev.slug}`} // Use /vibes/ path
                  className="group inline-block" // Consistent with notes
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300 ease-in-out block mb-1">
                    <ChevronLeft className="inline w-4 h-4 mr-1 align-text-bottom" />
                    Previous
                  </span>
                  <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300 ease-in-out block">
                    {/* Use prev.title (assuming getVibeNavigation provides it) */}
                    {prev.title || formatSlugToTitle(prev.slug)}
                  </span>
                </Link>
              )}
            </div>
            {/* Next Link Area */}
            <div className="flex-1 text-right">
              {next && (
                <Link
                  href={`/vibes/${next.slug}`} // Use /vibes/ path
                  className="group inline-block" // Consistent with notes
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300 ease-in-out block mb-1">
                    Next
                    <ChevronRight className="inline w-4 h-4 ml-1 align-text-bottom" />
                  </span>
                  <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300 ease-in-out block">
                    {/* Use next.title (assuming getVibeNavigation provides it) */}
                    {next.title || formatSlugToTitle(next.slug)}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
