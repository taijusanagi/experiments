// src/app/[slug]/page.tsx
import "katex/dist/katex.min.css";

import path from "path";
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CodeXml,
  NotebookText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  extractMetadataFromHtmlFile,
  extractNotebookContentAndMetadata,
  formatSlugToTitle,
  getContentTypeAndBaseMeta,
  getHtmlCodeForPrefill,
  getCombinedNavigation,
  getSortedHtmlPagesData,
  getSortedNotebooksData,
} from "@/lib/content";
import { formatDate } from "@/lib/date";
import { buildPageMetadata } from "@/lib/metadata";
import { CodePenIcon, ColabIcon } from "@/components/Icons";
import { CopyButton } from "@/components/CopyButton";

export async function generateStaticParams() {
  const notes = getSortedNotebooksData();
  const htmlPages = await getSortedHtmlPagesData();
  const noteParams = notes.map((note) => ({ slug: note.slug }));
  const htmlPageParams = htmlPages.map((page) => ({ slug: page.slug }));
  return [...noteParams, ...htmlPageParams];
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { type, title, description } = await getContentTypeAndBaseMeta(slug);

  if (type === "notFound") {
    console.error(
      `Metadata generation failed: Content not found for slug "${slug}"`
    );
    notFound();
  }

  const pagePath = `/${slug}`;
  const ogType = type === "notebook" ? "article" : "website";

  return buildPageMetadata({
    title: title,
    description: description || `Explore content related to ${title}.`,
    pagePath: pagePath,
    ogType: ogType,
  });
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const { type } = await getContentTypeAndBaseMeta(slug);

  let pageData: any = null;
  let contentType: "notebook" | "htmlPage";

  if (type === "notebook") {
    contentType = "notebook";
    pageData = extractNotebookContentAndMetadata(slug);
    if (!pageData) notFound();
  } else if (type === "htmlPage") {
    contentType = "htmlPage";
    const htmlPath = path.join(
      process.cwd(),
      "public",
      "standalone",
      `${slug}.html`
    );
    const metadata = await extractMetadataFromHtmlFile(htmlPath);
    const prefill = await getHtmlCodeForPrefill(slug);
    pageData = { ...metadata, prefill };
  } else {
    notFound();
  }
  const navigation = await getCombinedNavigation(slug);

  const displayTitle =
    (contentType === "notebook" ? pageData.extractedTitle : pageData.title) ||
    formatSlugToTitle(slug);
  const updatedDate =
    contentType === "notebook" ? pageData.metadata?.updated : pageData.updated;
  const formattedDate = formatDate(updatedDate);
  const { prev, next } = navigation;

  let colabUrl: string | null = null;
  let iframeSrc: string | null = null;
  let jsonStringData: string | null = null;

  if (contentType === "notebook") {
    const GITHUB_USERNAME = "taijusanagi";
    const REPO_NAME = "labs";
    const BRANCH = "main";
    const NOTEBOOK_DIR_PATH = "contents";
    colabUrl = `https://colab.research.google.com/github/${GITHUB_USERNAME}/${REPO_NAME}/blob/${BRANCH}/${NOTEBOOK_DIR_PATH}/${slug}.ipynb`;
  } else {
    iframeSrc = `/standalone/${slug}`;

    const { htmlBodyContent, css, js, js_external } = pageData.prefill;
    if (htmlBodyContent || css || js || js_external) {
      const prefillData = {
        title: displayTitle,
        html: htmlBodyContent || "",
        css: css || "",
        js: js || "",
        js_external: js_external || "",
      };
      try {
        jsonStringData = JSON.stringify(prefillData);
      } catch (e) {
        console.error("Failed to stringify prefill data for CodePen:", e);
      }
    }
  }

  const components: Components = {
    pre({ node, children, ...props }: any) {
      const codeNode = node?.children?.[0];
      const className = codeNode?.properties?.className?.[0] || "";
      const match = /language-(\w+)/.exec(className);
      const codeContent = codeNode?.children?.[0]?.value || "";

      if (codeNode?.tagName === "code" && match && codeContent) {
        return (
          <div className="relative my-6 group">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              className="!p-4 !bg-neutral-900/80 border border-neutral-800 rounded-md overflow-x-auto text-sm"
            >
              {String(codeContent).replace(/\n$/, "")}
            </SyntaxHighlighter>
            <div className="absolute top-2 right-2">
              <CopyButton textToCopy={codeContent} />
            </div>
          </div>
        );
      } else {
        return (
          <pre
            className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-md overflow-x-auto text-sm my-6"
            {...props}
          >
            {children}
          </pre>
        );
      }
    },
    code({ inline, className, children, ...props }: any) {
      if (inline) {
        return (
          <code
            className="bg-neutral-700/50 text-neutral-300 px-1 py-0.5 rounded-sm text-[0.9em] font-mono"
            {...props}
          >
            {children}
          </code>
        );
      }
      return null;
    },
    a({ node, href, children, ...props }: any) {
      const basePattern = "https://taijusanagi.com/";
      if (href && href.startsWith(basePattern)) {
        const slugPart = href.substring(basePattern.length);
        if (
          slugPart &&
          slugPart.length > 0 &&
          !slugPart.includes("/") &&
          slugPart.endsWith("-viz")
        ) {
          const iframeSrc = `https://taijusanagi.com/standalone/${slugPart}`;
          return (
            <iframe
              src={iframeSrc}
              width="100%"
              height="500px"
              className="border border-neutral-800 rounded-md my-6"
              title={`${slugPart} Visualisation`}
              loading="lazy"
            />
          );
        }
      }

      const isExternal =
        href && (href.startsWith("http") || href.startsWith("//"));
      const isInternal = href && href.startsWith("/");

      if (isInternal) {
        return (
          <Link
            href={href}
            className="text-teal-400 hover:text-teal-300 hover:underline underline-offset-2 transition-colors duration-150"
            {...props}
          >
            {children}
          </Link>
        );
      }

      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-teal-400 hover:text-teal-300 hover:underline underline-offset-2 transition-colors duration-150"
          {...props}
        >
          {children}
        </a>
      );
    },
    h1({ node, children, ...props }: any) {
      return (
        <h1
          className="text-3xl font-semibold text-neutral-100 mt-10 mb-4 border-b border-neutral-700 pb-2"
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2({ node, children, ...props }: any) {
      return (
        <h2
          className="text-2xl font-semibold text-neutral-100 mt-8 mb-3 border-b border-neutral-800 pb-1"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3({ node, children, ...props }: any) {
      return (
        <h3
          className="text-xl font-semibold text-neutral-200 mt-6 mb-2"
          {...props}
        >
          {children}
        </h3>
      );
    },
    p({ node, children, ...props }: any) {
      if (
        node &&
        node.children.length === 1 &&
        node.children[0].tagName === "img"
      ) {
        return <>{children}</>;
      }
      return (
        <p className="text-neutral-300 leading-relaxed my-5" {...props}>
          {children}
        </p>
      );
    },
    ul({ node, children, ...props }: any) {
      return (
        <ul
          className="list-disc list-outside pl-6 my-5 space-y-2 text-neutral-300"
          {...props}
        >
          {children}
        </ul>
      );
    },
    ol({ node, children, ...props }: any) {
      return (
        <ol
          className="list-decimal list-outside pl-6 my-5 space-y-2 text-neutral-300"
          {...props}
        >
          {children}
        </ol>
      );
    },
    li({ node, children, ...props }: any) {
      return (
        <li className="pl-2 leading-relaxed" {...props}>
          {children}
        </li>
      );
    },
    blockquote({ node, children, ...props }: any) {
      return (
        <blockquote
          className="border-l-4 border-neutral-700 pl-4 py-2 my-6 text-neutral-400 italic"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    hr({ node, ...props }: any) {
      return <hr className="border-neutral-700 my-8" {...props} />;
    },
    strong({ node, children, ...props }: any) {
      return (
        <strong className="font-semibold text-neutral-200" {...props}>
          {children}
        </strong>
      );
    },
    em({ node, children, ...props }: any) {
      return (
        <em className="italic text-neutral-300" {...props}>
          {children}
        </em>
      );
    },
    img({ node, src, alt, ...props }: any) {
      return (
        <figure className="my-6">
          <img
            src={src}
            alt={alt || ""}
            className="max-w-full h-auto rounded-md border border-neutral-800 block mx-auto"
            loading="lazy"
            {...props}
          />
          {alt && (
            <figcaption className="text-center text-xs text-neutral-500 mt-2 italic">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },
    table({ node, children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-6">
          <table
            className="w-full text-sm text-left border-collapse border border-neutral-700"
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },
    thead({ node, children, ...props }: any) {
      return (
        <thead
          className="bg-neutral-800/50 text-neutral-300 uppercase text-xs"
          {...props}
        >
          {children}
        </thead>
      );
    },
    th({ node, children, ...props }: any) {
      return (
        <th
          className="border border-neutral-700 px-3 py-2 font-medium"
          {...props}
        >
          {children}
        </th>
      );
    },
    tbody({ node, children, ...props }: any) {
      return (
        <tbody className="divide-y divide-neutral-800" {...props}>
          {children}
        </tbody>
      );
    },
    tr({ node, children, ...props }: any) {
      return (
        <tr
          className="hover:bg-neutral-800/40 transition-colors duration-100"
          {...props}
        >
          {children}
        </tr>
      );
    },
    td({ node, children, ...props }: any) {
      return (
        <td
          className="border border-neutral-700 px-3 py-2 text-neutral-300 align-top"
          {...props}
        >
          {children}
        </td>
      );
    },
  };

  return (
    <div className="w-full flex flex-col items-center px-4 py-8 md:py-12 bg-neutral-950">
      <div className="w-full max-w-3xl">
        <div className="mb-6 md:mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-neutral-500 hover:text-teal-400 transition-colors duration-200 ease-in-out group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform duration-200 ease-in-out group-hover:-translate-x-0.5" />
            Back to Dev Hub
          </Link>
        </div>

        <article className="mb-16">
          <header className="mb-6 border-b border-neutral-800/60 pb-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-neutral-100 mb-4 leading-tight">
              {displayTitle}
            </h1>
            <div className="flex justify-between items-center flex-wrap gap-y-3 text-xs text-neutral-500">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {contentType === "notebook" ? (
                    <NotebookText className="w-3.5 h-3.5 mr-1 opacity-70" />
                  ) : (
                    <CodeXml className="w-3.5 h-3.5 mr-1 opacity-70" />
                  )}
                  <span>{contentType === "notebook" ? "Note" : "Demo"}</span>
                </div>
                {formattedDate && (
                  <div className="flex items-center">
                    <CalendarDays className="w-3.5 h-3.5 mr-1 opacity-70" />
                    <span>Updated: {formattedDate}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {contentType === "notebook" && colabUrl && (
                  <Link
                    href={colabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 rounded border border-neutral-700 bg-neutral-800/70 hover:bg-neutral-750/90 hover:border-neutral-600 text-neutral-300 hover:text-teal-300 transition-all duration-200 ease-in-out text-xs shadow-sm"
                    aria-label="Open notebook in Google Colab"
                  >
                    <ColabIcon className="w-4 h-4 mr-1" />
                    Colab
                  </Link>
                )}
                {contentType === "htmlPage" && jsonStringData && (
                  <form
                    action="https://codepen.io/pen/define"
                    method="POST"
                    target="_blank"
                    className="inline-block"
                  >
                    <input type="hidden" name="data" value={jsonStringData} />
                    <button
                      type="submit"
                      className="inline-flex items-center px-2 py-1 rounded border border-neutral-700 bg-neutral-800/70 hover:bg-neutral-750/90 hover:border-neutral-600 text-neutral-300 hover:text-teal-300 transition-all duration-200 ease-in-out text-xs shadow-sm cursor-pointer"
                      aria-label="Create a new CodePen with this code"
                    >
                      <CodePenIcon className="w-4 h-4 mr-1" /> CodePen
                    </button>
                  </form>
                )}
              </div>
            </div>
          </header>

          {contentType === "notebook" && (
            <div className="w-full">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={components}
                urlTransform={(value: string) => value}
              >
                {pageData.content}
              </ReactMarkdown>
            </div>
          )}
          {contentType === "htmlPage" && iframeSrc && (
            <div className="mt-8">
              <div className="w-full aspect-video rounded-md overflow-hidden shadow-xl shadow-black/30 bg-black/20 border border-neutral-800">
                <iframe
                  src={iframeSrc}
                  title={displayTitle}
                  className="w-full h-full block border-0"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </article>

        {(prev || next) && (
          <nav className="w-full pt-6 border-t border-neutral-800/60 flex justify-between items-start gap-4 sm:gap-6">
            <div className="flex-1 text-left max-w-[48%]">
              {prev && (
                <Link
                  href={`/${prev.slug}`}
                  className="group inline-block w-full"
                >
                  <span className="text-xs font-medium text-neutral-500 group-hover:text-teal-400 transition-colors duration-200 ease-in-out block mb-1">
                    <ChevronLeft className="inline w-3.5 h-3.5 mr-0.5 align-middle relative -top-px" />
                    Previous
                  </span>
                  <span className="text-base font-medium text-neutral-200 group-hover:text-teal-300 transition-colors duration-200 ease-in-out block leading-snug">
                    {prev.title || formatSlugToTitle(prev.slug)}
                  </span>
                </Link>
              )}
            </div>
            <div className="flex-1 text-right max-w-[48%]">
              {next && (
                <Link
                  href={`/${next.slug}`}
                  className="group inline-block w-full"
                >
                  <span className="text-xs font-medium text-neutral-500 group-hover:text-teal-400 transition-colors duration-200 ease-in-out block mb-1">
                    Next
                    <ChevronRight className="inline w-3.5 h-3.5 ml-0.5 align-middle relative -top-px" />
                  </span>
                  <span className="text-base font-medium text-neutral-200 group-hover:text-teal-300 transition-colors duration-200 ease-in-out block leading-snug">
                    {next.title || formatSlugToTitle(next.slug)}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
