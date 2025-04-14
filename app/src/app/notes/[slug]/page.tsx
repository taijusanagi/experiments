// app/notes/[slug]/page.tsx
import path from "path";
import fs from "fs";
import { notFound } from "next/navigation";
import React from "react";
import Link from "next/link";
import "katex/dist/katex.min.css";
import type { Metadata, ResolvingMetadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"; // Add Chevron icons

import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  getSortedNotesData,
  getNavigation,
  formatSlugToTitle,
  extractMarkdownContentAndMetadata,
} from "@/lib/notes";

const notesDirectory = path.resolve(process.cwd(), "../notes/src");

// --- generateStaticParams, generateMetadata, formatDate (remain the same) ---
export async function generateStaticParams() {
  const notes = getSortedNotesData();
  return notes.map((note) => ({
    slug: note.slug,
  }));
}
type Props = {
  params: { slug: string };
};
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
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

export default async function NotebookPage({ params }: Props) {
  const slug = params.slug;
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

  return (
    <div className="w-full flex flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full max-w-4xl">
        {/* --- Top Nav (Back Link) remains the same --- */}
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
          {/* --- Page Header (Title, Date) remains the same --- */}
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

          {/* --- Markdown Content remains the same --- */}
          <div className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none">
            <MarkdownRenderer content={content} />
          </div>
        </article>

        {/* --- Revised Bottom Navigation Section --- */}
        {(prev || next) && (
          // Remove border-t, adjust padding-top (e.g., pt-6), use items-start for vertical alignment
          <nav className="w-full pt-6 flex justify-between items-start gap-6 sm:gap-8">
            {/* Previous Link Area */}
            <div className="flex-1 text-left">
              {" "}
              {/* Ensure text aligns left */}
              {prev && (
                // Simpler Link: remove card styles (bg, border, padding, rounded, h-full)
                <Link
                  href={`/notes/${prev.slug}`}
                  className="group inline-block"
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors block mb-1">
                    <ChevronLeft className="inline w-4 h-4 mr-1 align-text-bottom" />{" "}
                    {/* Add icon */}
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
              {" "}
              {/* Ensure text aligns right */}
              {next && (
                // Simpler Link: remove card styles
                <Link
                  href={`/notes/${next.slug}`}
                  className="group inline-block"
                >
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors block mb-1">
                    Next
                    <ChevronRight className="inline w-4 h-4 ml-1 align-text-bottom" />{" "}
                    {/* Add icon */}
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
