// src/components/MarkdownRenderer.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components = {
    pre({ children }: any) {
      return <div className="not-prose">{children}</div>;
    },
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="text-sm">
          <SyntaxHighlighter style={oneDark} language={match[1]} {...props}>
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    a({ href, children, ...props }: any) {
      const basePattern = "https://taijusanagi.com/vibes/";
      if (href && href.startsWith(basePattern)) {
        const slug = href.substring(basePattern.length);
        if (slug && slug.length > 0 && !slug.includes("/")) {
          const iframeSrc = `https://taijusanagi.com/vibes-standalone/${slug}`;
          return (
            <iframe
              src={iframeSrc}
              width="100%"
              height="500px"
              style={{ border: "none" }}
              title={`${slug} Vibes`}
              loading="lazy"
            />
          );
        }
      }
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
  };

  return (
    <article className="prose lg:prose-lg prose-invert max-w-none w-full">
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
