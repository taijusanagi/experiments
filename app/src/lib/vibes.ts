// src/lib/vibes.ts
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

// --- Define VibeData interface here ---
export interface VibeData {
  slug: string;
  title: string;
  updated: string | null;
}

// --- Helper Function: Format Slug to Title (Fallback) ---
// (Keep this if it's used elsewhere, otherwise it could be removed if only getVibeDataFromHtml uses it internally)
export function formatSlugToTitle(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// --- Helper Function: Get Title AND Updated Date from Vibe's HTML ---
// (This remains largely the same)
export async function getVibeDataFromHtml(
  slug: string
): Promise<{ title: string; updated: string | null }> {
  const htmlFilePath = path.join(
    process.cwd(),
    "public",
    "vibes",
    slug,
    "index.html"
  );
  const fallbackTitle = formatSlugToTitle(slug); // Use formatted slug as default title

  try {
    const htmlContent = await fs.promises.readFile(htmlFilePath, "utf-8");
    const $ = cheerio.load(htmlContent);
    const title = $("title").first().text().trim();
    const updated = $('meta[name="updated"]').attr("content")?.trim() || null;

    return {
      title: title || fallbackTitle,
      updated: updated,
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
      console.warn(
        `[getVibeDataFromHtml] Error reading or parsing data for vibe "${slug}": ${error.message}` // Added function context
      );
    } else if (
      !(error instanceof Error && "code" in error && error.code === "ENOENT")
    ) {
      console.warn(
        `[getVibeDataFromHtml] Non-standard error reading/parsing data for vibe "${slug}":`, // Added function context
        error
      );
    }
    return { title: fallbackTitle, updated: null };
  }
}

// --- MOVED & EXPORTED: Fetches and SORTS vibe data by date ---
/**
 * Fetches data for all vibes, including titles and updated dates,
 * and sorts them by date (newest first).
 */
export async function getSortedVibesData(): Promise<VibeData[]> {
  const vibesDirectory = path.join(process.cwd(), "public", "vibes");
  try {
    // Check if directory exists
    if (!fs.existsSync(vibesDirectory)) {
      console.warn(
        `[getSortedVibesData] Vibes directory not found: ${vibesDirectory}`
      );
      return [];
    }

    const dirents = await fs.promises.readdir(vibesDirectory, {
      withFileTypes: true,
    });
    const directories = dirents.filter((dirent) => dirent.isDirectory());

    if (directories.length === 0) {
      console.log(
        `[getSortedVibesData] No subdirectories found in ${vibesDirectory}`
      );
      return [];
    }

    const vibeDataPromises = directories.map(
      async (dirent): Promise<VibeData> => {
        const slug = dirent.name;
        // Calls the other helper function in this library file
        const { title, updated } = await getVibeDataFromHtml(slug);
        return { slug, title, updated };
      }
    );

    const allVibesData = await Promise.all(vibeDataPromises);

    // Sorting Logic (same as before)
    allVibesData.sort((a, b) => {
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
      `[getSortedVibesData] Error fetching vibes data: ${
        // Updated log source
        error instanceof Error ? error.message : String(error)
      }`
    );
    return []; // Return empty array on error
  }
}
