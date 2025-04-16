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
        <p className="text-center text-neutral-500 italic">
          Nothing built yet... watch this space!
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
                className="group relative flex flex-col justify-between p-5 rounded-lg border bg-neutral-900/70 border-neutral-800/80 shadow-lg shadow-black/30 hover:border-emerald-600/60 hover:bg-neutral-850/80 transition-all duration-300 ease-in-out overflow-hidden transform hover:-translate-y-1 hover:shadow-emerald-900/20"
              >
                <div>
                  <div className="absolute top-3 right-3 flex items-center text-xs px-2 py-0.5 rounded-full border border-emerald-900/70 bg-emerald-950/80 text-emerald-300 group-hover:bg-emerald-900/90 transition-colors font-medium">
                    {item.type === "htmlPage" ? (
                      <CodeXml className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 opacity-80" />
                    ) : (
                      <NotebookText className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 opacity-80" />
                    )}
                    {item.type === "htmlPage" ? "Demo" : "Note"}
                  </div>
                  <h2 className="text-xl font-mono font-bold mb-1.5 pr-16 text-neutral-100 group-hover:text-emerald-300 transition-colors duration-200 ease-in-out tracking-tight">
                    {item.title}
                  </h2>
                  {formattedDate && (
                    <div className="flex items-center text-xs text-neutral-500 mb-4">
                      <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-60 flex-shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {item.type === "htmlPage" && item.iframeSrc && (
                    <div className="w-full aspect-video bg-black/30 overflow-hidden rounded-md mb-4 border border-neutral-700/70 group-hover:border-neutral-600 transition-colors shadow-inner shadow-black/20">
                      <iframe
                        src={item.iframeSrc}
                        title={`${item.title} preview`}
                        className="block w-full h-full border-0 transform scale-100 transition-transform duration-300 ease-in-out group-hover:scale-105 pointer-events-none opacity-90 group-hover:opacity-100"
                        loading="lazy"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  {item.type === "notebook" && item.excerpt && (
                    <p className="text-sm text-neutral-400 mt-2 mb-4 leading-relaxed line-clamp-3 group-hover:text-neutral-300 transition-colors">
                      {item.excerpt}
                    </p>
                  )}
                </div>
                <div className="flex items-center text-sm font-medium text-emerald-500 group-hover:text-emerald-400 transition-colors duration-200 ease-in-out mt-auto pt-2">
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
