// app/notes/page.tsx
import React from "react";
import Link from "next/link";
import { getSortedNotesData } from "@/lib/notes";
import { BookOpenText, CalendarDays } from "lucide-react";

function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return null;
  }
}

export default function NotesIndexPage() {
  const allNotes = getSortedNotesData();

  return (
    // Container usually inherits background from layout, padding/margins ok
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
      {" "}
      {/* Removed py-8/py-12 to avoid doubling with layout */}
      <h1 className="text-4xl font-bold mb-10 text-center text-neutral-800 dark:text-neutral-100">
        Notes
      </h1>
      {allNotes.length === 0 ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400">
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
                className="group flex flex-col justify-between p-5 rounded-lg border dark:border-neutral-700
                           bg-white dark:bg-neutral-800/60
                           shadow-md hover:shadow-xl dark:hover:border-neutral-600
                           transition-all duration-300 ease-in-out
                           hover:bg-neutral-50 dark:hover:bg-neutral-800/90"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1 text-neutral-800 dark:text-neutral-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {title}
                  </h2>

                  {formattedDate && (
                    <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                      <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-70 flex-shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  )}

                  {/* Display Excerpt */}
                  {excerpt && (
                    // --- Apply the consistency fix here ---
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 mb-4">
                      {excerpt}
                    </p>
                    // -------------------------------------
                  )}
                </div>

                {/* Bottom section: Read link */}
                <div className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 mt-auto pt-2 group-hover:underline">
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
