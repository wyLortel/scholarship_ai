import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Icon, ICON_NAMES } from "./Icon";

const meta = {
  title: "Design System/Icon",
  component: Icon,
  args: { name: "mascot-robot", size: 96 },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};
export const All: Story = {
  render: () => (
    <ul
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 16,
        listStyle: "none",
        padding: 0,
      }}
    >
      {ICON_NAMES.map((name) => (
        <li key={name} style={{ textAlign: "center" }}>
          <Icon name={name} size={64} />
          <br />
          <code>{name}</code>
        </li>
      ))}
    </ul>
  ),
};
