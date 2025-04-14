// lib/notes.ts (create this file)
import fs from "fs";
import path from "path";

interface JupyterCell {
  cell_type: "markdown" | "code" | "raw";
  source: string[] | string;
}

interface JupyterNotebook {
  cells: JupyterCell[];
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
    return []; // Return empty if directory doesn't exist or isn't readable
  }

  const allNotesData = fileNames
    .filter((fileName) => fileName.endsWith(".ipynb")) // Ensure we only process notebook files
    .map((fileName) => {
      // Remove ".ipynb" from file name to get slug
      const slug = fileName.replace(/\.ipynb$/, "");
      const title = formatSlugToTitle(slug);

      // Optional: Get modification time
      // try {
      //   const fullPath = path.join(notesDirectory, fileName);
      //   const stats = fs.statSync(fullPath);
      //   return { slug, title, mtime: stats.mtime };
      // } catch (statError) {
      //   console.error(`Could not get stats for ${fileName}`, statError);
      //   return { slug, title };
      // }

      return { slug, title };
    });

  // Sort notes by slug (alphabetically)
  // Replace with date sort if mtime is added and desired:
  // return allNotesData.sort((a, b) => (a.mtime && b.mtime ? (a.mtime < b.mtime ? 1 : -1) : 0));
  return allNotesData.sort((a, b) => a.slug.localeCompare(b.slug));
}

export function convertNotebookToMarkdown(notebookPath: string): string | null {
  try {
    const fullPath = path.resolve(process.cwd(), notebookPath);

    if (!fs.existsSync(fullPath)) return null;

    const fileContent = fs.readFileSync(fullPath, "utf-8");
    const notebookData: JupyterNotebook = JSON.parse(fileContent);

    console.log("notebookData", notebookData);

    return notebookData.cells
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
  } catch (err) {
    console.error("Failed to parse notebook:", err);
    return null;
  }
}
