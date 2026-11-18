// 커밋 메시지 규칙 (Conventional Commits). 형식: type(#이슈): 설명
// 예: feat(#27): evaluate AND rule tree, test(#24): loader rejects missing evidence
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "test", "refactor", "chore", "docs", "style", "perf", "ci", "build", "revert"],
    ],
    // 한국어 설명·고유명사(TEST_ONLY, FastAPI) 대소문자를 막지 않는다.
    "subject-case": [0],
  },
};
