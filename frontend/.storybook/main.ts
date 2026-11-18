import type { StorybookConfig } from "@storybook/nextjs-vite";

// 프론트는 테스트 코드 대신 Storybook으로 화면 상태를 확인한다.
const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  // public/icons 등 정적 파일을 Next와 같은 경로(/icons/...)로 제공
  staticDirs: ["../public"],
};

export default config;
