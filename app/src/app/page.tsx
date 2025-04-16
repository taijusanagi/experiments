// src/app/page.tsx
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRightSquare,
  BookOpenText,
  CalendarDays,
  CodeXml,
  NotebookText,
} from "lucide-react";

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
  description:
    "Playing with AI/ML: Explore Taiju Sanagi's experiments, interactive bits, and dev notes.",
  pagePath: "/",
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
    iframeSrc: `/standalone/${page.slug}`,
    detailUrl: `/${page.slug}`,
  }));

  const notebookItems: ContentItem[] = notebooks.map((note) => ({
    type: "notebook",
    slug: note.slug,
    title: note.title,
    updated: note.updated,
    excerpt: note.excerpt,
    detailUrl: `/${note.slug}`,
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
    <div className="w-full max-w-6xl mx-auto px-4 py-10 md:py-16">
      {allContent.length === 0 ? (
        <p className="text-center text-neutral-500">No content found yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allContent.map((item) => {
            const formattedDate = formatDate(item.updated);
            const uniqueKey = `${item.type}-${item.slug}`;

            return (
              <Link
                href={item.detailUrl}
                key={uniqueKey}
                className="group relative flex flex-col justify-between p-5 rounded-md border bg-neutral-900 border-neutral-800 shadow-lg shadow-black/20 hover:border-teal-600/70 hover:bg-neutral-900/95 transition-all duration-200 ease-in-out overflow-hidden"
              >
                <div>
                  <div className="absolute top-3 right-3 flex items-center text-xs px-1.5 py-0.5 rounded bg-teal-950/70 text-teal-300 group-hover:bg-teal-900/80 transition-colors">
                    {item.type === "htmlPage" ? (
                      <CodeXml className="w-3 h-3 mr-1 flex-shrink-0 opacity-80" />
                    ) : (
                      <NotebookText className="w-3 h-3 mr-1 flex-shrink-0 opacity-80" />
                    )}
                    {item.type === "htmlPage" ? "Demo" : "Note"}
                  </div>
                  <h2 className="text-lg font-medium mb-1 pr-16 text-neutral-100 group-hover:text-teal-400 transition-colors duration-200 ease-in-out">
                    {item.title}
                  </h2>
                  {formattedDate && (
                    <div className="flex items-center text-xs text-neutral-500 mb-3">
                      <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-60 flex-shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {item.type === "htmlPage" && item.iframeSrc && (
                    <div className="w-full aspect-video bg-black/20 overflow-hidden rounded-sm mb-4 border border-neutral-800 group-hover:border-neutral-700 transition-colors">
                      <iframe
                        src={item.iframeSrc}
                        title={`${item.title} preview`}
                        className="block w-full h-full border-0 transform scale-100 transition-transform duration-300 ease-in-out group-hover:scale-105 pointer-events-none"
                        loading="lazy"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  {item.type === "notebook" && item.excerpt && (
                    <p className="text-sm text-neutral-400 mt-2 mb-4 leading-relaxed">
                      {item.excerpt}
                    </p>
                  )}
                </div>
                <div className="flex items-center text-sm font-medium text-teal-500 group-hover:text-teal-400 transition-colors duration-200 ease-in-out mt-auto pt-2">
                  {item.type === "htmlPage" ? (
                    <>
                      <ArrowUpRightSquare className="w-4 h-4 mr-1.5 opacity-70 flex-shrink-0" />
                      View Demo
                    </>
                  ) : (
                    <>
                      <BookOpenText className="w-4 h-4 mr-1.5 opacity-70 flex-shrink-0" />
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
