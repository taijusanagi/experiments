// lib/notes.ts
import fs from "fs";
import path from "path";
import { remark } from "remark";
import strip from "strip-markdown";

// Keep Interfaces and notesDirectory the same
interface JupyterCell {
  cell_type: "markdown" | "code" | "raw";
  source: string[] | string;
  metadata?: { [key: string]: any };
}

interface JupyterMetadata {
  updated?: string | null;
  created?: string | null;
  [key: string]: any;
}

interface JupyterNotebook {
  cells: JupyterCell[];
  metadata: JupyterMetadata;
}

const notesDirectory = path.resolve(process.cwd(), "../notes/src");

// Keep the formatSlugToTitle as a fallback
export function formatSlugToTitle(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Keep NoteInfo interface the same
export interface NoteInfo {
  slug: string;
  title: string;
  updated: string | null;
  excerpt: string | null;
}

// Keep createExcerpt function the same
function createExcerpt(
  markdownContent: string | null | undefined,
  maxLength: number = 150
): string | null {
  // Handle null or undefined input gracefully
  if (!markdownContent) {
    return null;
  }
  try {
    const plainText = remark()
      .use(strip)
      .processSync(markdownContent)
      .toString();

    const trimmedText = plainText.trim();
    if (!trimmedText) return null; // Return null if stripping results in empty string

    if (trimmedText.length <= maxLength) {
      return trimmedText;
    }
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
    const trimmed = simpleText.replace(/^[#*->\s]+|[#*->\s]+$/g, "").trim(); // Basic cleanup
    if (!trimmed) return null;
    return trimmed.length > maxLength
      ? trimmed.substring(0, maxLength) + "..."
      : trimmed;
  }
}

// --- Rework getSortedNotesData logic ---
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
    .map((fileName) => {
      const slug = fileName.replace(/\.ipynb$/, "");
      const fullPath = path.join(notesDirectory, fileName);

      // Default values
      let title: string = formatSlugToTitle(slug); // Default title from slug
      let updated: string | null = null;
      let excerpt: string | null = null;
      let contentForExcerpt: string | null = null;

      try {
        const raw = fs.readFileSync(fullPath, "utf8");
        const json: JupyterNotebook = JSON.parse(raw);

        // Get metadata (updated date)
        if (json.metadata && json.metadata.updated) {
          updated = json.metadata.updated;
        }

        // --- Try to extract Title and Content for Excerpt from cells ---
        const firstCell = json.cells?.[0];

        if (firstCell && firstCell.cell_type === "markdown") {
          const firstCellSource = Array.isArray(firstCell.source)
            ? firstCell.source.join("")
            : firstCell.source;

          // Regex to find the first H1 tag at the beginning of a line
          const h1Regex = /^#\s+(.*)/m;
          const match = firstCellSource.match(h1Regex);

          if (match && match[1]) {
            // H1 found in the first cell
            title = match[1].trim(); // Use H1 content as title

            // Content for excerpt is the rest of the first cell after the H1 line
            const h1LineEndIndex = match[0].length;
            let remainingContent = firstCellSource
              .substring(h1LineEndIndex)
              .trim();

            if (remainingContent) {
              contentForExcerpt = remainingContent;
            } else {
              // If first cell only had H1, look for the next markdown cell
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
            // No H1 found in the first cell, use default title (from slug)
            // Use the entire first cell content for excerpt
            contentForExcerpt = firstCellSource;
          }
        } else {
          // First cell is not markdown or doesn't exist
          // Keep default title, try to find the *first available* markdown cell for excerpt
          const firstMarkdownCellAnywhere = json.cells?.find(
            (cell) => cell.cell_type === "markdown"
          );
          if (firstMarkdownCellAnywhere) {
            contentForExcerpt = Array.isArray(firstMarkdownCellAnywhere.source)
              ? firstMarkdownCellAnywhere.source.join("")
              : firstMarkdownCellAnywhere.source;
          }
        }
        // -----------------------------------------------------------

        // Create excerpt from the determined content
        if (contentForExcerpt) {
          excerpt = createExcerpt(contentForExcerpt, 120); // Adjust length if needed
        }
      } catch (err) {
        console.warn(`Could not process file ${fileName}:`, err);
        // Keep defaults if error occurs (title from slug, null excerpt/date)
      }

      // Return the final object
      return { slug, title, updated, excerpt };
    });

  // Sorting remains the same
  return allNotesData.sort((a, b) => {
    if (a.updated && b.updated) {
      return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    }
    if (a.updated) return -1;
    if (b.updated) return 1;
    return a.title.localeCompare(b.title);
  });
}

// extractMarkdownContentAndMetadata remains the same as before
export function extractMarkdownContentAndMetadata(
  notebookPath: string
): { content: string; metadata: JupyterMetadata } | null {
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

    const content = notebookData.cells
      .map((cell) => {
        const sourceContent = Array.isArray(cell.source)
          ? cell.source.join("")
          : cell.source;
        if (cell.cell_type === "markdown") return sourceContent;
        if (cell.cell_type === "code")
          return sourceContent
            ? `\n\`\`\`python\n${sourceContent}\n\`\`\``
            : "";
        return "";
      })
      .join("\n\n");

    return { content, metadata: notebookData.metadata || {} };
  } catch (err) {
    console.error(`Failed to parse notebook at path ${notebookPath}:`, err);
    return null;
  }
}
