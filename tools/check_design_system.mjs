#!/usr/bin/env node
/**
 * Visual-design lint (starter only). Scans frontend/src for unintended raw
 * CSS color literals. Semantically wrong UX cannot be caught by this script.
 * Uses no external dependencies. Node 18+ recommended.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_ROOTS = ["frontend/src"].filter((p) => existsSync(join(ROOT, p)));
const SKIP = new Set(["node_modules", ".next", "dist", "build", "coverage", "references"]);
const EXTENSIONS = new Set([".css", ".scss", ".tsx", ".jsx", ".ts", ".js"]);
const ALLOW_FILES = new Set(["frontend/src/design-system/design-tokens.css"]);
const findings = [];
const seen = new Set();

function traverse(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) traverse(full);
    else if (entry.isFile() && EXTENSIONS.has(extname(entry.name))) check(full);
  }
}

function check(file) {
  const relativePath = relative(ROOT, file).replaceAll("\\", "/");
  if (seen.has(relativePath) || ALLOW_FILES.has(relativePath)) return;
  seen.add(relativePath);
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  const hardcodedColors = /#[\da-fA-F]{3,8}(?![\da-fA-F])|\b(?:rgba?|hsla?)\s*\(/g;
  lines.forEach((line, i) => {
    if (line.includes("design-system-allow-color")) return;
    if (hardcodedColors.test(line))
      findings.push(
        `${relativePath}:${i + 1}: 색상 직접 지정 → 토큰으로 교체: ${line.trim().slice(0, 90)}`,
      );
    hardcodedColors.lastIndex = 0;
  });
}

for (const root of SCAN_ROOTS) traverse(join(ROOT, root));
if (SCAN_ROOTS.length === 0) {
  console.log(
    "[design-system] 검사할 소스 디렉터리가 없습니다. 실제 앱 경로에 맞춰 스크립트를 수정하세요.",
  );
  process.exit(0);
}
if (findings.length) {
  console.error("[design-system] 디자인 토큰 위반 의심:\n" + findings.join("\n"));
  process.exit(1);
}
console.log(
  "[design-system] 하드코딩한 색상 문자열 발견 안 됨. 시각/도메인 검토는 별도로 필요합니다.",
);
