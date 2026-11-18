import type { StorybookConfig } from "@storybook/nextjs-vite";

// 프론트는 테스트 코드 대신 Storybook으로 화면 상태를 확인한다.
const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
};

export default config;
