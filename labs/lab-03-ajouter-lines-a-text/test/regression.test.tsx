// ORACLE DE NON-RÉGRESSION — les trois écrans qui consomment Text. VERT AVANT ta modification.
// Il doit rester vert APRÈS. Si un de ces tests casse, c'est ta modification de Text qui a cassé la prod.
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { axe } from "jest-axe";
import { FamilyFeed } from "@lab/screens/FamilyFeed";
import { ProfilePage } from "@lab/screens/ProfilePage";
import { RoutineCard } from "@lab/screens/RoutineCard";

afterEach(cleanup);

const posts = [
  { id: "p1", author: "Alice", body: "Pique-nique dimanche au parc, apportez les gourdes.", publishedAt: "hier" },
  { id: "p2", author: "Bob", body: "Léa a perdu une dent !", publishedAt: "il y a 2 h" },
];

describe("FamilyFeed (consommateur n°1)", () => {
  it("rend auteur, corps et date de chaque post avec les bonnes variantes", () => {
    render(<FamilyFeed posts={posts} />);
    const p1 = screen.getByTestId("post-p1");
    expect(p1.querySelector(".ds-text--weight-bold")).toHaveTextContent("Alice");
    expect(screen.getByText(posts[0].body)).toHaveClass("ds-text", "ds-text--size-md");
    const date = screen.getByText("hier");
    expect(date.tagName).toBe("SPAN");
    expect(date).toHaveClass("ds-text--size-sm", "ds-text--tone-muted");
  });
});

describe("ProfilePage (consommateur n°2)", () => {
  it("rend la bio avec son id, ou un texte muted si absente", () => {
    const { unmount } = render(<ProfilePage name="Alice" bio="Maman de Léa" families={["Dupont"]} />);
    expect(document.getElementById("bio")).toHaveTextContent("Maman de Léa");
    unmount();
    render(<ProfilePage name="Alice" families={[]} />);
    expect(document.getElementById("bio")).toHaveClass("ds-text--tone-muted");
  });
});

describe("RoutineCard (consommateur n°3)", () => {
  it("fusionne le className de l'écran et transmet onClick", () => {
    const onOpen = vi.fn();
    render(<RoutineCard title="Brossage" description="Deux minutes, matin et soir." onOpen={onOpen} />);
    const title = screen.getByText("Brossage");
    expect(title).toHaveClass("ds-text", "ds-text--size-lg", "routine-card__title");
    const desc = screen.getByText("Deux minutes, matin et soir.");
    expect(desc).toHaveClass("routine-card__description");
    desc.click();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

describe("Les trois écrans ensemble", () => {
  it("restent accessibles (axe) et n'émettent aucun console.error", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <>
        <ProfilePage name="Alice" bio="Maman de Léa" families={["Dupont"]} />
        <FamilyFeed posts={posts} />
        <RoutineCard title="Brossage" description="Deux minutes." onOpen={() => {}} />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
