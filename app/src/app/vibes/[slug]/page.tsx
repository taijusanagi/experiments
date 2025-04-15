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
import { formatDate } from "@/lib/utils";
import { CodePenIcon } from "@/components/CodePenIcon";

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
  const siteName = "Sanagi Labs";
  const baseUrl = "https://taijusanagi.com"; // Replace with your actual domain

  // Fetch Vibe data (title is essential for metadata)
  const { title: actualTitle } = await getVibeDataFromHtml(slug);

  // Use fetched title or create a fallback
  const titleForMeta = actualTitle || formatSlugToTitle(slug);
  const pageTitle = `${titleForMeta} | ${siteName}`;
  const pageDescription = `Explore the interactive vibe '${titleForMeta}' on ${siteName}.`;
  const pageUrl = `${baseUrl}/vibes/${slug}`;
  const ogImageUrl = `${baseUrl}/ogp/${slug}.png`; // Assumes OGP image exists at this path

  return {
    title: pageTitle, // For browser tab
    description: pageDescription,
    openGraph: {
      title: titleForMeta, // Title shown in social previews
      description: pageDescription,
      url: pageUrl,
      siteName: siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200, // Standard OGP image width
          height: 630, // Standard OGP image height
          alt: `${titleForMeta} OGP Image`,
        },
      ],
      locale: "en_US", // Optional: Specify locale
      type: "website", // 'website' is suitable for interactive pages/demos
    },
    twitter: {
      card: "summary_large_image",
      title: titleForMeta, // Title for Twitter card
      description: pageDescription,
      images: [ogImageUrl], // Image for Twitter card
      // creator: "@YourTwitterHandle", // Optional: Add your Twitter handle
    },
    // alternates: { // Optional: Add canonical URL
    //   canonical: pageUrl,
    // },
  };
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
  const iframeSrc = `/vibes-standalone/${slug}`;

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
      <div className="w-full max-w-4xl">
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
