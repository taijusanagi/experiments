// src/lib/vibes.ts (or your specified path)
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

// --- Helper Function: Format Slug to Title (Fallback) ---
export function formatSlugToTitle(slug: string): string {
  // Keep this simple helper as it's still used for fallbacks
  return slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// --- Helper Function: Get Title from Vibe's HTML (Async ONLY) ---
export async function getVibeTitleFromHtml(slug: string): Promise<string> {
  const htmlFilePath = path.join(
    process.cwd(),
    "public",
    "vibes",
    slug,
    "index.html"
  );
  const fallbackTitle = formatSlugToTitle(slug); // Use formatted slug as default

  try {
    // Use async readFile
    const htmlContent = await fs.promises.readFile(htmlFilePath, "utf-8");
    const $ = cheerio.load(htmlContent);
    const title = $("title").first().text().trim();

    return title || fallbackTitle; // Return extracted title or fallback
  } catch (error) {
    // File not found (ENOENT) is common, other errors might occur
    if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
      // Log unexpected errors, but still return fallback for ENOENT
      console.warn(
        `Error reading or parsing title for vibe "${slug}": ${error.message}`
      );
    } else if (
      !(error instanceof Error && "code" in error && error.code === "ENOENT")
    ) {
      // Log if it's not an Error object or not ENOENT specifically
      console.warn(
        `Non-standard error reading/parsing title for vibe "${slug}":`,
        error
      );
    }
    // For ENOENT (file not found) or other handled errors, just return fallback silently or with minimal logging
    // console.debug(`Vibe HTML or title not found for "${slug}". Using fallback.`);
    return fallbackTitle;
  }
}
