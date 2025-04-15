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
