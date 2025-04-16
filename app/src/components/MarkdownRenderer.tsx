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

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { darkMode } = useTheme(); // Get the current theme state

  // Define the custom renderer for code blocks inside the client component
  const components = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pre({ children }: any) {
      // Keep the not-prose class to override typography styles if needed
      return <div className="not-prose">{children}</div>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="text-sm">
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    a({ href, children, ...props }: any) {
      const basePattern = "https://taijusanagi.com/vibes/";
      // Check if the href exists and starts with the base pattern
      if (href && href.startsWith(basePattern)) {
        // Extract the slug part (everything after the base pattern)
        const slug = href.substring(basePattern.length);

        // Ensure there is actually a slug (not just the base URL ending with /)
        if (slug && slug.length > 0 && !slug.includes("/")) {
          // Avoid matching deeper paths if any
          // Construct the iframe source URL
          const iframeSrc = `https://taijusanagi.com/vibes-standalone/${slug}`;

          // Render an iframe instead of the link
          return (
            <iframe
              src={iframeSrc}
              width="100%" // Adjust dimensions as needed
              height="500px"
              style={{ border: "none" }} // Optional styling
              title={`${slug} Vibes`} // Dynamic title for accessibility
              loading="lazy" // Improve performance
            />
          );
        }
      }

      // If the href doesn't match the pattern, or if there's no slug,
      // render a normal link
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
    // You can add more custom components here if needed
    // e.g., custom link rendering, image handling etc.
  };

  return (
    // The prose classes now work correctly because the ThemeProvider
    // puts 'dark' or 'light' on the body tag.
    // Ensure your tailwind.config.js has darkMode: 'class'
    <article className="prose lg:prose-lg dark:prose-invert max-w-none w-full">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={components}
        urlTransform={(value: string) => value}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
