// src/app/content/[slug]/page.tsx

import fs from "fs"; // Needed for type checking
import path from "path";
import { notFound } from "next/navigation";
import React from "react";
import Link from "next/link";
import "katex/dist/katex.min.css"; // For notes rendering
import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CodeXml, // Icon for HTML type
  NotebookText, // Icon for Notebook type
} from "lucide-react";

// Import *all* necessary functions from the combined library
import {
  formatSlugToTitle,
  // Notebook functions
  getSortedNotebooksData,
  extractNotebookContentAndMetadata,
  getNotebookNavigation,
  // HTML Page ("Vibe") functions (assuming single file structure)
  getSortedHtmlPagesData,
  extractMetadataFromHtmlFile,
  getHtmlPageNavigation,
  getHtmlCodeForPrefill,
  // Common/Shared
  // Types (optional if only used here)
} from "@/lib/content"; // Adjust path if needed

// Import other dependencies
import { MarkdownRenderer } from "@/components/MarkdownRenderer"; // For notes
import { formatDate } from "@/lib/date";
import { ColabIcon, CodePenIcon } from "@/components/Icons"; // Icons for both types
import { buildPageMetadata } from "@/lib/metadata";

// --- Define Base Directories (Ensure these match your contentProcessor lib) ---
// Example paths - adjust as necessary
const NOTEBOOKS_DIR = path.resolve(process.cwd(), "../contents");
const HTML_PAGES_BASE_DIR = path.join(process.cwd(), "public", "standalone"); // Using the single-file structure

// --- Helper Function to Determine Content Type and Basic Metadata ---
async function identifyContentTypeAndMeta(slug: string): Promise<{
  type: "notebook" | "htmlPage" | "notFound";
  title: string;
  description?: string; // Optional description for metadata
}> {
  const notebookPath = path.join(NOTEBOOKS_DIR, `${slug}.ipynb`);
  if (fs.existsSync(notebookPath)) {
    const noteData = extractNotebookContentAndMetadata(slug); // Fetch note data
    const title = noteData?.extractedTitle || formatSlugToTitle(slug);
    const description = `Detailed notes on '${title}'. Explore insights and technical learnings from Sanagi Labs.`;
    return { type: "notebook", title, description };
  }

  const htmlPath = path.join(HTML_PAGES_BASE_DIR, `${slug}.html`);
  if (fs.existsSync(htmlPath)) {
    const { title: extractedTitle } = await extractMetadataFromHtmlFile(
      htmlPath
    );
    const title = extractedTitle || formatSlugToTitle(slug);
    const description = `Explore '${title}', an interactive demo/vibe presented by Sanagi Labs.`;
    return { type: "htmlPage", title, description };
  }

  return { type: "notFound", title: formatSlugToTitle(slug) }; // Fallback title if not found
}

// --- generateStaticParams: Combine slugs from both sources ---
export async function generateStaticParams() {
  const notes = getSortedNotebooksData();
  const htmlPages = await getSortedHtmlPagesData(); // Ensure this uses the single-file logic

  const noteParams = notes.map((note) => ({ slug: note.slug }));
  const htmlPageParams = htmlPages.map((page) => ({ slug: page.slug }));

  // Assuming slugs are unique across types
  return [...noteParams, ...htmlPageParams];
}

// --- Props Definition ---
type Props = {
  params: { slug: string }; // No longer a Promise here directly
};

// --- generateMetadata: Use helper to determine type and fetch title ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const { type, title, description } = await identifyContentTypeAndMeta(slug);

  if (type === "notFound") {
    console.error(
      `Metadata generation failed: Content not found for slug "${slug}"`
    );
    notFound(); // Trigger 404 if type cannot be determined
  }

  const pagePath = `/content/${slug}`; // Use the combined route path
  const ogType = type === "notebook" ? "article" : "website"; // Adjust OG type

  return buildPageMetadata({
    title: title,
    description:
      description || `Explore content related to ${title} from Sanagi Labs.`, // Fallback desc
    pagePath: pagePath,
    ogType: ogType,
  });
}

