// lib/notes.ts (create this file)
import fs from "fs";
import path from "path";

interface JupyterCell {
  cell_type: "markdown" | "code" | "raw";
  source: string[] | string;
}

interface JupyterMetadata {
  updated?: string | null;
  created?: string | null;
}

interface JupyterNotebook {
  cells: JupyterCell[];
  metadata: JupyterMetadata;
}

// Resolve the notes directory relative to the current working directory (project root)
// Adjust the path 'notes/src' if your notebooks are elsewhere relative to your project root.
const notesDirectory = path.resolve(process.cwd(), "../notes/src");

// Helper function to format slug into a title
export function formatSlugToTitle(slug: string): string {
  return slug
    .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}

export interface NoteInfo {
  slug: string;
  title: string;
  // You could add date here later: mtime?: Date;
}

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
      const title = formatSlugToTitle(slug);
      const fullPath = path.join(notesDirectory, fileName);

      try {
        const raw = fs.readFileSync(fullPath, "utf8");
        const json: JupyterNotebook = JSON.parse(raw);
        const updated = json.metadata.updated || null;
        return { slug, title, updated };
      } catch (err) {
        console.warn(`Could not parse metadata for ${fileName}`, err);
        return { slug, title };
      }
    });

  return allNotesData.sort((a, b) => {
    if (!a.updated || !b.updated) return 0;
    return new Date(b.updated).getTime() - new Date(a.updated).getTime();
  });
}

export function extractMarkdownContentAndMetadata(
  notebookPath: string
): { content: string; metadata: JupyterMetadata } | null {
  try {
    const fullPath = path.resolve(process.cwd(), notebookPath);

    if (!fs.existsSync(fullPath)) return null;

    const fileContent = fs.readFileSync(fullPath, "utf-8");
    const notebookData: JupyterNotebook = JSON.parse(fileContent);

    console.log("notebookData", notebookData);

    const content = notebookData.cells
      .map((cell) => {
        const content = Array.isArray(cell.source)
          ? cell.source.join("")
          : cell.source;
        if (cell.cell_type === "markdown") return content;
        if (cell.cell_type === "code")
          return `\n\`\`\`python\n${content}\n\`\`\``;
        return "";
      })
      .join("\n\n");

    return { content, metadata: notebookData.metadata };
  } catch (err) {
    console.error("Failed to parse notebook:", err);
    return null;
  }
}
