// ORACLE DE LA NOUVELLE CAPACITÉ — `lines`. RED avant ta modification, GREEN après.
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { axe } from "jest-axe";
import { composeStories } from "@storybook/react-vite";
import { Text } from "@lab/Text";
import * as stories from "@lab/Text.stories";

afterEach(cleanup);

const long = "Pique-nique dimanche au parc, apportez les gourdes, les casquettes et le ballon ; on se retrouve à onze heures près du kiosque, puis balade jusqu'au lac si le temps le permet.";

describe("lines — le mapping", () => {
  it("lines={3} : classe ds-text--clamped et variable CSS --ds-text-lines: 3", () => {
    render(<Text lines={3}>{long}</Text>);
    const el = screen.getByText(long);
    expect(el).toHaveClass("ds-text", "ds-text--clamped");
    expect(el.style.getPropertyValue("--ds-text-lines")).toBe("3");
  });

  it("lines={1} : une ligne", () => {
    render(<Text lines={1}>{long}</Text>);
    expect(screen.getByText(long).style.getPropertyValue("--ds-text-lines")).toBe("1");
  });

  it("sans lines : ni classe, ni variable, ni title — rien ne change pour l'existant", () => {
    render(<Text>{long}</Text>);
    const el = screen.getByText(long);
    expect(el).not.toHaveClass("ds-text--clamped");
    expect(el.style.getPropertyValue("--ds-text-lines")).toBe("");
    expect(el).not.toHaveAttribute("title");
  });

  it("les autres variants continuent de s'appliquer avec lines", () => {
    render(<Text lines={2} size="sm" tone="muted" as="span">{long}</Text>);
    const el = screen.getByText(long);
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveClass("ds-text--size-sm", "ds-text--tone-muted", "ds-text--clamped");
  });
});

describe("lines — l'accessibilité : un texte coupé à l'écran reste lisible quelque part", () => {
  it("le texte complet est exposé en `title` quand children est une chaîne", () => {
    render(<Text lines={2}>{long}</Text>);
    expect(screen.getByText(long)).toHaveAttribute("title", long);
  });

  it("un `title` fourni par l'appelant n'est pas écrasé", () => {
    render(<Text lines={2} title="Résumé du message">{long}</Text>);
    expect(screen.getByText(long)).toHaveAttribute("title", "Résumé du message");
  });

  it("children non textuel : clamp appliqué, pas de title inventé, pas de crash", () => {
    render(
      <Text lines={2} data-testid="rich">
        <strong>Alice</strong> a écrit : {long}
      </Text>,
    );
    const el = screen.getByTestId("rich");
    expect(el).toHaveClass("ds-text--clamped");
    expect(el).not.toHaveAttribute("title");
  });

  it("le contenu complet reste dans le DOM (line-clamp cache visuellement, pas au lecteur d'écran)", () => {
    render(<Text lines={1}>{long}</Text>);
    expect(screen.getByText(long).textContent).toBe(long);
  });

  it("axe propre sur une page tronquée", async () => {
    const { container } = render(
      <main>
        <h1>Fil</h1>
        <Text lines={3}>{long}</Text>
        <Text lines={1} as="span">{long}</Text>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("lines — l'hygiène DOM", () => {
  it("`lines` ne fuit pas comme attribut et aucun console.error n'est émis", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Text lines={3}>{long}</Text>);
    expect(screen.getByText(long)).not.toHaveAttribute("lines");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("un `style` fourni par l'appelant est fusionné avec la variable", () => {
    render(<Text lines={3} style={{ marginTop: 8 }}>{long}</Text>);
    const el = screen.getByText(long);
    expect(el.style.marginTop).toBe("8px");
    expect(el.style.getPropertyValue("--ds-text-lines")).toBe("3");
  });
});

describe("lines — la story", () => {
  const composed = composeStories(stories);

  it("une story `Clamped` existe et montre la troncature ; les anciennes stories sont intactes", () => {
    expect(Object.keys(composed)).toEqual(expect.arrayContaining(["Default", "Muted", "Small", "Clamped"]));
    const { container } = render(<composed.Clamped />);
    const el = container.querySelector(".ds-text--clamped");
    expect(el).not.toBeNull();
    expect(el?.textContent?.length ?? 0).toBeGreaterThan(80);
  });
});
