// src/app/[slug]/page.tsx
import path from "path";
import { notFound } from "next/navigation";
import React from "react";
import Link from "next/link";
import "katex/dist/katex.min.css";
import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CodeXml,
  NotebookText,
} from "lucide-react";
import {
  formatSlugToTitle,
  getSortedNotebooksData,
  extractNotebookContentAndMetadata,
  getNotebookNavigation,
  getSortedHtmlPagesData,
  extractMetadataFromHtmlFile,
  getHtmlPageNavigation,
  getHtmlCodeForPrefill,
  getContentTypeAndBaseMeta,
} from "@/lib/content";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { formatDate } from "@/lib/date";
import { ColabIcon, CodePenIcon } from "@/components/Icons";
import { buildPageMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  const notes = getSortedNotebooksData();
  const htmlPages = await getSortedHtmlPagesData();
  const noteParams = notes.map((note) => ({ slug: note.slug }));
  const htmlPageParams = htmlPages.map((page) => ({ slug: page.slug }));
  return [...noteParams, ...htmlPageParams];
}

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
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
  const { slug } = params;
  const { type } = await getContentTypeAndBaseMeta(slug);

  let pageData: any = null;
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
            <MarkdownRenderer content={pageData.content} />
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
