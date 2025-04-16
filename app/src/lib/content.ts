// src/lib/content.ts
// Combined processor for HTML page data ("vibes") and Jupyter Notebook data ("notes")

import fs from "fs";
import path from "path";
import * as cheerio from "cheerio"; // For HTML processing
import { remark } from "remark"; // For Markdown processing (Jupyter)
import strip from "strip-markdown"; // For Markdown processing (Jupyter)

// --- Common Helper Function (Internalized) ---

/**
 * Formats a slug (e.g., 'my-first-post' or 'my_notebook') into a title-case string.
 * Used internally by both HTML and Jupyter processing logic.
 * @param slug The input slug string.
 * @returns A title-cased string.
 */
export function formatSlugToTitle(slug: string): string {
  // Handles both '-' and '_' as separators
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// --- HTML File Processing ("Vibes") ---

// Constants for HTML processing
const HTML_PAGES_BASE_DIR = path.join(process.cwd(), "public", "standalone");

// Interfaces for HTML processing
export interface HtmlPageData {
  slug: string;
  title: string;
  updated: string | null;
}

// --- Helper Function to Extract Metadata from a Single HTML File ---
// (This replaces the logic previously embedded in getHtmlPageData which expected a directory)

/**
 * Reads a single HTML file and extracts its title and updated metadata.
 * @param filePath The full path to the HTML file.
 * @returns An object containing the title and updated date, or nulls if not found/error.
 */
export async function extractMetadataFromHtmlFile(
  filePath: string
): Promise<{ title: string | null; updated: string | null }> {
  try {
    const htmlContent = await fs.promises.readFile(filePath, "utf-8");
    const $ = cheerio.load(htmlContent);
    // Extract title, return null if empty string or not found
    const title = $("title").first().text().trim() || null;
    // Extract updated date from meta tag, return null if not found or empty
    const updated = $('meta[name="updated"]').attr("content")?.trim() || null;
    return { title, updated };
  } catch (error) {
    // Log specific file error but don't stop processing others
    console.warn(
      `[extractMetadataFromHtmlFile] Error reading/parsing file "${path.basename(
        filePath
      )}": ${error instanceof Error ? error.message : String(error)}`
    );
    // Return nulls so the main function can handle fallbacks
    return { title: null, updated: null };
  }
}

/**
 * Reads all HTML page directories, extracts metadata, and sorts them by date (newest first).
 * @returns A promise resolving to an array of sorted HtmlPageData objects.
 */
export async function getSortedHtmlPagesData(): Promise<HtmlPageData[]> {
  try {
    // Check if the base directory exists
    if (!fs.existsSync(HTML_PAGES_BASE_DIR)) {
      console.warn(`HTML pages directory not found: ${HTML_PAGES_BASE_DIR}`);
      return [];
    }

    // Read directory contents
    const dirents = await fs.promises.readdir(HTML_PAGES_BASE_DIR, {
      withFileTypes: true,
    });

    // Filter for files ending with .html
    const htmlFiles = dirents.filter(
      (dirent) => dirent.isFile() && dirent.name.endsWith(".html")
    );

    // If no HTML files found, return empty array
    if (htmlFiles.length === 0) {
      console.log(`No .html files found in ${HTML_PAGES_BASE_DIR}`);
      return [];
    }

    // Process each HTML file to get its data
    const pageDataPromises = htmlFiles.map(
      async (dirent): Promise<HtmlPageData> => {
        const filename = dirent.name;
        // Use filename without .html as the slug
        const slug = filename.replace(/\.html$/, "");
        const fullPath = path.join(HTML_PAGES_BASE_DIR, filename);

        // Extract metadata directly from the file
        const { title: extractedTitle, updated: extractedUpdated } =
          await extractMetadataFromHtmlFile(fullPath);

        // Provide a fallback title based on the slug if extraction failed
        const title = extractedTitle || formatSlugToTitle(slug);

        return {
          slug,
          title,
          updated: extractedUpdated, // Keep updated as null if not found
        };
      }
    );

    // Wait for all file processing to complete
    const allPagesData = await Promise.all(pageDataPromises);

    // Sort the results based on 'updated' date (descending) and then title (ascending)
    allPagesData.sort((a, b) => {
      // Sort by date (newest first)
      if (a.updated && !b.updated) return -1; // a has date, b doesn't -> a comes first
      if (!a.updated && b.updated) return 1; // b has date, a doesn't -> b comes first
      if (a.updated && b.updated) {
        // Both have dates, compare them
        const dateComparison =
          new Date(b.updated).getTime() - new Date(a.updated).getTime();
        // If dates differ, return comparison result
        if (dateComparison !== 0) return dateComparison;
      }
      // If dates are the same or both are null, sort by title alphabetically
      return a.title.localeCompare(b.title);
    });

    return allPagesData;
  } catch (error) {
    // Log error if reading the directory itself fails
    console.error(
      `[getSortedHtmlPagesData] Error reading directory ${HTML_PAGES_BASE_DIR}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return []; // Return empty array on error
  }
}

/**
 * Gets the previous and next HTML page based on the date-sorted list.
 * @param slug The slug of the current HTML page.
 * @returns An object containing navigation links (prev/next) or null.
 */
export async function getHtmlPageNavigation(slug: string): Promise<{
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}> {
  const allPages = await getSortedHtmlPagesData(); // Use renamed function
  const currentIndex = allPages.findIndex((page) => page.slug === slug);

  if (currentIndex === -1) {
    console.warn(`[getHtmlPageNavigation] HTML Slug "${slug}" not found.`);
    return { prev: null, next: null };
  }

  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage =
    currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  return {
    prev: prevPage ? { slug: prevPage.slug, title: prevPage.title } : null,
    next: nextPage ? { slug: nextPage.slug, title: nextPage.title } : null,
  };
}

// --- Helper for HTML Code Extraction ---
/**
 * Removes common leading whitespace from each line of a multiline string.
 * Handles cases where some lines might have less indentation (e.g., blank lines).
 * (Internal helper for getHtmlCodeForPrefill)
 */
function dedent(str: string | null): string | null {
  if (!str) return null;

  const lines = str.split("\n");
  let minIndent: number | null = null;

  lines.forEach((line) => {
    const match = line.match(/^(\s*)\S/);
    if (match) {
      const indentLength = match[1].length;
      if (minIndent === null || indentLength < minIndent) {
        minIndent = indentLength;
      }
    }
  });

  if (minIndent === null || minIndent === 0) {
    let firstLine = 0;
    while (firstLine < lines.length && lines[firstLine].match(/^\s*$/)) {
      firstLine++;
    }
    let lastLine = lines.length - 1;
    while (lastLine >= firstLine && lines[lastLine].match(/^\s*$/)) {
      lastLine--;
    }
    if (firstLine > lastLine) return "";
    return lines.slice(firstLine, lastLine + 1).join("\n");
  }

  const dedentedLines = lines.map((line) => {
    if (line.match(/^\s/)) {
      return line.slice(minIndent as number);
    }
    return line;
  });

  let firstLine = 0;
  while (
    firstLine < dedentedLines.length &&
    dedentedLines[firstLine].match(/^\s*$/)
  ) {
    firstLine++;
  }
  let lastLine = dedentedLines.length - 1;
  while (lastLine >= firstLine && dedentedLines[lastLine].match(/^\s*$/)) {
    lastLine--;
  }
  if (firstLine > lastLine) return "";

  return dedentedLines.slice(firstLine, lastLine + 1).join("\n");
}

/**
 * Reads an HTML page file and extracts content for CodePen prefill:
 * HTML (body minus scripts), CSS (first style tag), JS (first embedded script), External JS URLs.
 * @param slug The slug identifying the HTML page directory.
 * @returns An object containing extracted code components.
 */
export async function getHtmlCodeForPrefill(slug: string): Promise<{
  htmlBodyContent: string | null;
  css: string | null;
  js: string | null;
  js_external: string | null;
}> {
  const htmlPath = path.join(HTML_PAGES_BASE_DIR, slug, "index.html");

  let htmlBodyContent: string | null = null;
  let rawCss: string | null = null;
  let css: string | null = null;
  let rawJs: string | null = null;
  let js: string | null = null;
  const jsExternalUrls: string[] = [];

  try {
    if (!fs.existsSync(htmlPath)) {
      console.warn(`[getHtmlCodeForPrefill] HTML file not found: ${htmlPath}`);
      return { htmlBodyContent: "", css: null, js: null, js_external: null };
    }

    const htmlContent = await fs.promises.readFile(htmlPath, "utf-8");
    const $ = cheerio.load(htmlContent);

    rawCss = $("style").first().text() || null;
    css = dedent(rawCss); // Apply dedent

    $("script").each((index, element) => {
      const scriptElement = $(element);
      const src = scriptElement.attr("src");
      if (src) {
        jsExternalUrls.push(src);
      } else if (rawJs === null) {
        rawJs = scriptElement.text() || null;
      }
    });
    js = dedent(rawJs); // Apply dedent

    const bodyElement = $("body");
    if (bodyElement.length > 0) {
      const clonedBody = bodyElement.clone();
      clonedBody.find("script").remove();
      htmlBodyContent = dedent(clonedBody.html() ?? ""); // Apply dedent
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

  return {
    htmlBodyContent: htmlBodyContent || "",
    css: css,
    js: js,
    js_external,
  };
}

// --- Jupyter Notebook File Processing ("Notes") ---

// Constants for Jupyter processing
// Note: Adjust this path if needed relative to where this combined script runs.
// If running from project root, this should likely be "notes/jupyter"
// If running from src/lib, "../notes/jupyter" might be correct. Assuming project root.
const NOTEBOOKS_DIR = path.resolve(process.cwd(), "../contents");

// Interfaces for Jupyter Notebook structure (internal)
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

// Interfaces for Jupyter processing (exported)
export interface JupyterMetadata {
  updated?: string | null;
  created?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface JupyterNotebookInfo {
  slug: string;
  title: string;
  updated: string | null;
  excerpt: string | null;
}

// --- Helpers for Jupyter Processing ---

/**
 * Creates a short plain text excerpt from Markdown content.
 * (Internal helper for getSortedNotebooksData)
 * @param markdownContent The Markdown content string.
 * @param maxLength The maximum length of the excerpt.
 * @returns A truncated plain text string or null.
 */
function createExcerpt(
  markdownContent: string | null | undefined,
  maxLength: number = 150
): string | null {
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

/**
 * Reads all Jupyter Notebook files (.ipynb), extracts metadata and excerpt, and sorts them by date.
 * @returns An array of sorted JupyterNotebookInfo objects.
 */
export function getSortedNotebooksData(): JupyterNotebookInfo[] {
  let fileNames: string[];
  try {
    // Ensure the directory exists before reading
    if (!fs.existsSync(NOTEBOOKS_DIR)) {
      console.warn(`Notebooks directory not found: ${NOTEBOOKS_DIR}`);
      return [];
    }
    fileNames = fs.readdirSync(NOTEBOOKS_DIR);
  } catch (error) {
    console.error("Error reading notebooks directory:", NOTEBOOKS_DIR, error);
    return [];
  }

  const allNotebooksData = fileNames
    .filter((fileName) => fileName.endsWith(".ipynb"))
    .map((fileName): JupyterNotebookInfo => {
      const slug = fileName.replace(/\.ipynb$/, "");
      const fullPath = path.join(NOTEBOOKS_DIR, fileName);

      let title: string = formatSlugToTitle(slug); // Use internal helper
      let updated: string | null = null;
      let excerpt: string | null = null;
      let contentForExcerpt: string | null = null;

      try {
        const raw = fs.readFileSync(fullPath, "utf8");
        const json: JupyterNotebook = JSON.parse(raw);

        updated = json.metadata?.updated || null;

        const firstCell = json.cells?.[0];
        if (firstCell && firstCell.cell_type === "markdown") {
          const firstCellSource = Array.isArray(firstCell.source)
            ? firstCell.source.join("")
            : firstCell.source;
          const h1Regex = /^#\s+(.*)/m;
          const match = firstCellSource.match(h1Regex);

          if (match && match[1]) {
            title = match[1].trim();
            const h1LineEndIndex = match[0].length;
            const remainingContent = firstCellSource
              .substring(h1LineEndIndex)
              .trim();
            if (remainingContent) {
              contentForExcerpt = remainingContent;
            } else {
              const secondMarkdownCell = json.cells?.find(
                (cell, index) => index > 0 && cell.cell_type === "markdown"
              );
              if (secondMarkdownCell) {
                contentForExcerpt = Array.isArray(secondMarkdownCell.source)
                  ? secondMarkdownCell.source.join("")
                  : secondMarkdownCell.source;
              }
            }
          } else {
            contentForExcerpt = firstCellSource;
          }
        } else {
          const firstMarkdownCellAnywhere = json.cells?.find(
            (cell) => cell.cell_type === "markdown"
          );
          if (firstMarkdownCellAnywhere) {
            contentForExcerpt = Array.isArray(firstMarkdownCellAnywhere.source)
              ? firstMarkdownCellAnywhere.source.join("")
              : firstMarkdownCellAnywhere.source;
          }
        }

        if (contentForExcerpt) {
          excerpt = createExcerpt(contentForExcerpt, 120); // Use internal helper
        }
      } catch (err) {
        console.warn(
          `[getSortedNotebooksData] Could not process file ${fileName}:`,
          err
        );
        excerpt = `Content from notebook ${title}.`;
      }
      return { slug, title, updated, excerpt };
    });

  return allNotebooksData.sort((a, b) => {
    if (a.updated && b.updated) {
      return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    }
    if (a.updated) return -1;
    if (b.updated) return 1;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Extracts combined Markdown content (including code cells and outputs) and metadata from a Jupyter Notebook.
 * @param notebookSlug The slug of the notebook (without .ipynb extension).
 * @returns An object containing the Markdown content, metadata, and extracted title, or null if parsing fails.
 */
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

    // Extract Title Logic
    const firstCell = notebookData.cells?.[0];
    if (firstCell && firstCell.cell_type === "markdown") {
      firstMarkdownCellSource = Array.isArray(firstCell.source)
        ? firstCell.source.join("")
        : firstCell.source;
      const h1Regex = /^#\s+(.*)/m;
      h1MatchResult = firstMarkdownCellSource.match(h1Regex);
      if (h1MatchResult && h1MatchResult[1]) {
        extractedTitle = h1MatchResult[1].trim();
      }
    }

    // Construct Content, including outputs
    const content = notebookData.cells
      .map((cell, index) => {
        const sourceContent = Array.isArray(cell.source)
          ? cell.source.join("")
          : cell.source;
        let cellMarkdown = "";

        if (cell.cell_type === "markdown") {
          if (
            index === 0 &&
            extractedTitle !== null &&
            h1MatchResult &&
            sourceContent === firstMarkdownCellSource
          ) {
            // Remove H1 only if it was used for the title
            cellMarkdown = sourceContent
              .substring(h1MatchResult[0].length)
              .trimStart();
          } else {
            cellMarkdown = sourceContent;
          }
        } else if (cell.cell_type === "code") {
          if (sourceContent) {
            cellMarkdown += `\n\`\`\`python\n${sourceContent}\n\`\`\`\n`;
          }

          let outputMarkdown = "";
          if (cell.outputs && cell.outputs.length > 0) {
            const hasVisibleOutput = cell.outputs.some((output) => {
              switch (output.output_type) {
                case "stream":
                  return !!(
                    Array.isArray(output.text)
                      ? output.text.join("")
                      : output.text || ""
                  ).trim();
                case "display_data":
                case "execute_result":
                  return !!output.data && Object.keys(output.data).length > 0;
                case "error":
                  return true;
                default:
                  return false;
              }
            });

            if (hasVisibleOutput) {
              outputMarkdown += `\n**Outputs:**\n`;
            }

            cell.outputs.forEach((output) => {
              switch (output.output_type) {
                case "stream":
                  const streamText = (
                    Array.isArray(output.text)
                      ? output.text.join("")
                      : output.text || ""
                  ).trim();
                  if (streamText) {
                    outputMarkdown += `\n\`\`\`text\n${streamText}\n\`\`\`\n`;
                  }
                  break;
                case "display_data":
                case "execute_result":
                  if (output.data) {
                    if (output.data["image/png"]) {
                      outputMarkdown += `\n![Output Image](data:image/png;base64,${output.data["image/png"]})\n`;
                    } else if (output.data["image/jpeg"]) {
                      outputMarkdown += `\n![Output Image](data:image/jpeg;base64,${output.data["image/jpeg"]})\n`;
                    } else if (output.data["image/gif"]) {
                      outputMarkdown += `\n![Output Image](data:image/gif;base64,${output.data["image/gif"]})\n`;
                    } else if (output.data["text/html"]) {
                      const htmlContent = (
                        Array.isArray(output.data["text/html"])
                          ? output.data["text/html"].join("")
                          : output.data["text/html"] || ""
                      ).trim();
                      if (htmlContent) {
                        outputMarkdown += `\n<div class="html-table-output overflow-x-auto text-xs">\n${htmlContent}\n</div>\n`;
                      }
                    } else if (output.data["text/markdown"]) {
                      const mdContent = (
                        Array.isArray(output.data["text/markdown"])
                          ? output.data["text/markdown"].join("")
                          : output.data["text/markdown"] || ""
                      ).trim();
                      if (mdContent) outputMarkdown += `\n${mdContent}\n`;
                    } else if (output.data["application/json"]) {
                      try {
                        const jsonString = JSON.stringify(
                          output.data["application/json"],
                          null,
                          2
                        );
                        outputMarkdown += `\n\`\`\`json\n${jsonString}\n\`\`\`\n`;
                      } catch {
                        /* ignore */
                      }
                    } else if (output.data["application/javascript"]) {
                      const jsContent = (
                        Array.isArray(output.data["application/javascript"])
                          ? output.data["application/javascript"].join("")
                          : output.data["application/javascript"] || ""
                      ).trim();
                      if (jsContent) {
                        outputMarkdown += `\n\`\`\`javascript\n${jsContent}\n\`\`\`\n`;
                      }
                    } else if (output.data["text/plain"]) {
                      const plainText = (
                        Array.isArray(output.data["text/plain"])
                          ? output.data["text/plain"].join("")
                          : output.data["text/plain"] || ""
                      ).trim();
                      if (plainText) {
                        outputMarkdown += `\n\`\`\`text\n${plainText}\n\`\`\`\n`;
                      }
                    }
                  }
                  break;
                case "error":
                  outputMarkdown += `\n**Error (${
                    output.ename || "Unknown Error"
                  })**: ${output.evalue || ""}\n`;
                  if (output.traceback && output.traceback.length > 0) {
                    const cleanedTraceback = output.traceback
                      .map((line) => line.replace(/\u001b\[[0-9;]*[mK]/g, ""))
                      .join("\n");
                    outputMarkdown += `\n\`\`\`text\n${cleanedTraceback}\n\`\`\`\n`;
                  }
                  break;
                default:
                  break;
              }
            });
          }
          cellMarkdown += outputMarkdown;
        } else {
          cellMarkdown = ""; // Ignore 'raw' cells etc.
        }

        return cellMarkdown.trim() ? cellMarkdown : null; // Return null for empty cells
      })
      .filter((content): content is string => content !== null) // Filter out nulls/empty strings
      .join("\n\n"); // Join non-empty cell content

    return { content, metadata: notebookData.metadata || {}, extractedTitle };
  } catch (err) {
    console.error(
      `[extractNotebookContentAndMetadata] Failed to parse notebook ${notebookSlug}:`,
      err
    );
    return null;
  }
}

/**
 * Gets the previous and next Jupyter Notebook based on the date-sorted list.
 * @param slug The slug of the current notebook.
 * @returns An object containing navigation links (prev/next) or null.
 */
export function getNotebookNavigation(slug: string): {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
} {
  const allNotebooks = getSortedNotebooksData(); // Use renamed function
  const currentIndex = allNotebooks.findIndex(
    (notebook) => notebook.slug === slug
  );

  if (currentIndex === -1) {
    console.warn(`[getNotebookNavigation] Notebook Slug "${slug}" not found.`);
    return { prev: null, next: null };
  }

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
