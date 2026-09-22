// Button.stories.tsx — SOLUTION DE RÉFÉRENCE. ENDROIT 5 : chaque état du bouton a sa story.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "TribuZen/Button",
  component: Button,
  args: { children: "Enregistrer" },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Danger: Story = { args: { variant: "danger", children: "Supprimer la famille" } };
export const Small: Story = { args: { size: "sm" } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const AsLink: Story = {
  args: { asChild: true, children: <a href="/famille/dupont">Voir la famille</a> },
};
