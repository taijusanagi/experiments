#!/usr/bin/env python3
import json
from pathlib import Path
from datetime import datetime
import subprocess
import sys

def update_metadata(file_path):
    path = Path(file_path)
    if not path.exists():
        return

    try:
        with open(path, 'r', encoding='utf-8') as f:
            nb = json.load(f)

        now = datetime.utcnow().isoformat() + 'Z'
        metadata = nb.setdefault('metadata', {})
        if 'created' not in metadata:
            metadata['created'] = now
        metadata['updated'] = now

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(nb, f, indent=1)
            f.write('\n')

        # Stage the modified file
        subprocess.run(['git', 'add', str(path)])

    except Exception as e:
        print(f"Failed to update {file_path}: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    for file in sys.argv[1:]:
        if file.endswith('.ipynb'):
            update_metadata(file)

    sys.exit(0)
