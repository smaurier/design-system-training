// Text.stories.tsx — SOLUTION : une story ajoutée, un argType ajouté, le reste intact.
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
    lines: { control: { type: "number", min: 1, max: 6 } },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Muted: Story = { args: { tone: "muted" } };
export const Danger: Story = { args: { tone: "danger", weight: "bold", children: "Invitation expirée." } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg", weight: "bold" } };
export const Inline: Story = { args: { as: "span", children: "en ligne" } };

// La nouvelle prop a sa story : c'est elle que le reviewer ouvre et que Chromatic photographie.
export const Clamped: Story = {
  args: {
    lines: 3,
    children:
      "Pique-nique dimanche au parc, apportez les gourdes, les casquettes et le ballon ; on se retrouve à onze heures près du kiosque, puis balade jusqu'au lac si le temps le permet, sinon repli chez Mamie avec les jeux de société et le gâteau au chocolat.",
  },
  parameters: { layout: "padded" },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
};
