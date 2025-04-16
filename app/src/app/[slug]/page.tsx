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
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  extractMetadataFromHtmlFile,
  extractNotebookContentAndMetadata,
  formatSlugToTitle,
  getContentTypeAndBaseMeta,
  getHtmlCodeForPrefill,
  getHtmlPageNavigation,
  getNotebookNavigation,
  getSortedHtmlPagesData,
  getSortedNotebooksData,
} from "@/lib/content";
import { formatDate } from "@/lib/date";
import { buildPageMetadata } from "@/lib/metadata";

const CodePenIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block ${className}`}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.605.862a.75.75 0 0 1 .79 0l10.5 6.5A.75.75 0 0 1 23.25 8v7a.75.75 0 0 1-.314.61l-10.5 7.5a.75.75 0 0 1-.872 0l-10.5-7.5A.75.75 0 0 1 .75 15V8a.75.75 0 0 1 .355-.638l10.5-6.5ZM2.25 13.654V9.457l3.147 2.248-3.147 1.949Zm9 7.389v-5.157L6.72 12.65l-3.867 2.395 8.397 5.998Zm1.5 0v-5.157l4.53-3.236 3.867 2.395-8.397 5.998Zm-4.647-9.248L12 14.578l3.897-2.783L12 9.382l-3.897 2.413Zm10.5-.09 3.147 1.949V9.457l-3.147 2.248Zm-1.383-.855-4.47-2.768V2.846l8.397 5.199-3.927 2.805Zm-10.44 0 4.47-2.768V2.846L2.853 8.045l3.927 2.805Z"
    />
  </svg>
);

const ColabIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className={`inline-block ${className}`}
  >
    <path
      fill="#ffb300"
      d="M33.5,10C26.044,10,20,16.044,20,23.5C20,30.956,26.044,37,33.5,37S47,30.956,47,23.5 C47,16.044,40.956,10,33.5,10z M33.5,30c-3.59,0-6.5-2.91-6.5-6.5s2.91-6.5,6.5-6.5s6.5,2.91,6.5,6.5S37.09,30,33.5,30z"
    />
    <path
      fill="#ffb300"
      d="M19.14,28.051l0-0.003C17.96,29.252,16.318,30,14.5,30C10.91,30,8,27.09,8,23.5s2.91-6.5,6.5-6.5  c1.83,0,3.481,0.759,4.662,1.976l3.75-6.024C20.604,11.109,17.683,10,14.5,10C7.044,10,1,16.044,1,23.5C1,30.956,7.044,37,14.5,37 c3.164,0,6.067-1.097,8.369-2.919L19.14,28.051z"
    />
    <path
      fill="#f57c00"
      d="M8,23.5c0-1.787,0.722-3.405,1.889-4.58l-4.855-5.038C2.546,16.33,1,19.733,1,23.5  c0,3.749,1.53,7.14,3.998,9.586l4.934-4.964C8.74,26.944,8,25.309,8,23.5z"
    />
    <path
      fill="#f57c00"
      d="M38.13,18.941C39.285,20.114,40,21.723,40,23.5c0,3.59-2.91,6.5-6.5,6.5  c-1.826,0-3.474-0.755-4.655-1.968l-4.999,4.895C26.298,35.437,29.714,37,33.5,37C40.956,37,47,30.956,47,23.5  c0-3.684-1.479-7.019-3.871-9.455L38.13,18.941z"
    />
  </svg>
);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pageData: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let navigation: { prev: any; next: any } = { prev: null, next: null };
  let contentType: "notebook" | "htmlPage";

  if (type === "notebook") {
    contentType = "notebook";
    pageData = extractNotebookContentAndMetadata(slug);
    if (!pageData) notFound();
    navigation = getNotebookNavigation(slug);
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
    navigation = await getHtmlPageNavigation(slug);
  } else {
    notFound();
  }

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pre({ children }: any) {
      return <div className="not-prose">{children}</div>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    a({ href, children, ...props }: any) {
      const basePattern = "https://taijusanagi.com/vibes/";
      if (href && href.startsWith(basePattern)) {
        const slug = href.substring(basePattern.length);
        if (slug && slug.length > 0 && !slug.includes("/")) {
          const iframeSrc = `https://taijusanagi.com/standalone/${slug}`;
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
    <div className="w-full flex flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-6 md:mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-neutral-400 hover:text-teal-400 transition-colors duration-300 ease-in-out group"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <article className="mb-16">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-100 mb-3">
              {displayTitle}
            </h1>
            <div className="flex justify-between items-center flex-wrap gap-y-2 text-sm text-neutral-400">
              <div className="flex items-center">
                {formattedDate && (
                  <CalendarDays className="w-4 h-4 mr-1.5 opacity-80" />
                )}
                {formattedDate ? (
                  <span>{formattedDate}</span>
                ) : (
                  <span className="h-[20px] inline-block"></span>
                )}
                <span className="mx-2 text-neutral-600">|</span>
                {contentType === "notebook" ? (
                  <NotebookText className="w-4 h-4 mr-1.5 opacity-80" />
                ) : (
                  <CodeXml className="w-4 h-4 mr-1.5 opacity-80" />
                )}
                <span>{contentType === "notebook" ? "Note" : "Demo"}</span>
              </div>
              <div>
                {contentType === "notebook" && colabUrl && (
                  <Link
                    href={colabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2.5 py-1 rounded-md border border-transparent bg-neutral-800/80 hover:bg-neutral-700/90 hover:border-neutral-600/80 text-neutral-300 hover:text-neutral-100 transition-all duration-300 ease-in-out shadow-sm"
                    aria-label="Open notebook in Google Colab"
                  >
                    <ColabIcon className="w-5 h-5 mr-1.5 transform -translate-y-[-0.5px]" />
                    Open in Colab
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
                      className="inline-flex items-center px-2.5 py-1 rounded-md border border-transparent bg-neutral-800/80 hover:bg-neutral-700/90 hover:border-neutral-600/80 text-neutral-300 hover:text-neutral-100 transition-all duration-300 ease-in-out shadow-sm cursor-pointer"
                      aria-label="Create a new CodePen with this vibe's code"
                    >
                      <CodePenIcon className="w-5 h-5 mr-1.5" /> Open in CodePen
                    </button>
                  </form>
                )}
              </div>
            </div>
          </header>

          {contentType === "notebook" && (
            <article className="prose lg:prose-lg prose-invert max-w-none w-full">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={components}
                urlTransform={(value: string) => value}
              >
                {pageData.content}
              </ReactMarkdown>
            </article>
          )}
          {contentType === "htmlPage" && iframeSrc && (
            <div className="mt-8">
              <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-neutral-900">
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
          <nav className="w-full pt-6 border-t border-neutral-700/80 flex justify-between items-start gap-6 sm:gap-8">
            <div className="flex-1 text-left">
              {prev && (
                <Link href={`/${prev.slug}`} className="group inline-block">
                  <span className="text-sm font-medium text-neutral-400 group-hover:text-teal-400 transition-colors duration-300 ease-in-out block mb-1">
                    <ChevronLeft className="inline w-4 h-4 mr-1 align-text-bottom" />
                    Previous
                  </span>
                  <span className="text-lg font-semibold text-neutral-200 group-hover:text-teal-300 transition-colors duration-300 ease-in-out block">
                    {prev.title || formatSlugToTitle(prev.slug)}
                  </span>
                </Link>
              )}
            </div>
            <div className="flex-1 text-right">
              {next && (
                <Link href={`/${next.slug}`} className="group inline-block">
                  <span className="text-sm font-medium text-neutral-400 group-hover:text-teal-400 transition-colors duration-300 ease-in-out block mb-1">
                    Next
                    <ChevronRight className="inline w-4 h-4 ml-1 align-text-bottom" />
                  </span>
                  <span className="text-lg font-semibold text-neutral-200 group-hover:text-teal-300 transition-colors duration-300 ease-in-out block">
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
