#!/usr/bin/env python3

import nbformat
import sys
import os

def clean_notebook(path: str) -> None:
    with open(path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)

    original_cell_count = len(nb.cells)
    cleaned_cells = []

    for cell in nb.cells:
        # Skip empty cells
        source = cell.source if isinstance(cell.source, str) else ''.join(cell.source)
        if not source.strip() and cell.cell_type in ("code", "markdown"):
            continue

        if cell.cell_type == "code":
            cell.execution_count = None  # Remove execution count
            # Optional: strip metadata if you want a clean diff
            cell.metadata = {}
        elif cell.cell_type == "markdown":
            cell.metadata = {}

        cleaned_cells.append(cell)

    if len(cleaned_cells) < original_cell_count:
        nb.cells = cleaned_cells
        with open(path, 'w', encoding='utf-8') as f:
            nbformat.write(nb, f)
        print(f"Cleaned: {path}")
    else:
        print(f"No changes needed: {path}")

if __name__ == "__main__":
    for notebook_path in sys.argv[1:]:
        if os.path.isfile(notebook_path):
            clean_notebook(notebook_path)
