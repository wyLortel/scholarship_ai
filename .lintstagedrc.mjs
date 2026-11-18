// pre-commit에서 "스테이징된 파일만" 검사·정리한다 (3강). 전체 타입 검사·테스트는 CI(#35).
// lint-staged는 절대 경로 목록을 넘긴다.
const quote = (files) => files.map((f) => `"${f}"`).join(" ");

export default {
  // ESLint 9는 실행 위치(cwd)의 flat config를 쓰므로 frontend/ 안에서 실행한다.
  "frontend/**/*.{ts,tsx,js,jsx,mjs}": (files) => [
    `sh -c 'cd frontend && npx --no -- eslint --fix --max-warnings=0 ${quote(files)}'`,
    `prettier --write ${quote(files)}`,
  ],
  "frontend/**/*.{css,json}": (files) => `prettier --write ${quote(files)}`,
  "*.{mjs,json}": (files) => `prettier --write ${quote(files)}`,
  // 백엔드는 pyproject.toml의 ruff 설정을 그대로 쓴다. host venv: cd backend && uv sync
  "backend/**/*.py": (files) => [
    `backend/.venv/bin/ruff check --fix ${quote(files)}`,
    `backend/.venv/bin/ruff format ${quote(files)}`,
  ],
};
