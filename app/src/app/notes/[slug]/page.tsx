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
  const siteName = "Sanagi Labs"; // Define siteName
  const baseUrl = "https://taijusanagi.com"; // Replace with your actual domain

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
  const pageDescription = `Read the note '${titleForMeta}' on ${siteName}.`;
  const pageUrl = `${baseUrl}/notes/${slug}`;
  const ogImageUrl = `${baseUrl}/ogp/${slug}.png`; // Assumes OGP image exists

  return {
    title: `${titleForMeta} | ${siteName}`, // Full title for browser tab
    description: pageDescription, // *** Corrected semicolon to comma here ***
    openGraph: {
      title: titleForMeta, // Title shown in social previews
      description: pageDescription,
      url: pageUrl,
      siteName: siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${titleForMeta} OGP Image`,
        },
      ],
      locale: "en_US", // Optional
      type: "article", // 'article' is suitable for notes/blog posts
      // Optional: Add author, published_time etc. if available in noteData.metadata
      // publishedTime: noteData.metadata?.updated || noteData.metadata?.created || undefined,
      // authors: ['Taiju Sanagi'], // Or fetch from metadata
    },
    twitter: {
      card: "summary_large_image",
      title: titleForMeta, // Title for Twitter card
      description: pageDescription,
      images: [ogImageUrl], // Image for Twitter card
      // creator: "@YourTwitterHandle", // Optional
    },
    // alternates: { // Optional: Add canonical URL
    //   canonical: pageUrl,
    // },
  };
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
  const REPO_NAME = "sanagi-labs";
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
                className="inline-flex items-center px-2.5 py-1 rounded-md border border-transparent
                           bg-neutral-100 dark:bg-neutral-800/80
                           hover:bg-neutral-200 dark:hover:bg-neutral-700/90
                           hover:border-neutral-300 dark:hover:border-neutral-600/80
                           text-neutral-700 dark:text-neutral-300
                           hover:text-neutral-900 dark:hover:text-neutral-100
                           transition-all duration-300 ease-in-out shadow-sm" // Added border on hover, standardized transition
                aria-label="Open notebook in Google Colab"
              >
                <ColabIcon />
                Open in Colab
              </Link>
            </div>
          </header>

          {/* --- Markdown Content --- */}
          {/* Assuming prose styles handle internal transitions if any */}
          <div className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none">
            <MarkdownRenderer content={content} />
          </div>
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
