// lib/notes.ts
import fs from "fs";
import path from "path";
import { remark } from "remark";
import strip from "strip-markdown";

// --- Interfaces (Updated) ---

// Define a basic structure for cell outputs
interface Output {
  output_type: string; // e.g., "stream", "display_data", "execute_result", "error"
  name?: string; // e.g., "stdout", "stderr" (for stream)
  text?: string[] | string; // for stream
  data?: { [mimeType: string]: any }; // for display_data, execute_result (e.g., "text/plain", "image/png")
  ename?: string; // for error
  evalue?: string; // for error
  traceback?: string[]; // for error
}

interface JupyterCell {
  cell_type: "markdown" | "code" | "raw";
  source: string[] | string;
  outputs?: Output[]; // Added: To access code cell outputs
  execution_count?: number | null; // Optional: Standard field for code cells
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
  title: string;
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
    // Also strip code blocks and outputs for a cleaner excerpt
    const cleanedText = plainText
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/\*\*Outputs:\*\*/g, "") // Remove output headers
      .replace(/\*\*Error.*?:\*\*/g, "") // Remove error headers
      .replace(/!\[.*?\]\(data:image.*?\)/g, "[Image Output]") // Replace images
      .replace(/_\w+?_:/g, "") // Remove stream names like _stdout_:
      .replace(/\n{2,}/g, "\n") // Collapse multiple newlines
      .trim();

    if (!cleanedText) return null;
    if (cleanedText.length <= maxLength) return cleanedText;
    const truncated = cleanedText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return (
      (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "..."
    );
  } catch (error) {
    console.error("Error creating excerpt:", error);
    // Fallback to simpler stripping if remark fails
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

// --- getSortedNotesData (Updated createExcerpt call) ---
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
      const slug = fileName.replace(/\.ipynb$/, "");
      const fullPath = path.join(notesDirectory, fileName);

      let title: string = formatSlugToTitle(slug);
      let updated: string | null = null;
      let excerpt: string | null = null;
      let contentForExcerpt: string | null = null; // Markdown content before outputs

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
              // Look for the next markdown cell if the first one only had the H1
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
            // First cell is markdown but no H1 found
            contentForExcerpt = firstCellSource;
          }
        } else {
          // First cell wasn't markdown, find the first markdown cell anywhere
          const firstMarkdownCellAnywhere = json.cells?.find(
            (cell) => cell.cell_type === "markdown"
          );
          if (firstMarkdownCellAnywhere) {
            contentForExcerpt = Array.isArray(firstMarkdownCellAnywhere.source)
              ? firstMarkdownCellAnywhere.source.join("")
              : firstMarkdownCellAnywhere.source;
          }
        }

        // Use the potentially updated createExcerpt function
        if (contentForExcerpt) {
          excerpt = createExcerpt(contentForExcerpt, 120);
        }
      } catch (err) {
        console.warn(`Could not process file ${fileName}:`, err);
        // Fallback excerpt if parsing failed but we have a title
        excerpt = `Content from notebook ${title}.`;
      }
      return { slug, title, updated, excerpt };
    });

  // Sorting remains the same
  return allNotesData.sort((a, b) => {
    if (a.updated && b.updated) {
      return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    }
    if (a.updated) return -1; // Notes with dates come first
    if (b.updated) return 1;
    // Fallback sort by title if dates are missing/equal
    return a.title.localeCompare(b.title);
  });
}

