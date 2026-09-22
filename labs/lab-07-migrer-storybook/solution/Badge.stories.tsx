// Badge.stories.tsx — SOLUTION DE RÉFÉRENCE (commentée). Ne l'ouvre pas avant ton GREEN.
// CSF3 : `meta` = la config du fichier, chaque export nommé = un OBJET story, plus une
// fonction "template" à bind() — c'est ce que `composeStories` sait composer proprement.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../Badge";

const meta = {
  title: "TribuZen/Badge",
  component: Badge,
  args: { children: "Actif" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { tone: "success" } };
export const Warning: Story = { args: { tone: "warning" } };
export const Danger: Story = { args: { tone: "danger" } };
