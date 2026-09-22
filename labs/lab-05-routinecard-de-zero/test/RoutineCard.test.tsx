// Oracle RUNTIME du lab 05 DS — un test par endroit, plus une vérification par STORY. Ne pas
// modifier. `composeStories` rend chaque story exportée avec ses propres args : une story
// mal câblée (mauvais status, mauvais texte) échoue ici, pas seulement "à l'œil" dans le
// catalogue Storybook.
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { composeStories } from "@storybook/react-vite";
import { RoutineCard } from "@lab/RoutineCard";
import * as stories from "@lab/RoutineCard.stories";

afterEach(cleanup);

describe("ENDROIT 1 — le contrat empêche les états impossibles (vérifié au typage)", () => {
  it("success avec tasks vide affiche l'état vide, pas une erreur ni un chargement", () => {
    render(<RoutineCard status="success" tasks={[]} />);
    expect(screen.getByText("Aucune routine pour l'instant.")).toBeInTheDocument();
  });
});

describe("ENDROIT 2 — le mapping état → rendu, avec le bon rôle ARIA", () => {
  it('loading : role="status" (annonce polie), squelette masqué au lecteur d\'écran', () => {
    render(<RoutineCard status="loading" />);
    const conteneur = screen.getByRole("status");
    expect(conteneur).toHaveTextContent(/chargement/i);
    expect(conteneur.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('error : role="alert" (annonce immédiate), message affiché, Réessayer déclenche onRetry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<RoutineCard status="error" message="Panne réseau." onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Panne réseau.");
    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("success rempli : une liste, un item par tâche, label et horaire visibles", () => {
    render(
      <RoutineCard
        status="success"
        tasks={[
          { id: "t1", label: "Brossage de dents", time: "8h00" },
          { id: "t2", label: "Devoirs", time: "17h00" },
        ]}
      />,
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText(/Brossage de dents.*8h00/)).toBeInTheDocument();
  });
});

describe("ENDROIT 3 — hygiène DOM", () => {
  it('"status" ne fuit jamais comme attribut HTML littéral', () => {
    const { container } = render(<RoutineCard status="loading" />);
    expect(container.querySelector("[status]")).toBeNull();
  });
});

describe("ENDROIT 4 — accessibilité, scan automatisé", () => {
  it("aucune violation jest-axe sur les trois états", async () => {
    const { container: c1 } = render(<RoutineCard status="loading" />);
    expect(await axe(c1)).toHaveNoViolations();
    cleanup();

    const { container: c2 } = render(<RoutineCard status="error" message="x" onRetry={vi.fn()} />);
    expect(await axe(c2)).toHaveNoViolations();
    cleanup();

    const { container: c3 } = render(<RoutineCard status="success" tasks={[{ id: "1", label: "A", time: "9h" }]} />);
    expect(await axe(c3)).toHaveNoViolations();
  });
});

describe("ENDROIT 5 — les stories couvrent les quatre états réels", () => {
  const { Default, Vide, Chargement, Erreur } = composeStories(stories);

  it("Default rend une liste avec au moins une tâche", () => {
    render(<Default />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0);
  });

  it("Vide rend l'état vide, pas une liste", () => {
    render(<Vide />);
    expect(screen.getByText("Aucune routine pour l'instant.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("Chargement rend le role=status", () => {
    render(<Chargement />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("Erreur rend le role=alert avec un bouton Réessayer", () => {
    render(<Erreur />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeInTheDocument();
  });
});
