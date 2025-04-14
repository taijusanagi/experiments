// app/notes/[slug]/page.tsx
import path from "path";
import fs from "fs";
import { notFound } from "next/navigation";
import React from "react";
import "katex/dist/katex.min.css"; // Keep KaTeX CSS import

import { convertNotebookToMarkdown } from "@/lib/convertNotebookToMarkdown";
// Import the new client component
import MarkdownRenderer from "@/components/MarkdownRenderer";
// Note: We removed Layout import here because it's applied in app/layout.tsx

const notebookDir = path.resolve(process.cwd(), "../notes/src"); // Adjust path as needed

// generateStaticParams remains the same
export async function generateStaticParams() {
  const files = fs.readdirSync(notebookDir);
  return files
    .filter((file) => file.endsWith(".ipynb"))
    .map((file) => ({
      slug: file.replace(".ipynb", ""),
    }));
}

export default async function NotebookPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  // Construct the correct path relative to the server process CWD
  const notebookPath = path.join(notebookDir, `${slug}.ipynb`);

  let content: string | null = null;
  try {
    // Check if file exists before attempting conversion
    if (fs.existsSync(notebookPath)) {
      content = convertNotebookToMarkdown(notebookPath);
    } else {
      console.error(`Notebook file not found at: ${notebookPath}`);
    }
  } catch (error) {
    console.error(`Error processing notebook ${slug}:`, error);
  }

  if (!content) {
    notFound(); // Trigger 404 if content is null or empty
  }

  // No need to define components here anymore

  return <MarkdownRenderer content={content} slug={slug} />;
}
