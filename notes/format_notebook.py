#!/usr/bin/env python3

import nbformat
import sys
import os
from datetime import datetime, timezone
import subprocess # <--- Add this import

def format_notebook(path: str) -> None:
    """
    Cleans and updates metadata for a Jupyter Notebook.
    - Removes empty code/markdown cells.
    - Removes execution counts from code cells.
    - Clears metadata from code and markdown cells.
    - Adds/updates 'created' and 'updated' timestamps in notebook metadata.
    - Re-stages the file if changes were made. (CAUTION)
    """
    # ... (Keep the reading logic as before) ...
    try:
        with open(path, 'r', encoding='utf-8') as f:
            nb = nbformat.read(f, as_version=4)
    except Exception as e:
        print(f"Error reading notebook {path}: {e}", file=sys.stderr)
        sys.exit(f"Failed to read {path}")

    made_changes = False
    original_content_for_comparison = nbformat.writes(nb) # Store original state string

    # --- 1. Update Top-Level Metadata Timestamps ---
    # ... (Keep the timestamp logic as before) ...
    now_utc = datetime.now(timezone.utc).isoformat()

    if not isinstance(nb.get('metadata'), dict):
        nb['metadata'] = {}
        # No need to set made_changes here, we compare content later

    if 'created' not in nb.metadata:
        nb.metadata['created'] = now_utc
        # No need to set made_changes here

    nb.metadata['updated'] = now_utc # Always set it

    # --- 2. Clean Cells ---
    # ... (Keep the cell cleaning logic as before, but without setting made_changes) ...
    original_cell_count = len(nb.cells)
    cleaned_cells = []
    cells_removed = False

    for cell in nb.cells:
        cell_modified = False
        source = cell.source if isinstance(cell.source, str) else ''.join(cell.source)
        if not source.strip() and cell.cell_type in ("code", "markdown"):
            cells_removed = True
            print(f"   - Removing empty {cell.cell_type} cell from {path}")
            continue

        if cell.cell_type == "code":
            if cell.execution_count is not None:
                cell.execution_count = None
                cell_modified = True
                print(f"   - Cleared execution count in code cell for {path}")
            if cell.metadata:
                cell.metadata = {}
                cell_modified = True
                print(f"   - Cleared metadata in code cell for {path}")
        elif cell.cell_type == "markdown":
             if cell.metadata:
                cell.metadata = {}
                cell_modified = True
                print(f"   - Cleared metadata in markdown cell for {path}")

        cleaned_cells.append(cell)

    if cells_removed:
        nb.cells = cleaned_cells


    # --- 3. Check if Content Actually Changed and Write/Stage ---
    final_content_for_comparison = nbformat.writes(nb)

    # Compare the serialized string representation
    if final_content_for_comparison != original_content_for_comparison:
        made_changes = True # Set flag only if content differs

    if made_changes:
        print(f"Formatting changes detected for: {path}")
        try:
            with open(path, 'w', encoding='utf-8') as f:
                # Use nbformat.write for proper writing, not the comparison string
                nbformat.write(nb, f)
            print(f"   - Saved changes to: {path}")

            # --- Add the explicit git add ---
            # Use check=True to raise an error if git add fails
            subprocess.run(['git', 'add', path], check=True)
            print(f"   - Re-staged modified file: {path}")
            # --- End of addition ---

        except Exception as e:
            print(f"Error writing or staging notebook {path}: {e}", file=sys.stderr)
            sys.exit(f"Failed to write or stage {path}")
    else:
        print(f"No formatting changes needed for: {path}")

# ... (Keep the if __name__ == "__main__": block as before) ...
if __name__ == "__main__":
    # ... (rest of the script) ...
     sys.exit(0) # Script exits successfully
