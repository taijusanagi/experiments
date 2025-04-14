// app/notes/[slug]/page.tsx
import path from "path";
import fs from "fs";
import { notFound } from "next/navigation";
import React from "react";
import Link from "next/link";
import "katex/dist/katex.min.css";
import type { Metadata, ResolvingMetadata } from "next";
import { ArrowLeft, CalendarDays } from "lucide-react"; // Import icons

import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  getSortedNotesData, // Keep for generateStaticParams
  getNavigation, // Keep for bottom nav
  formatSlugToTitle, // Keep as fallback and for metadata
  extractMarkdownContentAndMetadata, // Now returns title too
} from "@/lib/notes";

const notesDirectory = path.resolve(process.cwd(), "../notes/src");

export async function generateStaticParams() {
  const notes = getSortedNotesData();
  return notes.map((note) => ({
    slug: note.slug,
  }));
}

type Props = {
  params: { slug: string };
};

// Metadata generation - using slug-based title for simplicity here
// as fetching real title requires reading file again.
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  // Use the reliable slug-based title for the <title> tag
  const pageTitleForMetadata = formatSlugToTitle(slug);
  // You could potentially try/catch fetching the real title here if performance allows
  return {
    title: `${pageTitleForMetadata} | Sanagi Labs`,
  };
}

// Helper function to format date (can move to a utils file later)
function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", // Use long month name
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return null;
  }
}

export default async function NotebookPage({ params }: Props) {
  const slug = params.slug;
  const notebookPath = path.join(notesDirectory, `${slug}.ipynb`);

  // Fetch content, metadata, and extracted title
  const noteData = extractMarkdownContentAndMetadata(notebookPath);

  if (!noteData) {
    notFound(); // Trigger 404 if data extraction fails
  }

  const { content, metadata, extractedTitle } = noteData;
  const updatedDate = metadata.updated || null; // Get updated date
  const formattedDate = formatDate(updatedDate); // Format the date

  // Use extracted title if available, otherwise fallback to slug-based title
  const displayTitle = extractedTitle || formatSlugToTitle(slug);

  // Get navigation links (now with real titles from getNavigation)
  const { prev, next } = getNavigation(slug);

  return (
    // Outer container for centering and padding
    <div className="w-full flex flex-col items-center px-4 py-8 md:py-12">
      {/* Container for Top Nav + Article */}
      <div className="w-full max-w-3xl">
        {/* --- Top Navigation: Back Link --- */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/notes" // Link back to the notes index
            className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Notes
          </Link>
        </div>
        {/* -------------------------------- */}

        {/* Main content article */}
        {/* Add more bottom margin for separation */}
        <article className="mb-16">
          {/* --- Page Header: Title and Date --- */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-3">
              {displayTitle}
            </h1>
            {formattedDate && (
              <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                <CalendarDays className="w-4 h-4 mr-1.5 opacity-80" />
                <span>Updated on {formattedDate}</span>
              </div>
            )}
          </header>
          {/* ---------------------------------- */}

          {/* Markdown Content with Prose styling */}
          <div className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none">
            {/* Render the full content */}
            <MarkdownRenderer content={content} />
          </div>
        </article>

        {/* Bottom Navigation Section */}
        {(prev || next) && (
          <nav className="w-full border-t dark:border-neutral-700 pt-8 flex flex-col sm:flex-row justify-between items-stretch gap-6">
            {/* Previous Link */}
            <div className="flex-1">
              {" "}
              {/* Ensure it takes space even if empty */}
              {prev && (
                <Link
                  href={`/notes/${prev.slug}`}
                  className="group block p-4 rounded-md border dark:border-neutral-700 hover:border-teal-500 dark:hover:border-teal-600 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 transition-all h-full"
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                    ← Previous
                  </span>
                  {/* Use the real title fetched by getNavigation */}
                  <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors block">
                    {prev.title}
                  </span>
                </Link>
              )}
            </div>

            {/* Next Link */}
            <div className="flex-1 text-right">
              {" "}
              {/* Ensure it takes space even if empty */}
              {next && (
                <Link
                  href={`/notes/${next.slug}`}
                  className="group block p-4 rounded-md border dark:border-neutral-700 hover:border-teal-500 dark:hover:border-teal-600 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 transition-all h-full"
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                    Next →
                  </span>
                  {/* Use the real title fetched by getNavigation */}
                  <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors block">
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>{" "}
      {/* End Container for Top Nav + Article */}
    </div> // End Outer container
  );
}
