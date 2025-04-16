// src/lib/vibes.ts
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

// Interface VibeData (ensure it's exported or accessible)
export interface VibeData {
  slug: string;
  title: string;
  updated: string | null;
}

// formatSlugToTitle function... (as before)
export function formatSlugToTitle(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// getVibeDataFromHtml function... (as before)
export async function getVibeDataFromHtml(
  slug: string
): Promise<{ title: string; updated: string | null }> {
  // ... implementation unchanged
  const htmlFilePath = path.join(
    process.cwd(),
    "public",
    "vibes-standalone",
    slug,
    "index.html"
  );
  const fallbackTitle = formatSlugToTitle(slug);
  try {
    const htmlContent = await fs.promises.readFile(htmlFilePath, "utf-8");
    const $ = cheerio.load(htmlContent);
    const title = $("title").first().text().trim();
    const updated = $('meta[name="updated"]').attr("content")?.trim() || null;
    return { title: title || fallbackTitle, updated: updated };
  } catch (error) {
    // Basic error logging, returns fallback
    console.warn(
      `[getVibeDataFromHtml] Error for slug "${slug}": ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return { title: fallbackTitle, updated: null };
  }
}

// getSortedVibesData function... (as before, ensure it's exported)
export async function getSortedVibesData(): Promise<VibeData[]> {
  // ... implementation unchanged
  const vibesDirectory = path.join(process.cwd(), "public", "vibes-standalone");
  try {
    if (!fs.existsSync(vibesDirectory)) return [];
    const dirents = await fs.promises.readdir(vibesDirectory, {
      withFileTypes: true,
    });
    const directories = dirents.filter((dirent) => dirent.isDirectory());
    if (directories.length === 0) return [];

    const vibeDataPromises = directories.map(
      async (dirent): Promise<VibeData> => {
        const slug = dirent.name;
        const { title, updated } = await getVibeDataFromHtml(slug);
        return { slug, title, updated };
      }
    );
    const allVibesData = await Promise.all(vibeDataPromises);
    allVibesData.sort((a, b) => {
      // Sort logic unchanged
      if (a.updated && !b.updated) return -1;
      if (!a.updated && b.updated) return 1;
      if (a.updated && b.updated) {
        const dateComparison =
          new Date(b.updated).getTime() - new Date(a.updated).getTime();
        if (dateComparison !== 0) return dateComparison;
      }
      return a.title.localeCompare(b.title);
    });
    return allVibesData;
  } catch (error) {
    console.error(
      `[getSortedVibesData] Error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return [];
  }
}

// --- NEW: getVibeNavigation ---
/**
 * Gets the previous and next vibe based on the sorted list (by date).
 */
export async function getVibeNavigation(slug: string): Promise<{
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}> {
  const allVibes = await getSortedVibesData(); // Get vibes sorted by date
  const currentIndex = allVibes.findIndex((vibe) => vibe.slug === slug);

  if (currentIndex === -1) {
    console.warn(`[getVibeNavigation] Slug "${slug}" not found.`);
    return { prev: null, next: null };
  }

  const prevVibe = currentIndex > 0 ? allVibes[currentIndex - 1] : null;
  const nextVibe =
    currentIndex < allVibes.length - 1 ? allVibes[currentIndex + 1] : null;

  return {
    prev: prevVibe ? { slug: prevVibe.slug, title: prevVibe.title } : null,
    next: nextVibe ? { slug: nextVibe.slug, title: nextVibe.title } : null,
  };
}

// --- DEDENT HELPER FUNCTION ---
/**
 * Removes common leading whitespace from each line of a multiline string.
 * Handles cases where some lines might have less indentation (e.g., blank lines).
 */
function dedent(str: string | null): string | null {
  if (!str) return null;

  const lines = str.split("\n");
  let minIndent: number | null = null;

  // First pass: find the minimum indentation of non-blank lines
  lines.forEach((line) => {
    const match = line.match(/^(\s*)\S/); // Find leading whitespace before first non-whitespace char
    if (match) {
      // If the line has non-whitespace content
      const indentLength = match[1].length;
      if (minIndent === null || indentLength < minIndent) {
        minIndent = indentLength;
      }
    }
  });

  // If no common indentation found (minIndent is null or 0)
  if (minIndent === null || minIndent === 0) {
    // Trim only leading/trailing blank lines
    let firstLine = 0;
    while (firstLine < lines.length && lines[firstLine].match(/^\s*$/)) {
      firstLine++;
    }
    let lastLine = lines.length - 1;
    while (lastLine >= firstLine && lines[lastLine].match(/^\s*$/)) {
      lastLine--;
    }
    // Handle case where all lines were blank
    if (firstLine > lastLine) return "";
    // Return original content, but vertically trimmed
    return lines.slice(firstLine, lastLine + 1).join("\n");
  }

  // Second pass: remove the minimum indentation from each line
  const dedentedLines = lines.map((line) => {
    // --- FIX for TypeScript ---
    // Check if the line starts with whitespace before slicing.
    // The slice method itself handles lines shorter than minIndent in JS,
    // but this check makes the intent clearer and might satisfy stricter TS rules.
    if (line.match(/^\s/)) {
      // Slice off the calculated minimum indentation
      return line.slice(minIndent as number);
    }
    // Otherwise (blank lines, lines already at margin), return as is
    return line;
    // --- END FIX ---
  });

  // Trim leading/trailing blank lines potentially left by split/dedent
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
  // Handle case where all lines became blank after dedent
  if (firstLine > lastLine) return "";

  return dedentedLines.slice(firstLine, lastLine + 1).join("\n");
}
/**
 * Reads a vibe's index.html file and extracts content for CodePen prefill:
 * - HTML: Inner HTML of the <body> tag, *with all <script> tags removed*.
 * - CSS: Content of the first <style> tag.
 * - JS: Content of the first embedded <script> tag (no src).
 * - JS External: Semicolon-separated URLs from <script src="..."> tags.
 */
export async function getVibeCodeForPrefill(slug: string): Promise<{
  htmlBodyContent: string | null;
  css: string | null; // Will be dedented CSS
  js: string | null; // Will be dedented JS
  js_external: string | null;
}> {
  const htmlPath = path.join(
    process.cwd(),
    "public",
    "vibes-standalone",
    slug,
    "index.html"
  );

  let htmlBodyContent: string | null = null;
  let rawCss: string | null = null; // Store raw CSS
  let css: string | null = null; // Store final dedented CSS
  let rawJs: string | null = null; // Store raw JS
  let js: string | null = null; // Store final dedented JS
  const jsExternalUrls: string[] = [];

  try {
    if (!fs.existsSync(htmlPath)) {
      console.warn(`[getVibeCodeForPrefill] HTML file not found: ${htmlPath}`);
      return { htmlBodyContent: "", css: null, js: null, js_external: null };
    }

    const htmlContent = await fs.promises.readFile(htmlPath, "utf-8");
    const $ = cheerio.load(htmlContent);

    // 1. Extract RAW CSS (using .text())
    rawCss = $("style").first().text() || null;

    // --- Apply dedent to CSS ---
    css = dedent(rawCss);
    // ---------------------------

    // 2. Extract RAW JS and external URLs
    $("script").each((index, element) => {
      const scriptElement = $(element);
      const src = scriptElement.attr("src");
      if (src) {
        jsExternalUrls.push(src);
      } else if (rawJs === null) {
        rawJs = scriptElement.text() || null;
      }
    });

    // --- Apply dedent to JS ---
    js = dedent(rawJs);
    // --------------------------

    // 3. Prepare HTML body content *without* any script tags
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
        `[getVibeCodeForPrefill] Error processing HTML for slug "${slug}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
    return { htmlBodyContent: "", css: null, js: null, js_external: null };
  }

  const js_external =
    jsExternalUrls.length > 0 ? jsExternalUrls.join(";") : null;

  // Return extracted *dedented* CSS, *dedented* JS, external JS, and cleaned body HTML
  return {
    htmlBodyContent: htmlBodyContent || "",
    css: css, // Use the processed (dedented) CSS
    js: js, // Use the processed (dedented) JS
    js_external,
  };
}
