// lib/notes.ts
import fs from "fs";
import path from "path";
import { remark } from "remark";
import strip from "strip-markdown";

// --- Interfaces (remain the same) ---
interface JupyterCell {
  cell_type: "markdown" | "code" | "raw";
  source: string[] | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: { [key: string]: any };
}
interface JupyterMetadata {
  updated?: string | null;
  created?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
interface JupyterNotebook {
  cells: JupyterCell[];
  metadata: JupyterMetadata;
}
export interface NoteInfo {
  slug: string;
  title: string; // This now holds the actual H1 title or fallback
  updated: string | null;
  excerpt: string | null;
}

// --- Constants and Helpers (remain the same) ---
const notesDirectory = path.resolve(process.cwd(), "../notes/src");

export function formatSlugToTitle(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

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
    const trimmedText = plainText.trim();
    if (!trimmedText) return null;
    if (trimmedText.length <= maxLength) return trimmedText;
    const truncated = trimmedText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return (
      (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "..."
    );
  } catch (error) {
    console.error("Error creating excerpt:", error);
    const simpleText = Array.isArray(markdownContent)
      ? markdownContent.join("")
      : markdownContent;
    const trimmed = simpleText.replace(/^[#*->\s]+|[#*->\s]+$/g, "").trim();
    if (!trimmed) return null;
    return trimmed.length > maxLength
      ? trimmed.substring(0, maxLength) + "..."
      : trimmed;
  }
}

// --- getSortedNotesData (remains the same as previous version) ---
// It already extracts the correct title into the 'title' field.
export function getSortedNotesData(): NoteInfo[] {
  let fileNames: string[];
  try {
    fileNames = fs.readdirSync(notesDirectory);
  } catch (error) {
    console.error("Error reading notes directory:", notesDirectory, error);
    return [];
  }

  const allNotesData = fileNames
    .filter((fileName) => fileName.endsWith(".ipynb"))
    .map((fileName): NoteInfo => {
      // Explicitly type the return for clarity
      const slug = fileName.replace(/\.ipynb$/, "");
      const fullPath = path.join(notesDirectory, fileName);

      let title: string = formatSlugToTitle(slug);
      let updated: string | null = null;
      let excerpt: string | null = null;
      let contentForExcerpt: string | null = null;

      try {
        const raw = fs.readFileSync(fullPath, "utf8");
        const json: JupyterNotebook = JSON.parse(raw);

        if (json.metadata && json.metadata.updated) {
          updated = json.metadata.updated;
        }

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
          excerpt = createExcerpt(contentForExcerpt, 120);
        }
      } catch (err) {
        console.warn(`Could not process file ${fileName}:`, err);
      }
      return { slug, title, updated, excerpt };
    });

  return allNotesData.sort((a, b) => {
    if (a.updated && b.updated) {
      return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    }
    if (a.updated) return -1;
    if (b.updated) return 1;
    return a.title.localeCompare(b.title);
  });
}

// --- Modify extractMarkdownContentAndMetadata return type ---
export function extractMarkdownContentAndMetadata(notebookPath: string): {
  content: string;
  metadata: JupyterMetadata;
  extractedTitle: string | null;
} | null {
  try {
    const fullPath = notebookPath;
    if (!fs.existsSync(fullPath)) {
      console.error(
        `File not found in extractMarkdownContentAndMetadata: ${fullPath}`
      );
      return null;
    }

    const fileContent = fs.readFileSync(fullPath, "utf-8");
    const notebookData: JupyterNotebook = JSON.parse(fileContent);

    let extractedTitle: string | null = null;
    let firstMarkdownCellSource: string | null = null;
    let h1MatchResult: RegExpMatchArray | null = null;

    // --- Extract Title Logic ---
    const firstCell = notebookData.cells?.[0];
    if (firstCell && firstCell.cell_type === "markdown") {
      firstMarkdownCellSource = Array.isArray(firstCell.source)
        ? firstCell.source.join("")
        : firstCell.source;
      const h1Regex = /^#\s+(.*)/m;
      h1MatchResult = firstMarkdownCellSource.match(h1Regex); // Store the match result
      if (h1MatchResult && h1MatchResult[1]) {
        extractedTitle = h1MatchResult[1].trim();
      }
    }
    // -------------------------

    // --- Construct Content, *excluding* the H1 line from the first cell if found ---
    const content = notebookData.cells
      .map((cell, index) => {
        const sourceContent = Array.isArray(cell.source)
          ? cell.source.join("")
          : cell.source;

        // Handle Markdown cells
        if (cell.cell_type === "markdown") {
          // If this is the *first* cell AND we *extracted a title* from it...
          if (
            index === 0 &&
            extractedTitle !== null &&
            h1MatchResult &&
            sourceContent === firstMarkdownCellSource
          ) {
            // ...return the content *after* the H1 line.
            const h1LineEndIndex = h1MatchResult[0].length;
            return sourceContent.substring(h1LineEndIndex).trimStart(); // Remove leading whitespace too
          } else {
            // Otherwise, return the full markdown content for this cell
            return sourceContent;
          }
        }
        // Handle Code cells
        if (cell.cell_type === "code") {
          return sourceContent
            ? `\n\`\`\`python\n${sourceContent}\n\`\`\``
            : "";
        }
        // Handle other cell types (like 'raw') - return empty string or handle as needed
        return "";
      })
      .filter(Boolean) // Remove any empty strings resulting from ignored cells or empty processing
      .join("\n\n"); // Join the processed content blocks

    // Return extracted title, processed content, and metadata
    return { content, metadata: notebookData.metadata || {}, extractedTitle };
  } catch (err) {
    console.error(`Failed to parse notebook at path ${notebookPath}:`, err);
    return null;
  }
}

// --- Update getNavigation to use the real title ---
export function getNavigation(slug: string): {
  prev: { slug: string; title: string } | null; // title is now the real title
  next: { slug: string; title: string } | null; // title is now the real title
} {
  const allNotes = getSortedNotesData(); // This now returns NoteInfo[] with real titles
  const currentIndex = allNotes.findIndex((note) => note.slug === slug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prevNote = currentIndex > 0 ? allNotes[currentIndex - 1] : null;
  const nextNote =
    currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null;

  // Use the title directly from the NoteInfo object
  return {
    prev: prevNote ? { slug: prevNote.slug, title: prevNote.title } : null, // Use prevNote.title
    next: nextNote ? { slug: nextNote.slug, title: nextNote.title } : null, // Use nextNote.title
  };
}
