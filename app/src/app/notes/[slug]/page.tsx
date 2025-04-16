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

import { MarkdownRenderer } from "@/components/MarkdownRenderer";

import {
  getSortedNotesData,
  getNavigation,
  formatSlugToTitle,
  extractMarkdownContentAndMetadata,
} from "@/lib/notes";
import { formatDate } from "@/lib/utils";
import { ColabIcon } from "@/components/ColabIcon";
import { buildPageMetadata } from "@/lib/metadata";

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
  const { slug } = await params; // Removed await as params is likely not a Promise here
  const notebookPath = path.join(notesDirectory, `${slug}.ipynb`);
  const noteData = extractMarkdownContentAndMetadata(notebookPath);

  if (!noteData) {
    // Consider logging an error before calling notFound if helpful
    console.error(
      `Metadata generation failed: No note data found for slug "${slug}"`
    );
    notFound();
  }

  const titleForMeta = noteData.extractedTitle || formatSlugToTitle(slug);
  // Use noteData.excerpt for description if available and preferred, otherwise generate one
  const pageDescription = `Detailed notes on '${titleForMeta}'. Explore insights and technical learnings from Sanagi Labs.`;
  const pagePath = `/notes/${slug}`;

  return buildPageMetadata({
    title: titleForMeta,
    description: pageDescription,
    pagePath: pagePath,
    ogType: "article", // Specific type for notes
  });
}

export default async function NotebookPage({ params }: Props) {
  const { slug } = await params;
  // ... (data fetching logic remains the same) ...
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

  const GITHUB_USERNAME = "taijusanagi";
  const REPO_NAME = "labs";
  const BRANCH = "main";
  const NOTEBOOK_DIR_PATH = "notes/jupyter";
  const colabUrl = `https://colab.research.google.com/github/${GITHUB_USERNAME}/${REPO_NAME}/blob/${BRANCH}/${NOTEBOOK_DIR_PATH}/${slug}.ipynb`;

  return (
    <div className="w-full flex flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full max-w-4xl">
        {/* --- Top Nav (Back Link) --- */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/notes"
            className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 ease-in-out group" // Standardized transition, removed translate
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {/* Keep transform only on icon if desired */}
            Back to Notes
          </Link>
        </div>

        <article className="mb-16">
          {/* --- Page Header --- */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-3 transition-colors duration-300 ease-in-out">
              {" "}
              {/* Added transition */}
              {displayTitle}
            </h1>
            <div className="flex justify-between items-center flex-wrap gap-y-2 text-sm text-neutral-500 dark:text-neutral-400 transition-colors duration-300 ease-in-out">
              {" "}
              {/* Added transition */}
              {formattedDate && (
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1.5 opacity-80" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {!formattedDate && <div></div>} {/* Keep for spacing */}
              {/* --- Open in Colab Link/Button --- */}
              <Link
                href={colabUrl}
                target="_blank"
                rel="noopener noreferrer"
                // Key classes for internal alignment: inline-flex items-center
                className="inline-flex items-center px-2.5 py-1 rounded-md border border-transparent
                          bg-neutral-100 dark:bg-neutral-800/80
                          hover:bg-neutral-200 dark:hover:bg-neutral-700/90
                          hover:border-neutral-300 dark:hover:border-neutral-600/80
                          text-neutral-700 dark:text-neutral-300
                          hover:text-neutral-900 dark:hover:text-neutral-100
                          transition-all duration-300 ease-in-out shadow-sm"
                aria-label="Open notebook in Google Colab"
              >
                {/* Pass size and margin class, NO align-text-bottom needed here */}
                <ColabIcon className="w-5 h-5 mr-1.5 transform -translate-y-[-0.5px]" />
                Open in Colab
              </Link>
            </div>
          </header>

          {/* --- Markdown Content --- */}
          <MarkdownRenderer content={content} />
        </article>

        {/* --- Revised Bottom Navigation Section --- */}
        {(prev || next) && (
          <nav className="w-full pt-6 flex justify-between items-start gap-6 sm:gap-8">
            {/* Previous Link Area */}
            <div className="flex-1 text-left">
              {prev && (
                <Link
                  href={`/notes/${prev.slug}`}
                  // Removed: p-2 -m-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors
                  className="group inline-block"
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300 ease-in-out block mb-1">
                    <ChevronLeft className="inline w-4 h-4 mr-1 align-text-bottom" />
                    Previous
                  </span>
                  <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300 ease-in-out block">
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
                  // Removed: p-2 -m-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors
                  className="group inline-block"
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300 ease-in-out block mb-1">
                    Next
                    <ChevronRight className="inline w-4 h-4 ml-1 align-text-bottom" />
                  </span>
                  <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300 ease-in-out block">
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
