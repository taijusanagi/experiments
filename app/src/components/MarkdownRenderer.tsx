// app/notes/[slug]/components/MarkdownRenderer.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark, // Import a light theme
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/context/ThemeContext"; // Adjust path

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { darkMode } = useTheme(); // Get the current theme state

  // Define the custom renderer for code blocks inside the client component
  const components = {
    pre({ children }: any) {
      // Keep the not-prose class to override typography styles if needed
      return <div className="not-prose">{children}</div>;
    },
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="text-xs">
          <SyntaxHighlighter
            // Conditionally select the theme based on darkMode state
            style={darkMode ? oneDark : oneLight}
            language={match[1]}
            // PreTag="div" // Usually not needed, SyntaxHighlighter renders a <pre>

            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // You can add more custom components here if needed
    // e.g., custom link rendering, image handling etc.
  };

  return (
    // The prose classes now work correctly because the ThemeProvider
    // puts 'dark' or 'light' on the body tag.
    // Ensure your tailwind.config.js has darkMode: 'class'
    <article className="prose dark:prose-invert max-w-none w-full">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
