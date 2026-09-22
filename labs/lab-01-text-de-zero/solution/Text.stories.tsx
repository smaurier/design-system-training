// Text.stories.tsx — SOLUTION DE RÉFÉRENCE. ENDROIT 5 : le catalogue des états.
// CSF3 : l'export par défaut = la config du fichier (meta) ; chaque export nommé = une story = un état rendu.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "./Text";

const meta = {
  title: "TribuZen/Text",
  component: Text,
  args: { children: "Pique-nique dimanche au parc, apportez les gourdes." },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: ["default", "muted", "danger"] },
    weight: { control: "radio", options: ["regular", "bold"] },
    as: { control: "radio", options: ["p", "span"] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

// Le nom de l'export EST le nom affiché dans Storybook.
export const Default: Story = {};
export const Muted: Story = { args: { tone: "muted" } };
export const Danger: Story = { args: { tone: "danger", weight: "bold", children: "Invitation expirée." } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg", weight: "bold" } };
export const Inline: Story = { args: { as: "span", children: "en ligne" } };
