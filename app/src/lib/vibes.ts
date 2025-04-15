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
    "vibes",
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
    // console.warn(`[getVibeDataFromHtml] Error for slug "${slug}": ${error instanceof Error ? error.message : String(error)}`);
    return { title: fallbackTitle, updated: null };
  }
}

// getSortedVibesData function... (as before, ensure it's exported)
export async function getSortedVibesData(): Promise<VibeData[]> {
  // ... implementation unchanged
  const vibesDirectory = path.join(process.cwd(), "public", "vibes");
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

// --- Helper to read file content safely ---
async function readFileContent(filePath: string): Promise<string | null> {
  try {
    // Check if file exists before attempting to read
    if (!fs.existsSync(filePath)) {
      return null; // Return null if file doesn't exist
    }
    return await fs.promises.readFile(filePath, "utf-8");
  } catch (error) {
    // Log errors other than file not found (ENOENT handled by existsSync)
    if (
      !(error instanceof Error && "code" in error && error.code === "ENOENT")
    ) {
      console.warn(
        `Error reading file ${filePath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
    return null; // Return null on error
  }
}

// --- NEW: Function to get code snippets for CodePen Prefill ---
/**
 * Reads a vibe's index.html file and extracts content for CodePen prefill:
 * - HTML: Inner HTML of the <body> tag, *with all <script> tags removed*.
 * - CSS: Content of the first <style> tag.
 * - JS: Content of the first embedded <script> tag (no src).
 * - JS External: Semicolon-separated URLs from <script src="..."> tags.
 */
export async function getVibeCodeForPrefill(slug: string): Promise<{
  htmlBodyContent: string | null; // Body HTML *without* scripts
  css: string | null;
  js: string | null;
  js_external: string | null;
}> {
  const htmlPath = path.join(
    process.cwd(),
    "public",
    "vibes",
    slug,
    "index.html"
  );

  let htmlBodyContent: string | null = null;
  let css: string | null = null;
  let js: string | null = null; // Will hold embedded script content
  const jsExternalUrls: string[] = [];

  try {
    // Check if file exists first
    if (!fs.existsSync(htmlPath)) {
      console.warn(`[getVibeCodeForPrefill] HTML file not found: ${htmlPath}`);
      return { htmlBodyContent: null, css: null, js: null, js_external: null };
    }

    const htmlContent = await fs.promises.readFile(htmlPath, "utf-8");
    const $ = cheerio.load(htmlContent);

    // 1. Extract CSS (from first <style> tag) - Do this first
    css = $("style").first().html()?.trim() || null;

    // 2. Extract JS (from first embedded <script>) and external URLs - Do this second
    $("script").each((index, element) => {
      const scriptElement = $(element);
      const src = scriptElement.attr("src");
      if (src) {
        jsExternalUrls.push(src);
      } else if (js === null) {
        // Store the first embedded script's content
        js = scriptElement.html()?.trim() || null;
      }
    });

    // 3. Prepare HTML body content *without* any script tags
    const bodyElement = $("body");
    if (bodyElement.length > 0) {
      const clonedBody = bodyElement.clone(); // Clone the body element
      clonedBody.find("script").remove(); // Find and remove ALL script tags within the clone
      htmlBodyContent = clonedBody.html()?.trim() ?? ""; // Get HTML of the modified clone, default to empty string if null/undefined
    } else {
      htmlBodyContent = ""; // Default to empty string if no body tag found
    }
  } catch (error) {
    // Handle errors during file reading or parsing
    if (
      !(error instanceof Error && "code" in error && error.code === "ENOENT")
    ) {
      console.error(
        `[getVibeCodeForPrefill] Error processing HTML for slug "${slug}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
    return { htmlBodyContent: null, css: null, js: null, js_external: null }; // Return nulls on error
  }

  // 4. Format external JS URLs
  const js_external =
    jsExternalUrls.length > 0 ? jsExternalUrls.join(";") : null;

  // Return extracted CSS, embedded JS, external JS, and the *cleaned* body HTML
  return { htmlBodyContent, css, js, js_external };
}
