// Oracle RUNTIME du lab 02 DS — un bloc par endroit. Ne pas modifier.
import { describe, it, expect, vi, afterEach } from "vitest";
import { createRef } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { composeStories } from "@storybook/react-vite";
import { Button } from "@lab/Button";
import * as stories from "@lab/Button.stories";

afterEach(cleanup);

describe("ENDROITS 1 + 2 — contrat et mapping", () => {
  it("rend un <button type=\"button\"> primary / md par défaut", () => {
    render(<Button>Enregistrer</Button>);
    const el = screen.getByRole("button", { name: "Enregistrer" });
    expect(el.tagName).toBe("BUTTON");
    expect(el).toHaveAttribute("type", "button");
    expect(el).toHaveClass("ds-button", "ds-button--variant-primary", "ds-button--size-md");
  });

  it("mappe variant et size ; type=\"submit\" reste possible", () => {
    render(<Button variant="danger" size="sm" type="submit">Supprimer</Button>);
    const el = screen.getByRole("button", { name: "Supprimer" });
    expect(el).toHaveClass("ds-button--variant-danger", "ds-button--size-sm");
    expect(el).not.toHaveClass("ds-button--variant-primary", "ds-button--size-md");
    expect(el).toHaveAttribute("type", "submit");
  });
});

describe("Comportements — disabled, loading, asChild", () => {
  it("disabled : attribut réel, le clic ne déclenche rien", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Envoyer</Button>);
    const el = screen.getByRole("button", { name: "Envoyer" });
    expect(el).toBeDisabled();
    await userEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading : désactivé, aria-busy, spinner décoratif, nom accessible intact", () => {
    render(<Button loading>Enregistrer</Button>);
    const el = screen.getByRole("button", { name: "Enregistrer" });
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute("aria-busy", "true");
    expect(el).toHaveClass("ds-button--loading");
    const spinner = el.querySelector(".ds-button__spinner");
    expect(spinner).not.toBeNull();
    expect(spinner).toHaveAttribute("aria-hidden", "true");
  });

  it("sans loading : ni aria-busy ni spinner", () => {
    render(<Button>Ok</Button>);
    const el = screen.getByRole("button", { name: "Ok" });
    expect(el).not.toHaveAttribute("aria-busy");
    expect(el.querySelector(".ds-button__spinner")).toBeNull();
  });

  it("asChild : rend l'enfant (un lien) avec les classes, sans type ni disabled", () => {
    render(
      <Button asChild variant="secondary">
        <a href="/famille/dupont">Voir la famille</a>
      </Button>,
    );
    const el = screen.getByRole("link", { name: "Voir la famille" });
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/famille/dupont");
    expect(el).toHaveClass("ds-button", "ds-button--variant-secondary");
    expect(el).not.toHaveAttribute("type");
    expect(el).not.toHaveAttribute("disabled");
  });
});

describe("ENDROIT 3 — hygiène DOM", () => {
  it("variant, size, loading, asChild ne fuient pas ; className fusionné ; ref et data-* passent", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} variant="secondary" size="lg" loading className="w-full" data-testid="btn">
        x
      </Button>,
    );
    const el = screen.getByTestId("btn");
    for (const attr of ["variant", "size", "loading", "aschild", "asChild"]) expect(el).not.toHaveAttribute(attr);
    expect(el).toHaveClass("ds-button", "w-full");
    expect(ref.current).toBe(el);
  });

  it("aucun console.error React pendant le rendu des variants", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <>
        <Button>a</Button>
        <Button loading>b</Button>
        <Button asChild><a href="/x">c</a></Button>
      </>,
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("ENDROIT 4 — accessibilité", () => {
  it("aucune violation axe : boutons nommés, bouton icône avec aria-label, lien asChild", async () => {
    const { container } = render(
      <main>
        <h1>Famille Dupont</h1>
        <Button>Enregistrer</Button>
        <Button variant="secondary" loading>Chargement</Button>
        <Button variant="danger" aria-label="Supprimer la famille">✕</Button>
        <Button asChild><a href="/famille/dupont">Voir la famille</a></Button>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ENDROIT 5 — le catalogue Storybook", () => {
  const composed = composeStories(stories);

  it("meta.component est Button, title renseigné, stories minimales présentes", () => {
    expect(stories.default.component).toBe(Button);
    expect(typeof stories.default.title).toBe("string");
    expect(Object.keys(composed)).toEqual(expect.arrayContaining(["Primary", "Secondary", "Danger", "Loading", "AsLink"]));
  });

  it("chaque story rend un .ds-button avec un nom accessible", () => {
    for (const [name, Story] of Object.entries(composed)) {
      const { container, unmount } = render(<Story />);
      const el = container.querySelector(".ds-button");
      expect(el, `story ${name}`).not.toBeNull();
      expect(el?.textContent?.trim().length, `story ${name} sans texte`).toBeGreaterThan(0);
      unmount();
    }
  });

  it("Loading est aria-busy, AsLink est un lien", () => {
    const { unmount } = render(<composed.Loading />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    unmount();
    render(<composed.AsLink />);
    expect(screen.getByRole("link")).toHaveClass("ds-button");
  });
});
