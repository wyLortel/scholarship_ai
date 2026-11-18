#!/usr/bin/env python3
"""문서 패키지 내부 링크/JSON/필수 파일 검사 (Python 표준 라이브러리만 사용)."""
from pathlib import Path
import json, re, sys

ROOT = Path(__file__).resolve().parents[1]
required = [
    'README.md','CLAUDE.md','AGENTS.md',
    'docs/01-domain/02-to-be.md','docs/01-domain/04-business-rules.md',
    'docs/01-domain/05-eligibility-policy.md','docs/01-domain/06-state-machines.md',
    'docs/02-product/01-PRD.md','docs/03-architecture/01-architecture-v7.md',
    'contracts/api-draft.yaml','examples/eligibility-cases.json',
]
errors = []
for path in required:
    if not (ROOT/path).is_file():
        errors.append(f'필수 파일 없음: {path}')
for path in ROOT.rglob('*.md'):
    content = path.read_text(encoding='utf-8')
    for match in re.finditer(r'(?<!!)\[[^\]\n]+\]\(([^)]+)\)',content):
        target = match.group(1).split('#')[0]
        if not target or '://' in target or target.startswith(('mailto:', '#')):
            continue
        if not (path.parent/target).exists():
            errors.append(f'깨진 문서 링크: {path.relative_to(ROOT)} -> {target}')
for path in ROOT.rglob('*.json'):
    try:
        json.loads(path.read_text(encoding='utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError) as ex:
        errors.append(f'JSON 오류: {path.relative_to(ROOT)}: {ex}')
print(f'Markdown: {len(list(ROOT.rglob("*.md")))} | JSON: {len(list(ROOT.rglob("*.json")))} | ADR: {len(list((ROOT/"docs/03-architecture/adr").glob("[0-9]*.md")))}')
if errors:
    for error in errors:
        print('ERROR:',error)
    sys.exit(1)
print('PASS: 내부 링크, 필수 파일, JSON 구조 검사')
print('주의: 업무 정합성·API 의미·코드 실행·라이선스/성능 검증까지 통과했다는 뜻은 아님.')
