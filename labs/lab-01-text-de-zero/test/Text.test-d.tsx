// Oracle de TYPES du lab 01 DS (vitest --typecheck) — ENDROIT 1, le contrat.
import { expectTypeOf, test } from "vitest";
import type { MouseEventHandler, ReactNode } from "react";
import { Text, type TextProps } from "@lab/Text";

test("les variants sont des unions fermées (null/undefined tolérés : cva les ajoute)", () => {
  expectTypeOf<NonNullable<TextProps["size"]>>().toEqualTypeOf<"sm" | "md" | "lg">();
  expectTypeOf<NonNullable<TextProps["tone"]>>().toEqualTypeOf<"default" | "muted" | "danger">();
  expectTypeOf<NonNullable<TextProps["weight"]>>().toEqualTypeOf<"regular" | "bold">();
  expectTypeOf<NonNullable<TextProps["as"]>>().toEqualTypeOf<"p" | "span">();
});

test("le contrat hérite de l'API native de <p> : children, className, id, aria-*, onClick, ref", () => {
  expectTypeOf<TextProps["children"]>().toEqualTypeOf<ReactNode | undefined>();
  expectTypeOf<TextProps["className"]>().toEqualTypeOf<string | undefined>();
  expectTypeOf<TextProps["id"]>().toEqualTypeOf<string | undefined>();
  expectTypeOf<TextProps["onClick"]>().toEqualTypeOf<MouseEventHandler<HTMLParagraphElement> | undefined>();
  expectTypeOf<TextProps>().toHaveProperty("aria-label");
  expectTypeOf<TextProps>().toHaveProperty("ref");
});

test("le compilateur refuse une valeur hors variant et un élément hors contrat", () => {
  // @ts-expect-error "xl" n'est pas une taille du DS
  <Text size="xl">x</Text>;
  // @ts-expect-error "warning" n'est pas un tone
  <Text tone="warning">x</Text>;
  // @ts-expect-error seuls p et span sont autorisés
  <Text as="div">x</Text>;
  <Text size="sm" tone="muted" weight="bold" as="span" className="x" id="i" aria-label="l">ok</Text>;
});
