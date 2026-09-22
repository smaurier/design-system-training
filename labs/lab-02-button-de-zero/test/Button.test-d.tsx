// Oracle de TYPES du lab 02 DS — ENDROIT 1.
import { expectTypeOf, test } from "vitest";
import type { MouseEventHandler } from "react";
import { Button, type ButtonProps } from "@lab/Button";

test("variants fermés, comportements booléens", () => {
  expectTypeOf<NonNullable<ButtonProps["variant"]>>().toEqualTypeOf<"primary" | "secondary" | "danger">();
  expectTypeOf<NonNullable<ButtonProps["size"]>>().toEqualTypeOf<"sm" | "md" | "lg">();
  expectTypeOf<ButtonProps["loading"]>().toEqualTypeOf<boolean | undefined>();
  expectTypeOf<ButtonProps["asChild"]>().toEqualTypeOf<boolean | undefined>();
});

test("hérite de l'API native de <button> : type, disabled, onClick, aria-*, ref", () => {
  expectTypeOf<NonNullable<ButtonProps["type"]>>().toEqualTypeOf<"button" | "submit" | "reset">();
  expectTypeOf<ButtonProps["disabled"]>().toEqualTypeOf<boolean | undefined>();
  expectTypeOf<ButtonProps["onClick"]>().toEqualTypeOf<MouseEventHandler<HTMLButtonElement> | undefined>();
  expectTypeOf<ButtonProps>().toHaveProperty("aria-label");
  expectTypeOf<ButtonProps>().toHaveProperty("ref");
});

test("le compilateur refuse ce qui n'est pas dans le contrat", () => {
  // @ts-expect-error "ghost" n'est pas un variant
  <Button variant="ghost">x</Button>;
  // @ts-expect-error href n'est pas une prop de <button> : passe par asChild + <a>
  <Button href="/x">x</Button>;
  // @ts-expect-error loading est un booléen
  <Button loading="true">x</Button>;
  <Button asChild variant="secondary" size="lg" loading disabled aria-label="ok"><a href="/x">x</a></Button>;
});