// --- Modify extractMarkdownContentAndMetadata to include outputs ---
export function extractMarkdownContentAndMetadata(notebookPath: string): {
  content: string;
  metadata: JupyterMetadata;
  extractedTitle: string | null;
} | null {
  try {
    const fullPath = notebookPath; // Assume notebookPath is already the full path
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

    // --- Extract Title Logic (same as before) ---
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
    // -------------------------

    // --- Construct Content, including outputs (with requested formatting changes) ---
    const content = notebookData.cells
      .map((cell, index) => {
        const sourceContent = Array.isArray(cell.source)
          ? cell.source.join("")
          : cell.source;
        let cellMarkdown = "";

        // Handle Markdown cells
        if (cell.cell_type === "markdown") {
          if (
            index === 0 &&
            extractedTitle !== null &&
            h1MatchResult &&
            sourceContent === firstMarkdownCellSource
          ) {
            cellMarkdown = sourceContent
              .substring(h1MatchResult[0].length)
              .trimStart();
          } else {
            cellMarkdown = sourceContent;
          }
        }
        // Handle Code cells (Source + Outputs)
        else if (cell.cell_type === "code") {
          // Add the source code block
          if (sourceContent) {
            cellMarkdown += `\n\`\`\`python\n${sourceContent}\n\`\`\`\n`;
          }

          // Process and add outputs
          let outputMarkdown = "";
          if (cell.outputs && cell.outputs.length > 0) {
            // Keep the main outputs header if there are any outputs
            let hasVisibleOutput = cell.outputs.some((output) => {
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
                  return true; // Always consider errors visible
                default:
                  return false;
              }
            });

            if (hasVisibleOutput) {
              outputMarkdown += `\n**Outputs:**\n`; // Main header for the outputs section
            }

            cell.outputs.forEach((output) => {
              switch (output.output_type) {
                case "stream":
                  // REMOVED: const streamName = output.name || "stream";
                  const streamText = (
                    Array.isArray(output.text)
                      ? output.text.join("")
                      : output.text || ""
                  ).trim();
                  if (streamText) {
                    // REMOVED: _${streamName}_: label
                    outputMarkdown += `\n\`\`\`text\n${streamText}\n\`\`\`\n`;
                  }
                  break;
                case "display_data":
                case "execute_result":
                  if (output.data) {
                    // --- Output Priority: image > html > markdown > json > javascript > text/plain ---
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
                      // CHANGED: Removed <details> wrapper
                      if (htmlContent) outputMarkdown += `\n${htmlContent}\n`;
                    } else if (output.data["text/markdown"]) {
                      const mdContent = (
                        Array.isArray(output.data["text/markdown"])
                          ? output.data["text/markdown"].join("")
                          : output.data["text/markdown"] || ""
                      ).trim();
                      if (mdContent) outputMarkdown += `\n${mdContent}\n`; // Render markdown directly
                    } else if (output.data["application/json"]) {
                      try {
                        const jsonString = JSON.stringify(
                          output.data["application/json"],
                          null,
                          2
                        );
                        // REMOVED: _json_: label
                        outputMarkdown += `\n\`\`\`json\n${jsonString}\n\`\`\`\n`;
                      } catch {
                        /* ignore json stringify errors */
                      }
                    } else if (output.data["application/javascript"]) {
                      const jsContent = (
                        Array.isArray(output.data["application/javascript"])
                          ? output.data["application/javascript"].join("")
                          : output.data["application/javascript"] || ""
                      ).trim();
                      if (jsContent) {
                        // REMOVED: _javascript_: label
                        outputMarkdown += `\n\`\`\`javascript\n${jsContent}\n\`\`\`\n`;
                      }
                    } else if (output.data["text/plain"]) {
                      const plainText = (
                        Array.isArray(output.data["text/plain"])
                          ? output.data["text/plain"].join("")
                          : output.data["text/plain"] || ""
                      ).trim();
                      if (plainText) {
                        // REMOVED: _text/plain_: label
                        outputMarkdown += `\n\`\`\`text\n${plainText}\n\`\`\`\n`;
                      }
                    }
                    // Add more MIME type handlers here if needed (without labels)
                  }
                  break;
                case "error":
                  // Keep the main error header
                  outputMarkdown += `\n**Error (${
                    output.ename || "Unknown Error"
                  })**: ${output.evalue || ""}\n`;
                  if (output.traceback && output.traceback.length > 0) {
                    // Clean up ANSI escape codes from traceback
                    const cleanedTraceback = output.traceback
                      .map(
                        (line) => line.replace(/\u001b\[[0-9;]*[mK]/g, "") // ANSI color/format codes
                      )
                      .join("\n");
                    outputMarkdown += `\n\`\`\`text\n${cleanedTraceback}\n\`\`\`\n`;
                  }
                  break;
                default:
                  // Optionally log unknown output types
                  // console.log(`Unknown output type: ${output.output_type}`);
                  break;
              }
            });
          }
          // Append formatted outputs to the cell markdown
          cellMarkdown += outputMarkdown;
        }
        // Handle other cell types (like 'raw') - return empty string
        else {
          cellMarkdown = "";
        }

        return cellMarkdown; // Return the markdown for this cell
      })
      .filter(Boolean) // Remove any empty strings
      .join("\n\n"); // Join the processed content blocks with double newlines

    return { content, metadata: notebookData.metadata || {}, extractedTitle };
  } catch (err) {
    console.error(`Failed to parse notebook at path ${notebookPath}:`, err);
    return null;
  }
}

// --- getNavigation (remains the same, uses getSortedNotesData which has correct titles) ---
export function getNavigation(slug: string): {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
} {
  const allNotes = getSortedNotesData();
  const currentIndex = allNotes.findIndex((note) => note.slug === slug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prevNote = currentIndex > 0 ? allNotes[currentIndex - 1] : null;
  const nextNote =
    currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null;

  return {
    prev: prevNote ? { slug: prevNote.slug, title: prevNote.title } : null,
    next: nextNote ? { slug: nextNote.slug, title: nextNote.title } : null,
  };
}
