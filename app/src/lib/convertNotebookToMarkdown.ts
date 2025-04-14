// lib/convertNotebookToMarkdown.ts
import fs from "fs";
import path from "path";

interface JupyterCell {
  cell_type: "markdown" | "code" | "raw";
  source: string[] | string;
}

interface JupyterNotebook {
  cells: JupyterCell[];
}

export function convertNotebookToMarkdown(notebookPath: string): string | null {
  try {
    const fullPath = path.resolve(process.cwd(), notebookPath);

    if (!fs.existsSync(fullPath)) return null;

    const fileContent = fs.readFileSync(fullPath, "utf-8");
    const notebookData: JupyterNotebook = JSON.parse(fileContent);

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