// --- Main Page Component ---
export default async function ContentPage({ params }: Props) {
  const { slug } = params;

  // --- Determine type and fetch specific data ---
  const notebookPath = path.join(NOTEBOOKS_DIR, `${slug}.ipynb`);
  const htmlPath = path.join(HTML_PAGES_BASE_DIR, `${slug}.html`);

  let contentType: "notebook" | "htmlPage" | "notFound" = "notFound";
  let pageData: any = null; // Use 'any' for simplicity, or define a union type
  let navigation: { prev: any; next: any } = { prev: null, next: null };

  // Check for Notebook
  if (fs.existsSync(notebookPath)) {
    contentType = "notebook";
    const noteData = extractNotebookContentAndMetadata(slug);
    if (!noteData) notFound(); // Should ideally not happen if file exists, but check anyway
    pageData = noteData;
    navigation = getNotebookNavigation(slug);
  }
  // Check for HTML Page (Vibe)
  else if (fs.existsSync(htmlPath)) {
    contentType = "htmlPage";
    const metadata = await extractMetadataFromHtmlFile(htmlPath);
    const prefill = await getHtmlCodeForPrefill(slug);
    pageData = { ...metadata, prefill }; // Combine metadata and prefill data
    navigation = await getHtmlPageNavigation(slug); // Fetch HTML page navigation
  }
  // If neither exists
  else {
    notFound();
  }

  // --- Prepare common variables ---
  const displayTitle =
    (contentType === "notebook" ? pageData.extractedTitle : pageData.title) ||
    formatSlugToTitle(slug);
  const updatedDate =
    contentType === "notebook" ? pageData.metadata?.updated : pageData.updated;
  const formattedDate = formatDate(updatedDate);
  const { prev, next } = navigation;

  // --- Prepare type-specific variables ---
  let colabUrl: string | null = null;
  let iframeSrc: string | null = null;
  let jsonStringData: string | null = null; // For CodePen

  if (contentType === "notebook") {
    const GITHUB_USERNAME = "taijusanagi"; // Consider making these env vars
    const REPO_NAME = "labs";
    const BRANCH = "main";
    const NOTEBOOK_DIR_PATH = "notes/jupyter";
    colabUrl = `https://colab.research.google.com/github/${GITHUB_USERNAME}/${REPO_NAME}/blob/${BRANCH}/${NOTEBOOK_DIR_PATH}/${slug}.ipynb`;
  } else if (contentType === "htmlPage") {
    iframeSrc = `/standalone/${slug}.html`; // Adjust path for single file serving

    // Prepare CodePen data
    const { htmlBodyContent, css, js, js_external } = pageData.prefill;
    if (htmlBodyContent || css || js || js_external) {
      const prefillData = {
        title: displayTitle,
        html: htmlBodyContent || "",
        css: css || "",
        js: js || "",
        js_external: js_external || "",
      };
      try {
        jsonStringData = JSON.stringify(prefillData);
      } catch (e) {
        console.error("Failed to stringify prefill data for CodePen:", e);
      }
    }
  }

  // --- Render Page ---
  return (
    <div className="w-full flex flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full max-w-4xl">
        {/* --- Top Nav (Back Link to combined index) --- */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/" // Link back to the combined index page
            className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 ease-in-out group"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <article className="mb-16">
          {/* --- Page Header (Common structure) --- */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-3 transition-colors duration-300 ease-in-out">
              {displayTitle}
            </h1>
            {/* Header Meta Row */}
            <div className="flex justify-between items-center flex-wrap gap-y-2 text-sm text-neutral-500 dark:text-neutral-400 transition-colors duration-300 ease-in-out">
              {/* Date Display */}
              <div className="flex items-center">
                {formattedDate && (
                  <CalendarDays className="w-4 h-4 mr-1.5 opacity-80" />
                )}
                {formattedDate ? (
                  <span>{formattedDate}</span>
                ) : (
                  <span className="h-[20px] inline-block"></span> /* Placeholder for spacing */
                )}
                {/* Content Type Indicator */}
                <span className="mx-2 text-neutral-300 dark:text-neutral-600">
                  |
                </span>
                {contentType === "notebook" ? (
                  <NotebookText className="w-4 h-4 mr-1.5 opacity-80" />
                ) : (
                  <CodeXml className="w-4 h-4 mr-1.5 opacity-80" />
                )}
                <span>{contentType === "notebook" ? "Note" : "Demo"}</span>
              </div>

              {/* Action Button (Colab or CodePen) */}
              <div>
                {contentType === "notebook" && colabUrl && (
                  <Link
                    href={colabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2.5 py-1 rounded-md border border-transparent bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700/90 hover:border-neutral-300 dark:hover:border-neutral-600/80 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-300 ease-in-out shadow-sm"
                    aria-label="Open notebook in Google Colab"
                  >
                    <ColabIcon className="w-5 h-5 mr-1.5 transform -translate-y-[-0.5px]" />
                    Open in Colab
                  </Link>
                )}
                {contentType === "htmlPage" && jsonStringData && (
                  <form
                    action="https://codepen.io/pen/define"
                    method="POST"
                    target="_blank"
                    className="inline-block"
                  >
                    <input type="hidden" name="data" value={jsonStringData} />
                    <button
                      type="submit"
                      className="inline-flex items-center px-2.5 py-1 rounded-md border border-transparent bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700/90 hover:border-neutral-300 dark:hover:border-neutral-600/80 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-300 ease-in-out shadow-sm cursor-pointer"
                      aria-label="Create a new CodePen with this vibe's code"
                    >
                      <CodePenIcon className="w-5 h-5 mr-1.5" />
                      Open in CodePen
                    </button>
                  </form>
                )}
              </div>
            </div>
          </header>

          {/* --- Conditional Main Content --- */}
          {contentType === "notebook" && (
            <MarkdownRenderer content={pageData.content} />
          )}
          {contentType === "htmlPage" && iframeSrc && (
            <div className="mt-8">
              <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-neutral-100 dark:bg-neutral-900">
                <iframe
                  src={iframeSrc}
                  title={displayTitle}
                  className="w-full h-full block border-0"
                  loading="lazy"
                  // sandbox="allow-scripts" // Consider security needs
                />
              </div>
            </div>
          )}
        </article>

        {/* --- Revised Bottom Navigation Section (Common structure) --- */}
        {(prev || next) && (
          <nav className="w-full pt-6 border-t border-neutral-200 dark:border-neutral-700/80 flex justify-between items-start gap-6 sm:gap-8">
            {/* Previous Link Area */}
            <div className="flex-1 text-left">
              {prev && (
                <Link
                  href={`/content/${prev.slug}`} // Use combined route path
                  className="group inline-block"
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300 ease-in-out block mb-1">
                    <ChevronLeft className="inline w-4 h-4 mr-1 align-text-bottom" />
                    Previous
                  </span>
                  <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300 ease-in-out block">
                    {prev.title || formatSlugToTitle(prev.slug)}
                  </span>
                </Link>
              )}
            </div>
            {/* Next Link Area */}
            <div className="flex-1 text-right">
              {next && (
                <Link
                  href={`/content/${next.slug}`} // Use combined route path
                  className="group inline-block"
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300 ease-in-out block mb-1">
                    Next
                    <ChevronRight className="inline w-4 h-4 ml-1 align-text-bottom" />
                  </span>
                  <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300 ease-in-out block">
                    {next.title || formatSlugToTitle(next.slug)}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}
        {/* ---------------------------------------- */}
      </div>
    </div>
  );
}
