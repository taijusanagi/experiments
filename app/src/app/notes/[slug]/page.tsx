// app/notes/[slug]/page.tsx
import path from "path";
import fs from "fs";
import { notFound } from "next/navigation";
import React from "react";
import Link from "next/link"; // Import Link for navigation
import "katex/dist/katex.min.css";

import MarkdownRenderer from "@/components/MarkdownRenderer"; // Keep using client component for markdown
import {
  getSortedNotesData,
  formatSlugToTitle,
  convertNotebookToMarkdown,
} from "@/lib/notes"; // Import helpers

// Resolve the notes directory relative to the current working directory
const notesDirectory = path.resolve(process.cwd(), "../notes/src");

// Use the helper for generateStaticParams
export async function generateStaticParams() {
  const notes = getSortedNotesData();
  return notes.map((note) => ({
    slug: note.slug,
  }));
}

// Helper function to get navigation links
function getNavigation(slug: string): {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
} {
  const allNotes = getSortedNotesData();
  const currentIndex = allNotes.findIndex((note) => note.slug === slug);

  if (currentIndex === -1) {
    // Should not happen if generateStaticParams is correct, but good practice
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? allNotes[currentIndex - 1] : null;
  const next =
    currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null;

  return { prev, next };
}

export default async function NotebookPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const notebookPath = path.join(notesDirectory, `${slug}.ipynb`); // Use resolved directory

  let content: string | null = null;
  try {
    if (fs.existsSync(notebookPath)) {
      content = convertNotebookToMarkdown(notebookPath);
    } else {
      console.error(`Notebook file not found at: ${notebookPath}`);
    }
  } catch (error) {
    console.error(`Error processing notebook ${slug}:`, error);
  }

  if (!content) {
    notFound();
  }

  // Get previous/next note data
  const { prev, next } = getNavigation(slug);
  const pageTitle = formatSlugToTitle(slug);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Markdown Content Rendered by Client Component */}
      {/* Ensure MarkdownRenderer uses max-w-none or similar if you want it wider */}
      <div className="w-full max-w-4xl">
        {" "}
        {/* Adjust max-width as needed */}
        <MarkdownRenderer content={content} title={pageTitle} />
      </div>

      {/* Navigation Section */}
      {(prev || next) && ( // Only render nav if there's a prev or next link
        <nav className="mt-12 mb-6 w-full max-w-4xl border-t dark:border-neutral-700 pt-6 flex justify-between items-center px-4">
          <div>
            {prev && (
              <Link href={`/notes/${prev.slug}`}>
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  ← Previous
                  <span className="block text-lg font-semibold text-neutral-800 dark:text-neutral-200 hover:text-teal-700 dark:hover:text-teal-300">
                    {prev.title}
                  </span>
                </span>
              </Link>
            )}
          </div>
          <div className="text-right">
            {next && (
              <Link href={`/notes/${next.slug}`}>
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Next →
                  <span className="block text-lg font-semibold text-neutral-800 dark:text-neutral-200 hover:text-teal-700 dark:hover:text-teal-300">
                    {next.title}
                  </span>
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
