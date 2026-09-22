// RoutineCard.stories.tsx — SOLUTION DE RÉFÉRENCE. ENDROIT 5 : le catalogue des états.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoutineCard } from "./RoutineCard";

const meta = {
  title: "TribuZen/RoutineCard",
  component: RoutineCard,
} satisfies Meta<typeof RoutineCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: "success",
    tasks: [
      { id: "t1", label: "Brossage de dents", time: "8h00" },
      { id: "t2", label: "Devoirs", time: "17h00" },
    ],
  },
};

export const Vide: Story = {
  args: { status: "success", tasks: [] },
};

export const Chargement: Story = {
  args: { status: "loading" },
};

export const Erreur: Story = {
  args: { status: "error", message: "Impossible de charger les routines.", onRetry: () => {} },
};
