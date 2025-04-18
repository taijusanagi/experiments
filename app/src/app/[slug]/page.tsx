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
    description: description,
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
    const REPO_NAME = "experiments";
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
          <div className="relative my-6 group shadow-lg shadow-black/20">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              className="!p-4 !bg-neutral-900/80 border border-neutral-800 rounded-lg overflow-x-auto text-sm leading-relaxed"
            >
              {String(codeContent).replace(/\n$/, "")}
            </SyntaxHighlighter>
            <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <CopyButton textToCopy={codeContent} />
            </div>
          </div>
        );
      } else {
        return (
          <pre
            className="p-4 bg-neutral-800/50 border border-neutral-700/60 rounded-lg overflow-x-auto text-sm my-6 font-mono text-neutral-300"
            {...props}
          >
            {children}
          </pre>
        );
      }
    },
    code({ inline, className, children, ...props }: any) {
      console.log("props", props);
      return (
        <code
          className="bg-neutral-700/60 text-neutral-200 px-1.5 py-0.5 rounded-md text-[0.85em] font-mono mx-0.5"
          {...props}
        >
          {children}
        </code>
      );
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
            <div className="my-8 w-full aspect-video rounded-lg overflow-hidden shadow-xl shadow-black/40 bg-black/30 border border-neutral-700/80">
              <iframe
                src={iframeSrc}
                width="100%"
                className="w-full h-full block border-0"
                title={`${slugPart} Visualisation`}
                loading="lazy"
              />
            </div>
          );
        }
      }

      const isExternal =
        href && (href.startsWith("http") || href.startsWith("//"));
      const isInternal = href && href.startsWith("/");

      return (
        <Link
          href={href || "#"}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-emerald-400 hover:text-emerald-300 hover:underline underline-offset-4 decoration-emerald-400/50 hover:decoration-emerald-300 transition-colors duration-150 font-medium"
          {...props}
        >
          {children}
        </Link>
      );
    },
    h1({ node, children, ...props }: any) {
      return (
        <h1
          className="font-mono text-3xl font-bold text-neutral-100 mt-12 mb-5 border-b border-neutral-700/50 pb-3"
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2({ node, children, ...props }: any) {
      return (
        <h2
          className="font-mono text-2xl font-semibold text-neutral-100 mt-10 mb-4"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3({ node, children, ...props }: any) {
      return (
        <h3
          className="font-mono text-xl font-semibold text-neutral-200 mt-8 mb-3"
          {...props}
        >
          {children}
        </h3>
      );
    },
    h4({ node, children, ...props }: any) {
      return (
        <h4
          className="font-mono text-lg font-semibold text-neutral-200 mt-6 mb-2"
          {...props}
        >
          {children}
        </h4>
      );
    },
    h5({ node, children, ...props }: any) {
      return (
        <h5
          className="font-mono text-base font-semibold text-neutral-300 mt-5 mb-1.5"
          {...props}
        >
          {children}
        </h5>
      );
    },
    p({ node, children, ...props }: any) {
      if (node && node.children.length === 1) {
        const firstChild = node.children[0];
        if (firstChild.tagName === "img") {
          return <>{children}</>;
        }
        if (firstChild.tagName === "a") {
          const href = firstChild.properties?.href;
          const basePattern = "https://taijusanagi.com/";
          if (href && href.startsWith(basePattern)) {
            const slugPart = href.substring(basePattern.length);
            if (
              slugPart &&
              slugPart.length > 0 &&
              !slugPart.includes("/") &&
              slugPart.endsWith("-viz")
            ) {
              return <>{children}</>;
            }
          }
        }
      }
      return (
        <p
          className="text-neutral-300 leading-relaxed my-5 text-base"
          {...props}
        >
          {children}
        </p>
      );
    },
    ul({ node, children, ...props }: any) {
      return (
        <ul
          className="list-disc list-outside pl-5 my-5 space-y-2.5 text-neutral-300"
          {...props}
        >
          {children}
        </ul>
      );
    },
    ol({ node, children, ...props }: any) {
      return (
        <ol
          className="list-decimal list-outside pl-5 my-5 space-y-2.5 text-neutral-300"
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
          className="border-l-4 border-emerald-500/70 pl-5 pr-4 py-3 my-7 bg-neutral-800/30 rounded-r-md text-neutral-300 italic shadow-inner shadow-black/10"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    hr({ node, ...props }: any) {
      return <hr className="border-neutral-700/60 my-10" {...props} />;
    },
    strong({ node, children, ...props }: any) {
      return (
        <strong className="font-semibold text-neutral-100" {...props}>
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
        <figure className="my-8">
          <img
            src={src}
            alt={alt || ""}
            className="max-w-full h-auto rounded-lg border border-neutral-700/80 block mx-auto shadow-md shadow-black/25"
            loading="lazy"
            {...props}
          />
          {alt && (
            <figcaption className="text-center text-xs text-neutral-500 mt-3 italic">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },
    table({ node, children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-7 border border-neutral-700/70 rounded-lg shadow-md shadow-black/20">
          <table
            className="w-full text-sm text-left border-collapse"
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
          className="bg-neutral-800/60 text-neutral-300 uppercase text-xs tracking-wider"
          {...props}
        >
          {children}
        </thead>
      );
    },
    th({ node, children, ...props }: any) {
      return (
        <th
          className="border-b border-neutral-700/70 px-4 py-3 font-semibold text-left"
          {...props}
        >
          {children}
        </th>
      );
    },
    tbody({ node, children, ...props }: any) {
      return (
        <tbody className="divide-y divide-neutral-800/50" {...props}>
          {children}
        </tbody>
      );
    },
    tr({ node, children, ...props }: any) {
      return (
        <tr
          className="hover:bg-neutral-800/50 transition-colors duration-150"
          {...props}
        >
          {children}
        </tr>
      );
    },
    td({ node, children, ...props }: any) {
      return (
        <td className="px-4 py-3 text-neutral-300 align-top" {...props}>
          {children}
        </td>
      );
    },
  };

  return (
    <div className="w-full flex flex-col items-center px-4 py-10 md:py-14 bg-neutral-950">
      <div className="w-full max-w-3xl min-w-0">
        <div className="mb-8 md:mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-neutral-500 hover:text-emerald-400 transition-colors duration-200 ease-in-out group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-200 ease-in-out group-hover:-translate-x-1" />
            Back to Experiments
          </Link>
        </div>
        <article className="mb-16 md:mb-20 prose prose-invert prose-neutral max-w-none prose-pre:bg-transparent prose-pre:p-0">
          <header className="mb-8 border-b border-neutral-800/70 pb-6">
            <h1 className="text-3xl md:text-4xl font-mono font-bold text-neutral-50 mb-4 leading-tight tracking-tight">
              {displayTitle}
            </h1>
            <div className="flex justify-between items-center flex-wrap gap-y-3 text-xs text-neutral-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center px-2 py-0.5 rounded-full bg-neutral-800/70 border border-neutral-700/50">
                  {contentType === "notebook" ? (
                    <NotebookText className="w-3.5 h-3.5 mr-1.5 opacity-70 text-emerald-400" />
                  ) : (
                    <CodeXml className="w-3.5 h-3.5 mr-1.5 opacity-70 text-emerald-400" />
                  )}
                  <span className="font-medium">
                    {contentType === "notebook" ? "Note" : "Demo"}
                  </span>
                </div>
                {formattedDate && (
                  <div className="flex items-center">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-60 flex-shrink-0" />
                    <span className="text-neutral-500">
                      Updated: {formattedDate}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2.5">
                {contentType === "notebook" && colabUrl && (
                  <Link
                    href={colabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2.5 py-1 rounded-md border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-750 hover:border-neutral-600 text-neutral-300 hover:text-emerald-300 transition-all duration-200 ease-in-out text-xs shadow-sm font-medium"
                    aria-label="Open notebook in Google Colab"
                  >
                    <ColabIcon className="w-4 h-4 mr-1.5" />
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
                      className="inline-flex items-center px-2.5 py-1 rounded-md border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-750 hover:border-neutral-600 text-neutral-300 hover:text-emerald-300 transition-all duration-200 ease-in-out text-xs shadow-sm cursor-pointer font-medium"
                      aria-label="Create a new CodePen with this code"
                    >
                      <CodePenIcon className="w-4 h-4 mr-1.5" /> CodePen
                    </button>
                  </form>
                )}
              </div>
            </div>
          </header>

          {contentType === "notebook" && (
            <div className="w-full min-w-0">
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
              <div className="w-full aspect-video rounded-lg overflow-hidden shadow-xl shadow-black/40 bg-black/30 border border-neutral-700/80">
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
          <nav className="w-full pt-8 mt-8 border-t border-neutral-800/70 flex justify-between items-start gap-4 sm:gap-8">
            <div className="flex-1 text-left max-w-[48%] min-w-0">
              {prev && (
                <Link
                  href={`/${prev.slug}`}
                  className="group inline-block w-full p-3 rounded-md hover:bg-neutral-800/40 transition-colors duration-200 ease-in-out"
                >
                  <div className="flex items-center text-xs font-medium text-neutral-500 group-hover:text-emerald-400 transition-colors duration-200 ease-in-out block mb-1.5">
                    <ChevronLeft className="inline w-4 h-4 mr-1 align-middle relative -top-px transition-transform group-hover:-translate-x-0.5" />
                    Previous
                  </div>
                  <span className="text-base font-medium text-neutral-200 group-hover:text-emerald-300 transition-colors duration-200 ease-in-out block leading-snug font-mono">
                    {prev.title || formatSlugToTitle(prev.slug)}
                  </span>
                </Link>
              )}
            </div>
            <div className="flex-1 text-right max-w-[48%] min-w-0">
              {next && (
                <Link
                  href={`/${next.slug}`}
                  className="group inline-block w-full p-3 rounded-md hover:bg-neutral-800/40 transition-colors duration-200 ease-in-out"
                >
                  <div className="flex items-center justify-end text-xs font-medium text-neutral-500 group-hover:text-emerald-400 transition-colors duration-200 ease-in-out block mb-1.5">
                    Next
                    <ChevronRight className="inline w-4 h-4 ml-1 align-middle relative -top-px transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <span className="text-base font-medium text-neutral-200 group-hover:text-emerald-300 transition-colors duration-200 ease-in-out block leading-snug font-mono">
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
