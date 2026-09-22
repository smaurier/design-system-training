// Oracle de la REVUE A11Y. Ne pas modifier. RED sur le bug rapporté (les deux premiers
// tests), GREEN une fois corrigé. Le scan jest-axe, lui, passe DANS LES DEUX CAS — vérifié
// empiriquement en construisant ce lab : axe-core ne détecte pas par défaut un dialogue
// sans aria-labelledby fonctionnel ici (le <h2> visuel suffit à ses heuristiques), ni un
// bouton nommé "×" (un caractère compte comme un nom pour axe, même si ce n'est pas un nom
// UTILE). C'est le point du lab : un scan automatisé ne remplace pas un test qui interroge
// le DOM exactement comme un lecteur d'écran le ferait (`getByRole(..., { name })`).
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ConfirmDialog } from "@lab/ConfirmDialog";

afterEach(cleanup);

describe("ConfirmDialog — nom accessible du dialogue", () => {
  it("le dialogue a un nom accessible dérivé de son titre (pas juste un <h2> visuel)", () => {
    render(<ConfirmDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} />);
    // getByRole avec `name` échoue si aria-labelledby n'est pas posé — c'est exactement ce
    // qu'un lecteur d'écran annoncerait (ou pas) à l'ouverture.
    expect(screen.getByRole("dialog", { name: "Supprimer ce post ?" })).toBeInTheDocument();
  });
});

describe("ConfirmDialog — bouton de fermeture nommé", () => {
  it("le bouton × a un nom accessible (« Fermer »), pas juste un caractère visuel", () => {
    render(<ConfirmDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Fermer" })).toBeInTheDocument();
  });
});

describe("ConfirmDialog — scan automatisé (complémentaire, pas suffisant)", () => {
  it("ne remonte aucune violation jest-axe (passe déjà avant ta correction — voir le commentaire en tête de fichier)", async () => {
    const { container } = render(<ConfirmDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
