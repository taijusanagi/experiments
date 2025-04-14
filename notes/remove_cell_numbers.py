#!/usr/bin/env python3
import json
import sys

notebook = json.load(sys.stdin)

# Remove execution counts but keep outputs
for cell in notebook['cells']:
    if 'execution_count' in cell:
        cell['execution_count'] = None

json.dump(notebook, sys.stdout, indent=1)
