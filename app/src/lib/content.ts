// src/lib/content.ts
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import { remark } from "remark";
import strip from "strip-markdown";

// --- Constants ---
// Assumes 'contents' and 'public/standalone' are at the project root relative to process.cwd()
const NOTEBOOKS_DIR = path.resolve(process.cwd(), "../contents");
const HTML_PAGES_BASE_DIR = path.join(process.cwd(), "public", "standalone");

// --- Interfaces ---
export interface HtmlPageData {
  slug: string;
  title: string;
  updated: string | null;
}

export interface JupyterMetadata {
  updated?: string | null;
  created?: string | null;
  [key: string]: any;
}

export interface JupyterNotebookInfo {
  slug: string;
  title: string;
  updated: string | null;
  excerpt: string | null;
}

// Internal Types for Notebook Parsing
interface Output {
  output_type: string;
  name?: string;
  text?: string[] | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: { [mimeType: string]: any };
  ename?: string;
  evalue?: string;
  traceback?: string[];
}
interface JupyterCell {
  cell_type: "markdown" | "code" | "raw";
  source: string[] | string;
  outputs?: Output[];
  execution_count?: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: { [key: string]: any };
}
interface JupyterNotebook {
  cells: JupyterCell[];
  metadata: JupyterMetadata; // Use exported type
}

export interface JupyterNotebookInfo {
  slug: string;
  title: string;
  updated: string | null;
  excerpt: string | null;
}

// --- Exported Common Helper ---
/**
 * Formats a slug into a title-case string.
 * Exported because it's used as a fallback title in page components.
 */
