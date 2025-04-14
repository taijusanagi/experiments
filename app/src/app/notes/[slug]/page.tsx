// app/notes/[slug]/page.tsx
import path from "path";
import fs from "fs";
import { notFound } from "next/navigation";
import React from "react";
import Link from "next/link"; // Import Link for navigation
import "katex/dist/katex.min.css";
import type { Metadata, ResolvingMetadata } from "next"; // Import Metadata type

import MarkdownRenderer from "@/components/MarkdownRenderer"; // Keep using client component for markdown
import {
  getSortedNotesData,
  formatSlugToTitle,
  extractMarkdownContentAndMetadata,
} from "@/lib/notes"; // Import helpers

// Resolve the notes directory relative to the current working directory
const notesDirectory = path.resolve(process.cwd(), "../notes/src"); // Adjust if your notes are elsewhere relative to root

// Use the helper for generateStaticParams
export async function generateStaticParams() {
  const notes = getSortedNotesData();
  return notes.map((note) => ({
    slug: note.slug,
  }));
}

// --- Generate Metadata for Page Title ---
type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata // Optional: Access parent metadata
): Promise<Metadata> {
  const slug = params.slug;
  const pageTitle = formatSlugToTitle(slug);

  // Optional: You could fetch more metadata here if needed (e.g., description)
  // const { metadata } = extractMarkdownContentAndMetadata(path.join(notesDirectory, `${slug}.ipynb`)) || {};

  return {
    title: `${pageTitle} | Sanagi Labs`, // Sets the <title> tag (e.g., "My Note Title | Your Site Name")
    // description: metadata?.description || 'Default description', // Example
  };
}
// ---------------------------------------

// Helper function to get navigation links
function getNavigation(slug: string): {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
} {
  const allNotes = getSortedNotesData();
  const currentIndex = allNotes.findIndex((note) => note.slug === slug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? allNotes[currentIndex - 1] : null;
  const next =
    currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null;

  // Ensure titles are formatted correctly for display in navigation
  return {
    prev: prev
      ? { slug: prev.slug, title: formatSlugToTitle(prev.slug) }
      : null,
    next: next
      ? { slug: next.slug, title: formatSlugToTitle(next.slug) }
      : null,
  };
}

export default async function NotebookPage({ params }: Props) {
  const slug = params.slug;
  const notebookPath = path.join(notesDirectory, `${slug}.ipynb`);

  let content: string | null = null;
  let updated: string | null = null;
  try {
    if (fs.existsSync(notebookPath)) {
      const result = extractMarkdownContentAndMetadata(notebookPath);
      content = result?.content || null;
      updated = result?.metadata.updated || null;
    } else {
      console.error(`Notebook file not found at: ${notebookPath}`);
    }
  } catch (error) {
    console.error(`Error processing notebook ${slug}:`, error);
  }

  if (!content) {
    notFound();
  }

  const { prev, next } = getNavigation(slug);
  const pageTitle = formatSlugToTitle(slug); // Get title for display in H1

  return (
    // Outer container for centering and padding
    <div className="w-full flex flex-col items-center px-4 py-8 md:py-12">
      {/* Main content article */}
      <article className="w-full max-w-3xl mb-12">
        {" "}
        {/* Markdown Content with Prose styling */}
        {/* Apply prose classes for automatic typography styling */}
        <div className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none">
          {/* max-w-none within prose allows content like images/code blocks to break out if needed */}
          <MarkdownRenderer content={content} />
        </div>
      </article>

      {/* Navigation Section */}
      {(prev || next) && (
        <nav className="w-full max-w-3xl border-t dark:border-neutral-700 pt-6 flex justify-between items-start">
          {" "}
          {/* Use items-start for alignment */}
          {/* Previous Link */}
          <div className="flex-1 pr-2">
            {" "}
            {/* Add padding-right */}
            {prev && (
              <Link href={`/notes/${prev.slug}`} className="group block">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors block mb-1">
                  ← Previous
                </span>
                <span className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors block">
                  {prev.title}
                </span>
              </Link>
            )}
          </div>
          {/* Next Link */}
          <div className="flex-1 pl-2 text-right">
            {" "}
            {/* Add padding-left */}
            {next && (
              <Link href={`/notes/${next.slug}`} className="group block">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors block mb-1">
                  Next →
                </span>
                <span className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors block">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
