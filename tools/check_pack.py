#!/usr/bin/env python3
"""문서 패키지 검사 (Python 표준 라이브러리만 사용).

검사: 필수 파일, 내부 링크, JSON 구조, 추적 ID(AC/BR/FR/NFR/OPEN/EV/ST/OP)의
정의 존재·중복 정의·축약 표기, FR↔AC 커버리지.
사용: python3 tools/check_pack.py [검사할 루트]   (기본: 이 저장소)
"""
from pathlib import Path
import json, re, sys

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]

# ── 설정: 문서가 이동하면 여기만 고친다 ─────────────────────────────
REQUIRED = [
    'README.md', 'CLAUDE.md', 'AGENTS.md',
    'docs/01-domain/02-to-be.md', 'docs/01-domain/04-business-rules.md',
    'docs/01-domain/05-eligibility-policy.md', 'docs/01-domain/06-state-machines.md',
    'docs/02-product/01-PRD.md', 'docs/03-architecture/01-architecture-v7.md',
    'docs/04-delivery/01-acceptance-tests.md', 'docs/04-delivery/workflow.md',
    'contracts/api-draft.yaml', 'examples/eligibility-cases.json',
]
# 접두사 → 정의 소유 문서. 정의 = 소유 문서의 `### ID` 제목 또는 표의 첫 칸.
OWNERS = {
    'AC': 'docs/04-delivery/01-acceptance-tests.md',
    'BR': 'docs/01-domain/04-business-rules.md',
    'FR': 'docs/02-product/01-PRD.md',
    'NFR': 'docs/02-product/01-PRD.md',
    'OPEN': 'docs/00-governance/03-open-decisions.md',
    'EV': 'docs/00-governance/01-evidence.md',
    'ST': 'docs/02-product/01-PRD.md',
    'OP': 'docs/02-product/01-PRD.md',
}
AC_FILE = OWNERS['AC']
SKIP_DIRS = {'reference', '.git', 'node_modules', '.venv', 'dist'}  # 의존성·빌드 산출물은 문서 팩이 아님
JSONC_FILES = re.compile(r'^tsconfig(\..+)?\.json$')  # TypeScript 설정은 주석 허용 JSONC
# ────────────────────────────────────────────────────────────────

PREFIX = '|'.join(sorted(OWNERS, key=len, reverse=True))
ID_RE = re.compile(rf'\b(?:{PREFIX})-[A-Z]?\d+\b')
DEF_RE = re.compile(rf'^(?:###\s+|\|\s*)((?:{PREFIX})-[A-Z]?\d+)\b', re.M)
# 다른 문서에서 정의처럼 재서술: `### AC-..` 제목 또는 "- `AC-..`:" 글머리
REDEF_RE = re.compile(rf'^(?:###\s+|[-*]\s+`)((?:{PREFIX})-[A-Z]?\d+)\b', re.M)
ABBR_RE = re.compile(rf'\b(?:{PREFIX})-[A-Z]?\d+(?:\s*~|/(?=[A-Za-z0-9])|\*(?!\*))|\b(?:{PREFIX})-[A-Z]?\*(?!\*)')

errors = []
rel = lambda p: p.relative_to(ROOT).as_posix()

def files(*exts):
    for ext in exts:
        for p in sorted(ROOT.rglob(f'*.{ext}')):
            if not SKIP_DIRS & set(p.relative_to(ROOT).parts):
                yield p

for path in REQUIRED:
    if not (ROOT / path).is_file():
        errors.append(f'필수 파일 없음: {path}')

# 1) 내부 링크
for path in files('md'):
    for m in re.finditer(r'(?<!!)\[[^\]\n]+\]\(([^)]+)\)', path.read_text(encoding='utf-8')):
        target = m.group(1).split('#')[0]
        if not target or '://' in target or target.startswith(('mailto:', '#')):
            continue
        if not (path.parent / target).exists():
            errors.append(f'깨진 문서 링크: {rel(path)} -> {target}')

# 2) JSON 구조
for path in files('json'):
    if JSONC_FILES.match(path.name):
        continue
    try:
        json.loads(path.read_text(encoding='utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError) as ex:
        errors.append(f'JSON 오류: {rel(path)}: {ex}')

# 3) ID 정의 수집 (소유 문서에서만)
defined = {}
for prefix, owner in OWNERS.items():
    p = ROOT / owner
    if not p.is_file():
        continue
    for m in DEF_RE.finditer(p.read_text(encoding='utf-8')):
        id_ = m.group(1)
        if id_.split('-')[0] != prefix:
            continue
        if id_ in defined:
            errors.append(f'중복 정의: {id_} ({owner})')
        defined[id_] = owner

# 4) 인용 검사: 미정의 / 소유 문서 밖 재정의 / 축약 표기
for path in files('md', 'json', 'yaml', 'yml'):
    text = path.read_text(encoding='utf-8')
    r = rel(path)
    for m in ID_RE.finditer(text):
        if m.group(0) not in defined:
            line = text.count('\n', 0, m.start()) + 1
            errors.append(f'미정의 ID: {m.group(0)} ({r}:{line})')
    for m in REDEF_RE.finditer(text):
        id_ = m.group(1)
        if OWNERS.get(id_.split('-')[0]) != r:
            line = text.count('\n', 0, m.start()) + 1
            errors.append(f'소유 문서 밖 재정의: {id_} ({r}:{line}) — 원본: {OWNERS[id_.split("-")[0]]}')
    for m in ABBR_RE.finditer(text):
        line = text.count('\n', 0, m.start()) + 1
        errors.append(f'축약 ID 표기(개별 ID로 풀 것): "{m.group(0).strip()}" ({r}:{line})')

# 5) FR↔AC 커버리지 (AC 각 블록의 `연결:` 줄 기준; AC-R은 운영 시험이라 제외)
ac_path = ROOT / AC_FILE
if ac_path.is_file():
    ac_text = ac_path.read_text(encoding='utf-8')
    covered = set()
    for block in re.split(r'^(?=###\s)', ac_text, flags=re.M):
        head = re.match(r'###\s+(AC-[A-Z]\d+)', block)
        if not head:
            continue
        ac = head.group(1)
        link = re.search(r'^-\s*연결:(.*)$', block, re.M)
        frs = set(re.findall(r'\bFR-[A-Z]\d+\b', link.group(1))) if link else set()
        if not frs:
            errors.append(f'FR 연결 없음: {ac} ({AC_FILE}의 `- 연결:` 줄에 FR 추가)')
        covered |= frs
    for fr in sorted(i for i in defined if i.startswith('FR-')):
        if fr not in covered:
            errors.append(f'AC 미연결 FR: {fr} (어떤 AC의 `연결:` 줄에도 없음)')

n_md = len(list(files('md')))
n_adr = len(list((ROOT / 'docs/03-architecture/adr').glob('[0-9]*.md')))
print(f'Markdown: {n_md} | JSON: {len(list(files("json")))} | ADR: {n_adr} | 정의된 ID: {len(defined)}')
if errors:
    for e in errors:
        print('ERROR:', e)
    sys.exit(1)
print('PASS: 필수 파일, 내부 링크, JSON, ID 정의·중복·축약, FR↔AC 커버리지')
print('주의: FR↔AC 연결의 **의미**가 맞는지, 업무 정합성·코드 실행은 검사하지 않음(사람 검토 필요).')
