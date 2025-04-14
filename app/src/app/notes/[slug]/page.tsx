// app/notes/[slug]/page.tsx
import path from "path";
import { notFound } from "next/navigation";
import React from "react";
import Link from "next/link";
import "katex/dist/katex.min.css";
import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  getSortedNotesData,
  getNavigation,
  formatSlugToTitle,
  extractMarkdownContentAndMetadata,
} from "@/lib/notes";

const notesDirectory = path.resolve(process.cwd(), "../notes/jupyter");

// --- generateStaticParams, generateMetadata, formatDate (remain the same) ---
export async function generateStaticParams() {
  const notes = getSortedNotesData();
  return notes.map((note) => ({
    slug: note.slug,
  }));
}
type Props = {
  params: Promise<{ slug: string }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageTitleForMetadata = formatSlugToTitle(slug);
  return {
    title: `${pageTitleForMetadata} | Sanagi Labs`,
  };
}
function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return null;
  }
}

// --- Simple Colab SVG Icon Component (remains the same) ---
const ColabIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 350 350"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-1.5 align-text-bottom"
  >
    <path
      d="M175 350C271.65 350 350 271.65 350 175C350 78.3502 271.65 0 175 0C78.3502 0 0 78.3502 0 175C0 271.65 78.3502 350 175 350Z"
      fill="#FBC02D"
    ></path>
    <path
      d="M175 281.25C234.226 281.25 281.25 234.226 281.25 175C281.25 115.774 234.226 68.75 175 68.75C115.774 68.75 68.75 115.774 68.75 175C68.75 234.226 115.774 281.25 175 281.25Z"
      fill="#fff"
    ></path>
    <path
      d="M175 237.5C209.518 237.5 237.5 209.518 237.5 175C237.5 140.482 209.518 112.5 175 112.5C140.482 112.5 112.5 140.482 112.5 175C112.5 209.518 140.482 237.5 175 237.5Z"
      fill="#E65100"
    ></path>
  </svg>
);
// ----------------------------------------

export default async function NotebookPage({ params }: Props) {
  const { slug } = await params;
  const notebookPath = path.join(notesDirectory, `${slug}.ipynb`);
  const noteData = extractMarkdownContentAndMetadata(notebookPath);

  if (!noteData) {
    notFound();
  }

  const { content, metadata, extractedTitle } = noteData;
  const updatedDate = metadata.updated || null;
  const formattedDate = formatDate(updatedDate);
  const displayTitle = extractedTitle || formatSlugToTitle(slug);
  const { prev, next } = getNavigation(slug);

  // --- Construct the Colab URL ---
  // **UPDATED GITHUB_USERNAME**
  const GITHUB_USERNAME = "taijusanagi";
  const REPO_NAME = "sanagi-labs"; // Keep this as is, or adjust if needed
  const BRANCH = "main";
  const NOTEBOOK_DIR_PATH = "notes/jupyter"; // Path from repo root
  const colabUrl = `https://colab.research.google.com/github/${GITHUB_USERNAME}/${REPO_NAME}/blob/${BRANCH}/${NOTEBOOK_DIR_PATH}/${slug}.ipynb`;
  // --------------------------------

  return (
    <div className="w-full flex flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full max-w-4xl">
        {/* --- Top Nav (Back Link) --- */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/notes"
            className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Notes
          </Link>
        </div>

        <article className="mb-16">
          {/* --- Page Header --- */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-3">
              {displayTitle}
            </h1>
            {/* --- UPDATED: Date and Colab Link Container --- */}
            {/* Use flex, justify-between, items-center */}
            <div className="flex justify-between items-center flex-wrap gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              {formattedDate && (
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1.5 opacity-80" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {/* If no date, add an empty div to maintain justify-between spacing */}
              {!formattedDate && <div></div>}

              {/* --- Open in Colab Link/Button (styling unchanged) --- */}
              <Link
                href={colabUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors shadow-sm"
                aria-label="Open notebook in Google Colab"
              >
                <ColabIcon />
                Open in Colab
              </Link>
              {/* ---------------------------------------- */}
            </div>
            {/* ------------------------------------ */}
          </header>

          {/* --- Markdown Content --- */}
          <div className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none">
            <MarkdownRenderer content={content} />
          </div>
        </article>

        {/* --- Revised Bottom Navigation Section (remains the same) --- */}
        {(prev || next) && (
          <nav className="w-full pt-6 flex justify-between items-start gap-6 sm:gap-8">
            {/* Previous Link Area */}
            <div className="flex-1 text-left">
              {prev && (
                <Link
                  href={`/notes/${prev.slug}`}
                  className="group inline-block"
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors block mb-1">
                    <ChevronLeft className="inline w-4 h-4 mr-1 align-text-bottom" />
                    Previous
                  </span>
                  <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors block">
                    {prev.title}
                  </span>
                </Link>
              )}
            </div>
            {/* Next Link Area */}
            <div className="flex-1 text-right">
              {next && (
                <Link
                  href={`/notes/${next.slug}`}
                  className="group inline-block"
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors block mb-1">
                    Next
                    <ChevronRight className="inline w-4 h-4 ml-1 align-text-bottom" />
                  </span>
                  <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors block">
                    {next.title}
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
