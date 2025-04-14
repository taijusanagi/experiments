// app/notes/[slug]/page.tsx
import path from "path";
import fs from "fs";
import { notFound } from "next/navigation";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

import { convertNotebookToMarkdown } from "@/lib/convertNotebookToMarkdown";

const notebookDir = path.resolve(process.cwd(), "../notes/src");

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
  const slug = params.slug;
  const notebookPath = path.join("../notes/src", `${slug}.ipynb`);
  const content = convertNotebookToMarkdown(notebookPath);

  if (!content) {
    notFound(); // 👈 this will render the 404 page
  }

  return (
    <main className="prose dark:prose-invert mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{slug}</h1>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        children={content}
      />
    </main>
  );
}