export function formatSlugToTitle(slug: string): string {
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// --- Internal Text Helpers ---
function dedent(str: string | null): string | null {
  // Implementation as before...
  if (!str) return null;
  const lines = str.split("\n");
  let minIndent: number | null = null;
  lines.forEach((line) => {
    const match = line.match(/^(\s*)\S/);
    if (match) {
      const indentLength = match[1].length;
      if (minIndent === null || indentLength < minIndent)
        minIndent = indentLength;
    }
  });
  if (minIndent === null || minIndent === 0) {
    let firstLine = 0;
    while (firstLine < lines.length && lines[firstLine].match(/^\s*$/))
      firstLine++;
    let lastLine = lines.length - 1;
    while (lastLine >= firstLine && lines[lastLine].match(/^\s*$/)) lastLine--;
    if (firstLine > lastLine) return "";
    return lines.slice(firstLine, lastLine + 1).join("\n");
  }
  const dedentedLines = lines.map((line) =>
    line.match(/^\s/) ? line.slice(minIndent as number) : line
  );
  let firstLine = 0;
  while (
    firstLine < dedentedLines.length &&
    dedentedLines[firstLine].match(/^\s*$/)
  )
    firstLine++;
  let lastLine = dedentedLines.length - 1;
  while (lastLine >= firstLine && dedentedLines[lastLine].match(/^\s*$/))
    lastLine--;
  if (firstLine > lastLine) return "";
  return dedentedLines.slice(firstLine, lastLine + 1).join("\n");
}

function createExcerpt(
  markdownContent: string | null | undefined,
  maxLength: number = 150
): string | null {
  // Implementation as before...
  if (!markdownContent) return null;
  try {
    const plainText = remark()
      .use(strip)
      .processSync(markdownContent)
      .toString();
    const cleanedText = plainText
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\*\*Outputs:\*\*/g, "")
      .replace(/\*\*Error.*?:\*\*/g, "")
      .replace(/!\[.*?\]\(data:image.*?\)/g, "[Image Output]")
      .replace(/_\w+?_:/g, "")
      .replace(/\n{2,}/g, "\n")
      .trim();
    if (!cleanedText) return null;
    if (cleanedText.length <= maxLength) return cleanedText;
    const truncated = cleanedText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return (
      (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "..."
    );
  } catch (error) {
    console.error("[createExcerpt] Error:", error);
    const simpleText = Array.isArray(markdownContent)
      ? markdownContent.join("")
      : markdownContent;
    const trimmed = simpleText
      .replace(/```[\s\S]*?```/g, "")
      .replace(/^[#*->\s]+|[#*->\s]+$/g, "")
      .trim();
    if (!trimmed) return null;
    return trimmed.length > maxLength
      ? trimmed.substring(0, maxLength) + "..."
      : trimmed;
  }
}

// --- HTML Page Data Fetching ---
export async function getSortedHtmlPagesData(): Promise<HtmlPageData[]> {
  try {
    if (!fs.existsSync(HTML_PAGES_BASE_DIR)) return [];
    const dirents = await fs.promises.readdir(HTML_PAGES_BASE_DIR, {
      withFileTypes: true,
    });
    const htmlFiles = dirents.filter(
      (d) => d.isFile() && d.name.endsWith(".html")
    );
    if (htmlFiles.length === 0) return [];

    const pageDataPromises = htmlFiles.map(
      async (dirent): Promise<HtmlPageData> => {
        const filename = dirent.name;
        const slug = filename.replace(/\.html$/, "");
        const fullPath = path.join(HTML_PAGES_BASE_DIR, filename);
        const { title: extractedTitle, updated: extractedUpdated } =
          await extractMetadataFromHtmlFile(fullPath); // Use internal helper
        const title = extractedTitle || formatSlugToTitle(slug); // Use exported helper
        return { slug, title, updated: extractedUpdated };
      }
    );

    const allPagesData = await Promise.all(pageDataPromises);

    allPagesData.sort((a, b) => {
      if (a.updated && !b.updated) return -1;
      if (!a.updated && b.updated) return 1;
      if (a.updated && b.updated) {
        const dateComparison =
          new Date(b.updated).getTime() - new Date(a.updated).getTime();
        if (dateComparison !== 0) return dateComparison;
      }
      return a.title.localeCompare(b.title);
    });
    return allPagesData;
  } catch (error) {
    console.error(
      `[getSortedHtmlPagesData] Error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return [];
  }
}

export async function extractMetadataFromHtmlFile(
  filePath: string
): Promise<{ title: string | null; updated: string | null }> {
  try {
    const htmlContent = await fs.promises.readFile(filePath, "utf-8");
    const $ = cheerio.load(htmlContent);
    const title = $("title").first().text().trim() || null;
    const updated = $('meta[name="updated"]').attr("content")?.trim() || null;
    return { title, updated };
  } catch (error) {
    console.warn(
      `[extractMetadataFromHtmlFile] Error reading file "${path.basename(
        filePath
      )}": ${error instanceof Error ? error.message : String(error)}`
    );
    return { title: null, updated: null };
  }
}

export async function getHtmlPageNavigation(slug: string): Promise<{
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}> {
  const allPages = await getSortedHtmlPagesData();
  const currentIndex = allPages.findIndex((page) => page.slug === slug);
  if (currentIndex === -1) return { prev: null, next: null };
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage =
    currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;
  return {
    prev: prevPage ? { slug: prevPage.slug, title: prevPage.title } : null,
    next: nextPage ? { slug: nextPage.slug, title: nextPage.title } : null,
  };
}

export async function getHtmlCodeForPrefill(slug: string): Promise<{
  htmlBodyContent: string | null;
  css: string | null;
  js: string | null;
  js_external: string | null;
}> {
  // Correct path to use the single HTML file
  const htmlPath = path.join(HTML_PAGES_BASE_DIR, `${slug}.html`);

  let htmlBodyContent: string | null = null;
  let css: string | null = null;
  let js: string | null = null;
  const jsExternalUrls: string[] = [];

  try {
    if (!fs.existsSync(htmlPath)) {
      console.warn(`[getHtmlCodeForPrefill] HTML file not found: ${htmlPath}`);
      return { htmlBodyContent: "", css: null, js: null, js_external: null };
    }
    const htmlContent = await fs.promises.readFile(htmlPath, "utf-8");
    const $ = cheerio.load(htmlContent);

    const rawCss = $("style").first().text() || null;
    css = dedent(rawCss);

    let rawJs: string | null = null;
    $("script").each((_, element) => {
      const scriptElement = $(element);
      const src = scriptElement.attr("src");
      if (src) jsExternalUrls.push(src);
      else if (rawJs === null) rawJs = scriptElement.text() || null;
    });
    js = dedent(rawJs);

    const bodyElement = $("body");
    if (bodyElement.length > 0) {
      const clonedBody = bodyElement.clone();
      clonedBody.find("script").remove();
      htmlBodyContent = dedent(clonedBody.html() ?? "");
    } else {
      htmlBodyContent = "";
    }
  } catch (error) {
    if (
      !(error instanceof Error && "code" in error && error.code === "ENOENT")
    ) {
      console.error(
        `[getHtmlCodeForPrefill] Error processing HTML for slug "${slug}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
    return { htmlBodyContent: "", css: null, js: null, js_external: null };
  }
  const js_external =
    jsExternalUrls.length > 0 ? jsExternalUrls.join(";") : null;
  return { htmlBodyContent: htmlBodyContent || "", css, js, js_external };
}

// --- Jupyter Notebook Data Fetching ---
export function getSortedNotebooksData(): JupyterNotebookInfo[] {
  try {
    if (!fs.existsSync(NOTEBOOKS_DIR)) return [];
    const fileNames = fs.readdirSync(NOTEBOOKS_DIR);
    const allNotebooksData = fileNames
      .filter((fileName) => fileName.endsWith(".ipynb"))
      .map((fileName): JupyterNotebookInfo => {
        const slug = fileName.replace(/\.ipynb$/, "");
        const fullPath = path.join(NOTEBOOKS_DIR, fileName);
        let title: string = formatSlugToTitle(slug);
        let updated: string | null = null;
        let excerpt: string | null = null;
        let contentForExcerpt: string | null = null;

        try {
          const raw = fs.readFileSync(fullPath, "utf8");
          const json: JupyterNotebook = JSON.parse(raw);
          updated = json.metadata?.updated || null;
          const firstCell = json.cells?.[0];
          if (firstCell?.cell_type === "markdown") {
            const firstCellSource = Array.isArray(firstCell.source)
              ? firstCell.source.join("")
              : firstCell.source;
            const h1Regex = /^#\s+(.*)/m;
            const match = firstCellSource.match(h1Regex);
            if (match?.[1]) {
              title = match[1].trim();
              const remainingContent = firstCellSource
                .substring(match[0].length)
                .trim();
              if (remainingContent) contentForExcerpt = remainingContent;
              else {
                const secondMarkdownCell = json.cells?.find(
                  (cell, index) => index > 0 && cell.cell_type === "markdown"
                );
                if (secondMarkdownCell)
                  contentForExcerpt = Array.isArray(secondMarkdownCell.source)
                    ? secondMarkdownCell.source.join("")
                    : secondMarkdownCell.source;
              }
            } else contentForExcerpt = firstCellSource;
          } else {
            const firstMarkdownCellAnywhere = json.cells?.find(
              (cell) => cell.cell_type === "markdown"
            );
            if (firstMarkdownCellAnywhere)
              contentForExcerpt = Array.isArray(
                firstMarkdownCellAnywhere.source
              )
                ? firstMarkdownCellAnywhere.source.join("")
                : firstMarkdownCellAnywhere.source;
          }
          if (contentForExcerpt)
            excerpt = createExcerpt(contentForExcerpt, 120);
        } catch (err) {
          console.warn(
            `[getSortedNotebooksData] Could not process file ${fileName}:`,
            err
          );
          excerpt = `Content from notebook ${title}.`;
        }
        return { slug, title, updated, excerpt };
      });

    allNotebooksData.sort((a, b) => {
      if (a.updated && b.updated)
        return new Date(b.updated).getTime() - new Date(a.updated).getTime();
      if (a.updated) return -1;
      if (b.updated) return 1;
      return a.title.localeCompare(b.title);
    });
    return allNotebooksData;
  } catch (error) {
    console.error(`Error reading notebooks directory: ${NOTEBOOKS_DIR}`, error);
    return [];
  }
}

export function extractNotebookContentAndMetadata(notebookSlug: string): {
  content: string;
  metadata: JupyterMetadata;
  extractedTitle: string | null;
} | null {
  const fullPath = path.join(NOTEBOOKS_DIR, `${notebookSlug}.ipynb`);
  try {
    if (!fs.existsSync(fullPath)) {
      console.error(
        `[extractNotebookContentAndMetadata] File not found: ${fullPath}`
      );
      return null;
    }
    const fileContent = fs.readFileSync(fullPath, "utf-8");
    const notebookData: JupyterNotebook = JSON.parse(fileContent);
    let extractedTitle: string | null = null;
    let firstMarkdownCellSource: string | null = null;
    let h1MatchResult: RegExpMatchArray | null = null;

    const firstCell = notebookData.cells?.[0];
    if (firstCell?.cell_type === "markdown") {
      firstMarkdownCellSource = Array.isArray(firstCell.source)
        ? firstCell.source.join("")
        : firstCell.source;
      const h1Regex = /^#\s+(.*)/m;
      h1MatchResult = firstMarkdownCellSource.match(h1Regex);
      if (h1MatchResult?.[1]) extractedTitle = h1MatchResult[1].trim();
    }

    const content = notebookData.cells
      .map((cell, index) => {
        const sourceContent = Array.isArray(cell.source)
          ? cell.source.join("")
          : cell.source;
        let cellMarkdown = "";
        if (cell.cell_type === "markdown") {
          cellMarkdown =
            index === 0 &&
            extractedTitle &&
            h1MatchResult &&
            sourceContent === firstMarkdownCellSource
              ? sourceContent.substring(h1MatchResult[0].length).trimStart()
              : sourceContent;
        } else if (cell.cell_type === "code") {
          if (sourceContent)
            cellMarkdown += `\n\`\`\`python\n${sourceContent}\n\`\`\`\n`;
          let outputMarkdown = "";
          if (cell.outputs?.length) {
            const hasVisibleOutput = cell.outputs.some(
              (o) =>
                /* visible check logic */ (o.output_type === "stream" &&
                  !!(
                    Array.isArray(o.text) ? o.text.join("") : o.text || ""
                  ).trim()) ||
                ((o.output_type === "display_data" ||
                  o.output_type === "execute_result") &&
                  !!o.data &&
                  Object.keys(o.data).length > 0) ||
                o.output_type === "error"
            );
            if (hasVisibleOutput) outputMarkdown += `\n**Outputs:**\n`;
            cell.outputs.forEach((output) => {
              switch (output.output_type) {
                case "stream":
                  const streamText = (
                    Array.isArray(output.text)
                      ? output.text.join("")
                      : output.text || ""
                  ).trim();
                  if (streamText)
                    outputMarkdown += `\n\`\`\`text\n${streamText}\n\`\`\`\n`;
                  break;
                case "display_data":
                case "execute_result":
                  if (output.data) {
                    /* Prioritized output rendering logic */
                    if (output.data["image/png"])
                      outputMarkdown += `\n![Output Image](data:image/png;base64,${output.data["image/png"]})\n`;
                    else if (output.data["image/jpeg"])
                      outputMarkdown += `\n![Output Image](data:image/jpeg;base64,${output.data["image/jpeg"]})\n`;
                    else if (output.data["image/gif"])
                      outputMarkdown += `\n![Output Image](data:image/gif;base64,${output.data["image/gif"]})\n`;
                    else if (output.data["text/html"]) {
                      const html = (
                        Array.isArray(output.data["text/html"])
                          ? output.data["text/html"].join("")
                          : output.data["text/html"] || ""
                      ).trim();
                      if (html)
                        outputMarkdown += `\n<div class="html-table-output overflow-x-auto text-xs">\n${html}\n</div>\n`;
                    } else if (output.data["text/markdown"]) {
                      const md = (
                        Array.isArray(output.data["text/markdown"])
                          ? output.data["text/markdown"].join("")
                          : output.data["text/markdown"] || ""
                      ).trim();
                      if (md) outputMarkdown += `\n${md}\n`;
                    } else if (output.data["application/json"]) {
                      try {
                        const json = JSON.stringify(
                          output.data["application/json"],
                          null,
                          2
                        );
                        outputMarkdown += `\n\`\`\`json\n${json}\n\`\`\`\n`;
                      } catch {
                        /* ignore */
                      }
                    } else if (output.data["application/javascript"]) {
                      const js = (
                        Array.isArray(output.data["application/javascript"])
                          ? output.data["application/javascript"].join("")
                          : output.data["application/javascript"] || ""
                      ).trim();
                      if (js)
                        outputMarkdown += `\n\`\`\`javascript\n${js}\n\`\`\`\n`;
                    } else if (output.data["text/plain"]) {
                      const plain = (
                        Array.isArray(output.data["text/plain"])
                          ? output.data["text/plain"].join("")
                          : output.data["text/plain"] || ""
                      ).trim();
                      if (plain)
                        outputMarkdown += `\n\`\`\`text\n${plain}\n\`\`\`\n`;
                    }
                  }
                  break;
                case "error":
                  outputMarkdown += `\n**Error (${
                    output.ename || "Unknown Error"
                  })**: ${output.evalue || ""}\n`;
                  if (output.traceback?.length) {
                    const tb = output.traceback
                      .map((l) => l.replace(/\u001b\[[0-9;]*[mK]/g, ""))
                      .join("\n");
                    outputMarkdown += `\n\`\`\`text\n${tb}\n\`\`\`\n`;
                  }
                  break;
              }
            });
          }
          cellMarkdown += outputMarkdown;
        }
        return cellMarkdown.trim() ? cellMarkdown : null;
      })
      .filter((c): c is string => c !== null)
      .join("\n\n");

    return { content, metadata: notebookData.metadata || {}, extractedTitle };
  } catch (err) {
    console.error(
      `[extractNotebookContentAndMetadata] Failed for ${notebookSlug}:`,
      err
    );
    return null;
  }
}

export function getNotebookNavigation(slug: string): {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
} {
  const allNotebooks = getSortedNotebooksData();
  const currentIndex = allNotebooks.findIndex((note) => note.slug === slug);
  if (currentIndex === -1) return { prev: null, next: null };
  const prevNotebook = currentIndex > 0 ? allNotebooks[currentIndex - 1] : null;
  const nextNotebook =
    currentIndex < allNotebooks.length - 1
      ? allNotebooks[currentIndex + 1]
      : null;
  return {
    prev: prevNotebook
      ? { slug: prevNotebook.slug, title: prevNotebook.title }
      : null,
    next: nextNotebook
      ? { slug: nextNotebook.slug, title: nextNotebook.title }
      : null,
  };
}

// --- New Combined Helper ---
/**
 * Identifies content type and fetches basic metadata for metadata generation.
 */
export async function getContentTypeAndBaseMeta(slug: string): Promise<{
  type: "notebook" | "htmlPage" | "notFound";
  title: string;
  description?: string;
}> {
  const notebookPath = path.join(NOTEBOOKS_DIR, `${slug}.ipynb`);
  if (fs.existsSync(notebookPath)) {
    // Minimal read just for metadata if possible, or full extract if needed
    const noteData = extractNotebookContentAndMetadata(slug);
    const title = noteData?.extractedTitle || formatSlugToTitle(slug);
    const description = `Detailed notes on '${title}'. Explore insights and technical learnings.`;
    return { type: "notebook", title, description };
  }

  const htmlPath = path.join(HTML_PAGES_BASE_DIR, `${slug}.html`);
  if (fs.existsSync(htmlPath)) {
    const { title: extractedTitle } = await extractMetadataFromHtmlFile(
      htmlPath
    ); // Use internal helper
    const title = extractedTitle || formatSlugToTitle(slug);
    const description = `Explore '${title}', an interactive demo/vibe.`;
    return { type: "htmlPage", title, description };
  }

  return { type: "notFound", title: formatSlugToTitle(slug) };
}
