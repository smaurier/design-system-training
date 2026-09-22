// Oracle RUNTIME du lab 01 DS — un test par « endroit » du composant. Ne pas modifier.
import { describe, it, expect, vi, afterEach } from "vitest";
import { createRef } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { axe } from "jest-axe";
import { composeStories } from "@storybook/react-vite";
import { Text } from "@lab/Text";
import * as stories from "@lab/Text.stories";

afterEach(cleanup);

describe("ENDROITS 1 + 2 — le contrat et le mapping prop → classe", () => {
  it("rend un <p> par défaut, avec les classes md / default / regular", () => {
    render(<Text>Bonjour</Text>);
    const el = screen.getByText("Bonjour");
    expect(el.tagName).toBe("P");
    expect(el).toHaveClass("ds-text", "ds-text--size-md", "ds-text--tone-default", "ds-text--weight-regular");
  });

  it("mappe chaque variant sur sa classe, et rien d'autre ne change", () => {
    render(<Text size="sm" tone="danger" weight="bold">Alerte</Text>);
    const el = screen.getByText("Alerte");
    expect(el).toHaveClass("ds-text", "ds-text--size-sm", "ds-text--tone-danger", "ds-text--weight-bold");
    expect(el).not.toHaveClass("ds-text--size-md", "ds-text--tone-default", "ds-text--weight-regular");
  });

  it("as=\"span\" rend un <span>", () => {
    render(<Text as="span">en ligne</Text>);
    expect(screen.getByText("en ligne").tagName).toBe("SPAN");
  });
});

describe("ENDROIT 3 — l'hygiène DOM", () => {
  it("les props de variant ne fuient jamais comme attributs HTML", () => {
    render(<Text size="lg" tone="muted" weight="bold" as="span">y</Text>);
    const el = screen.getByText("y");
    for (const attr of ["size", "tone", "weight", "as"]) expect(el).not.toHaveAttribute(attr);
  });

  it("className est fusionné (pas écrasé) ; id, data-*, aria-* et onClick passent", () => {
    const onClick = vi.fn();
    render(
      <Text className="mt-4" id="t1" data-testid="txt" aria-label="Résumé" onClick={onClick}>
        z
      </Text>,
    );
    const el = screen.getByTestId("txt");
    expect(el).toHaveClass("ds-text", "mt-4");
    expect(el).toHaveAttribute("id", "t1");
    expect(el).toHaveAttribute("aria-label", "Résumé");
    el.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("ref atteint l'élément rendu", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<Text ref={ref}>r</Text>);
    expect(ref.current?.tagName).toBe("P");
  });

  it("aucun avertissement React pendant le rendu (unknown prop, key, etc.)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <>
        <Text size="sm">a</Text>
        <Text tone="muted" as="span">b</Text>
        <Text weight="bold">c</Text>
      </>,
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("ENDROIT 4 — l'accessibilité", () => {
  it("aucune violation axe sur une page composée des variants", async () => {
    const { container } = render(
      <main>
        <h1>Famille Dupont</h1>
        <Text>Pique-nique dimanche.</Text>
        <Text tone="muted" size="sm">Publié hier</Text>
        <Text tone="danger" weight="bold">Invitation expirée.</Text>
        <Text as="span">en ligne</Text>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ENDROIT 5 — le catalogue Storybook (les stories se rendent vraiment)", () => {
  const composed = composeStories(stories);

  it("meta.component est Text et meta.title est renseigné", () => {
    expect(stories.default.component).toBe(Text);
    expect(typeof stories.default.title).toBe("string");
  });

  it("expose au minimum Default, Muted et Small", () => {
    expect(Object.keys(composed)).toEqual(expect.arrayContaining(["Default", "Muted", "Small"]));
  });

  it("chaque story se rend avec du texte visible", () => {
    for (const [name, Story] of Object.entries(composed)) {
      const { container, unmount } = render(<Story />);
      expect(container.textContent?.trim().length, `story ${name} vide`).toBeGreaterThan(0);
      expect(container.querySelector(".ds-text"), `story ${name} ne rend pas Text`).not.toBeNull();
      unmount();
    }
  });

  it("Muted et Small montrent bien leur état", () => {
    const { container: c1, unmount: u1 } = render(<composed.Muted />);
    expect(c1.querySelector(".ds-text--tone-muted")).not.toBeNull();
    u1();
    const { container: c2 } = render(<composed.Small />);
    expect(c2.querySelector(".ds-text--size-sm")).not.toBeNull();
  });
});
