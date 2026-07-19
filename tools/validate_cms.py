#!/usr/bin/env python3
"""Valida estructura, encabezados y registros del CMS sin generar archivos."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from cms_pipeline import validate_workbook

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('cms', type=Path)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    sheets, errors = validate_workbook(args.cms)
    report = {
        'ok': not errors,
        'cms': args.cms.name,
        'sheets': {name: len(rows) for name, rows in sheets.items()},
        'errors': errors,
    }
    text = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(text, encoding='utf-8')
    print(text, end='')
    return 1 if errors else 0

if __name__ == '__main__':
    raise SystemExit(main())
