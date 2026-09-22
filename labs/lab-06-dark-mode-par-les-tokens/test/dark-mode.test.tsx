// Oracle RUNTIME + STATIQUE du lab 06 DS. Ne pas modifier. `Text.tsx`/`Button.tsx` sont
// DONNÉS à la racine du lab (pas dans src/ ni solution/) — tu ne peux structurellement pas
// les modifier pour "faire passer" ce lab, seul `tokens.css` est à ta portée.
//
// Piège vérifié en construisant cet oracle : jsdom ne résout PAS la cascade CSS des
// propriétés custom à travers `getComputedStyle` (un sélecteur `[data-theme="dark"] { --x:
// ... }` combiné à `color: var(--x)` renvoie littéralement la chaîne "var(--x)", jamais la
// couleur finale) — un test qui reposerait là-dessus serait TOUJOURS vert ou TOUJOURS rouge,
// jamais un vrai signal. La preuve fiable est donc une lecture directe des VALEURS déclarées
// dans `tokens.css`, complétée par un test fonctionnel (rendu sans erreur) qui prouve que
// Text/Button n'ont besoin de rien connaître du thème pour continuer à marcher.
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "@lab/tokens.css";
import { Text } from "../Text";
import { Button } from "../Button";

afterEach(cleanup);

function extraireBloc(css: string, selecteur: string): Record<string, string> {
  const debut = css.indexOf(selecteur);
  if (debut === -1) return {};
  const ouvre = css.indexOf("{", debut);
  const ferme = css.indexOf("}", ouvre);
  const bloc = css.slice(ouvre + 1, ferme);
  const valeurs: Record<string, string> = {};
  for (const ligne of bloc.split(";")) {
    const m = ligne.match(/--([a-z0-9-]+)\s*:\s*(.+)/i);
    if (m) valeurs[m[1]] = m[2].trim();
  }
  return valeurs;
}

describe('tokens.css — un bloc [data-theme="dark"] redéfinit les couleurs', () => {
  // Les commentaires du fichier (le tien compris) CITENT le sélecteur `[data-theme="dark"]`
  // pour expliquer la règle — on les retire avant de chercher, sinon un commentaire suivi du
  // bloc `:root { ... }` se ferait passer pour le bloc sombre (vécu en construisant ce test).
  const rawCss = readFileSync(process.env.LAB_SOURCE_PATH!, "utf8");
  const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");
  const clair = extraireBloc(css, ":root");
  const sombre = extraireBloc(css, '[data-theme="dark"]');

  it('un bloc [data-theme="dark"] existe avec au moins les couleurs clés redéfinies', () => {
    for (const token of ["ds-color-text-default", "ds-color-primary", "ds-color-secondary"]) {
      expect(sombre[token], `--${token} absent du bloc dark`).toBeDefined();
    }
  });

  it("chaque couleur redéfinie a une VRAIE valeur différente du mode clair (pas un no-op)", () => {
    for (const token of ["ds-color-text-default", "ds-color-primary", "ds-color-secondary"]) {
      expect(sombre[token]?.toLowerCase(), `--${token} identique en clair et sombre`).not.toBe(
        clair[token]?.toLowerCase(),
      );
    }
  });

  it("aucun NOM de variable n'a changé — les mêmes clés existent dans les deux blocs", () => {
    for (const token of Object.keys(clair)) {
      if (token.startsWith("ds-color")) {
        expect(sombre, `--${token} manque côté sombre (renommage interdit)`).toHaveProperty(token);
      }
    }
  });

  it("les tailles/espacements ne sont PAS redéfinis dans le bloc dark (rien à voir avec le thème)", () => {
    for (const token of ["ds-font-size-md", "ds-space-md", "ds-radius-md"]) {
      expect(sombre, `--${token} ne devrait pas être dans le bloc dark`).not.toHaveProperty(token);
    }
  });
});

describe("Text/Button — fonctionnent sans rien savoir du thème actif", () => {
  it("Text et Button se rendent normalement, quel que soit le data-theme de l'ancêtre", () => {
    render(
      <div data-theme="dark">
        <Text tone="danger">Alerte</Text>
        <Button variant="primary">Valider</Button>
      </div>,
    );
    expect(screen.getByText("Alerte")).toHaveClass("ds-text", "ds-text--tone-danger");
    expect(screen.getByRole("button", { name: "Valider" })).toHaveClass("ds-button--variant-primary");
  });
});
