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
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { convertNotebookToMarkdown } from "@/lib/convertNotebookToMarkdown";
const notebookDir = path.resolve(process.cwd(), "../notes/src");

export async function generateStaticParams() {
  // ... (generateStaticParams remains the same)
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

  if (!content) notFound();

  // Define the custom renderer for code blocks
  const components = {
    pre({ children }: any) {
      return <div className="not-prose">{children}</div>;
    },
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={materialDark}
          language={match[1]}
          // PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        // Inline code or code blocks without language
        // will still get typography styles (usually desired)
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <article className="prose mx-auto p-4">
      {/* Typography styles applied here */}
      <h1>{slug}</h1>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={components} // Use the modified components
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
