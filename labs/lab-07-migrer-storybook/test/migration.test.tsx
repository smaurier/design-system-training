// Oracle RUNTIME + STATIQUE du lab 07 DS. Ne pas modifier.
//
// Piège vérifié en construisant cet oracle : `composeStories` (Storybook 10.6) COMPOSE et
// REND encore très bien un fichier CSF2 — la compatibilité descendante de Storybook masque
// le problème en pratique, un test purement fonctionnel serait vert AVANT même la migration.
// La vraie raison de migrer n'est donc pas "ça casse" mais la SÉCURITÉ DE TYPE perdue :
// `Template.bind({})` retourne un type trop large, `Success.args = {...}` n'est plus vérifié
// par TypeScript (une faute de frappe dans `tone` ne serait jamais signalée). L'oracle
// vérifie donc, en plus du rendu (qui doit continuer à marcher), que le fichier source ne
// contient plus les patterns CSF2 et utilise bien la forme CSF3 typée.
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import * as stories from "@lab/Badge.stories";

afterEach(cleanup);

describe("Badge.stories.tsx — composeStories compose chaque story proprement (CSF3)", () => {
  const { Success, Warning, Danger } = composeStories(stories);

  it("Success rend le badge avec la classe tone-success", () => {
    render(<Success />);
    expect(screen.getByText("Actif")).toHaveClass("ds-badge--tone-success");
  });

  it("Warning rend le badge avec la classe tone-warning", () => {
    render(<Warning />);
    expect(screen.getByText("Actif")).toHaveClass("ds-badge--tone-warning");
  });

  it("Danger rend le badge avec la classe tone-danger", () => {
    render(<Danger />);
    expect(screen.getByText("Actif")).toHaveClass("ds-badge--tone-danger");
  });
});

describe("Badge.stories.tsx — meta au format CSF3", () => {
  it("expose un default export avec title et component (pas un objet CSF2 non typé)", () => {
    const meta = (stories as { default: { title?: string; component?: unknown } }).default;
    expect(meta.title).toBe("TribuZen/Badge");
    expect(meta.component).toBeDefined();
  });
});

describe("Badge.stories.tsx — plus aucun pattern CSF2 (relecture du source)", () => {
  const rawSource = readFileSync(process.env.LAB_SOURCE_PATH!, "utf8");
  const source = rawSource
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");

  it("n'utilise plus Template.bind({}) ni l'assignation .args a posteriori", () => {
    expect(source).not.toMatch(/\.bind\(\{\}\)/);
    expect(source).not.toMatch(/\.args\s*=/);
  });

  it("utilise la forme CSF3 typée : satisfies Meta<...> et StoryObj<...>", () => {
    expect(source).toMatch(/satisfies Meta</);
    expect(source).toMatch(/StoryObj</);
  });
});
