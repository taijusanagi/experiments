// app/notes/page.tsx
import React from "react";
import Link from "next/link";
import { getSortedNotesData } from "@/lib/notes"; // Adjust path if needed
import { BookOpenText } from "lucide-react"; // Example Icon

export default function NotesIndexPage() {
  const allNotes = getSortedNotesData();

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Notes</h1>

      {allNotes.length === 0 ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400">
          No notes found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allNotes.map(({ slug, title }) => (
            <Link href={`/notes/${slug}`} key={slug}>
              <div className="block p-6 rounded-lg border transition-all duration-300 ease-in-out shadow-sm hover:shadow-md dark:border-neutral-700 dark:hover:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/80">
                <h2 className="text-xl font-semibold mb-2 text-neutral-800 dark:text-neutral-100">
                  {title}
                </h2>
                {/* Optional: Add date or excerpt here later */}
                <div className="flex items-center text-sm text-teal-600 dark:text-teal-400 mt-3">
                  <BookOpenText className="w-4 h-4 mr-2 opacity-80" />
                  Read Note
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
