// src/app/page.tsx
import React from "react";
import Link from "next/link";
import {
  ArrowUpRightSquare,
  BookOpenText,
  CalendarDays,
  CodeXml,
  NotebookText,
} from "lucide-react";
import type { Metadata } from "next";
import { getSortedHtmlPagesData, getSortedNotebooksData } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { buildPageMetadata } from "@/lib/metadata";

interface ContentItem {
  type: "htmlPage" | "notebook";
  slug: string;
  title: string;
  updated: string | null;
  excerpt?: string | null;
  iframeSrc?: string;
  detailUrl: string;
}

export const metadata: Metadata = buildPageMetadata({
  title: "Content Hub", // Or your preferred site title
  description:
    "Explore interactive demos, technical notes, software experiments, and reflections.",
  pagePath: "/", // Root path
  ogType: "website",
});

export default async function IndexPage() {
  const htmlPages = await getSortedHtmlPagesData();
  const notebooks = getSortedNotebooksData();
  const htmlItems: ContentItem[] = htmlPages.map((page) => ({
    type: "htmlPage",
    slug: page.slug,
    title: page.title,
    updated: page.updated,
    iframeSrc: `/standalone/${page.slug}`, // Updated path for single file
    detailUrl: `/${page.slug}`, // Root level slug
  }));

  const notebookItems: ContentItem[] = notebooks.map((note) => ({
    type: "notebook",
    slug: note.slug,
    title: note.title,
    updated: note.updated,
    excerpt: note.excerpt,
    detailUrl: `/${note.slug}`, // Root level slug
  }));

  const allContent: ContentItem[] = [...htmlItems, ...notebookItems];
  allContent.sort((a, b) => {
    if (a.updated && !b.updated) return -1;
    if (!a.updated && b.updated) return 1;
    if (a.updated && b.updated) {
      const dateComparison =
        new Date(b.updated).getTime() - new Date(a.updated).getTime();
      if (dateComparison !== 0) return dateComparison;
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold mb-10 text-center text-neutral-800 dark:text-neutral-100 transition-colors duration-300 ease-in-out">
        Content Hub
      </h1>
      {allContent.length === 0 ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400 transition-colors duration-300 ease-in-out">
          No content found yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allContent.map((item) => {
            const formattedDate = formatDate(item.updated);
            const uniqueKey = `${item.type}-${item.slug}`;

            return (
              <Link
                href={item.detailUrl}
                key={uniqueKey}
                className="group relative flex flex-col justify-between p-5 rounded-lg border bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700/80 shadow-md hover:border-neutral-300 dark:hover:border-neutral-600/90 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/80 transition-all duration-300 ease-in-out overflow-hidden"
              >
                <div>
                  <div className="absolute top-3 right-3 flex items-center text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700/80 text-neutral-600 dark:text-neutral-300 opacity-80 group-hover:opacity-100 transition-opacity">
                    {item.type === "htmlPage" ? (
                      <CodeXml className="w-3 h-3 mr-1" />
                    ) : (
                      <NotebookText className="w-3 h-3 mr-1" />
                    )}
                    {item.type === "htmlPage" ? "Demo" : "Note"}
                  </div>
                  <h2 className="text-xl font-semibold mb-1 pr-16 text-neutral-800 dark:text-neutral-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300 ease-in-out">
                    {item.title}
                  </h2>
                  {formattedDate && (
                    <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mb-3 transition-colors duration-300 ease-in-out">
                      <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-70 flex-shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {item.type === "htmlPage" && item.iframeSrc && (
                    <div className="w-full aspect-video bg-neutral-100 dark:bg-neutral-900/50 overflow-hidden rounded-md mb-4 shadow-inner dark:shadow-neutral-900/50">
                      <iframe
                        src={item.iframeSrc}
                        title={`${item.title} preview`}
                        className="block w-full h-full border-0 transform transition-transform duration-300 ease-in-out group-hover:scale-105 pointer-events-none"
                        loading="lazy"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  {item.type === "notebook" && item.excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 mb-4 transition-colors duration-300 ease-in-out">
                      {item.excerpt}
                    </p>
                  )}
                </div>
                <div className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 mt-auto pt-2 transition-colors duration-300 ease-in-out">
                  {item.type === "htmlPage" ? (
                    <>
                      <ArrowUpRightSquare className="w-4 h-4 mr-2 opacity-80 flex-shrink-0" />{" "}
                      View Demo
                    </>
                  ) : (
                    <>
                      <BookOpenText className="w-4 h-4 mr-2 opacity-80 flex-shrink-0" />{" "}
                      Read Note
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
