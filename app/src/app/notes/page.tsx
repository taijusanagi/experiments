// app/notes/page.tsx
import React from "react";
import Link from "next/link";
import { getSortedNotesData } from "@/lib/notes";
import { BookOpenText, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes | Sanagi Labs",
  description: "A collection of notes by Sanagi Labs.",
};

export default function NotesIndexPage() {
  const allNotes = getSortedNotesData();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold mb-10 text-center text-neutral-800 dark:text-neutral-100 transition-colors duration-300 ease-in-out">
        {" "}
        {/* Added transition */}
        Notes
      </h1>
      {allNotes.length === 0 ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400 transition-colors duration-300 ease-in-out">
          {" "}
          {/* Added transition */}
          No notes found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allNotes.map(({ slug, title, updated, excerpt }) => {
            const formattedDate = formatDate(updated);

            return (
              <Link
                href={`/notes/${slug}`}
                key={slug}
                className="group flex flex-col justify-between p-5 rounded-lg border
                           bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700/80
                           shadow-md hover:border-neutral-300 dark:hover:border-neutral-600/90
                           hover:bg-neutral-50/70 dark:hover:bg-neutral-800/80
                           transition-all duration-300 ease-in-out" // Simplified hover: subtle bg/border change
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1 text-neutral-800 dark:text-neutral-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300 ease-in-out">
                    {" "}
                    {/* Keep title color change, standardized transition */}
                    {title}
                  </h2>

                  {formattedDate && (
                    <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mb-3 transition-colors duration-300 ease-in-out">
                      {" "}
                      {/* Added transition */}
                      <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-70 flex-shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  )}

                  {excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 mb-4 transition-colors duration-300 ease-in-out">
                      {" "}
                      {/* Added transition */}
                      {excerpt}
                    </p>
                  )}
                </div>

                {/* Bottom section: Read link */}
                <div className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 mt-auto pt-2 transition-colors duration-300 ease-in-out">
                  {" "}
                  {/* Standard hover (underline), added transition */}
                  <BookOpenText className="w-4 h-4 mr-2 opacity-80 flex-shrink-0" />
                  Read Note
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
