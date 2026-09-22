// Oracle de TYPES — le contrat étendu, et le contrat existant intact.
import { expectTypeOf, test } from "vitest";
import { Text, type TextProps } from "@lab/Text";

test("lines est un nombre optionnel", () => {
  expectTypeOf<TextProps["lines"]>().toEqualTypeOf<number | undefined>();
  // @ts-expect-error lines est un number, pas une string
  <Text lines="3">x</Text>;
  // @ts-expect-error lines n'est pas un booléen : le nombre porte la décision (pas de truncate + lines)
  <Text lines={true}>x</Text>;
  <Text lines={3} size="sm" tone="muted" as="span" title="t" style={{ marginTop: 4 }}>ok</Text>;
});

test("le contrat existant n'a pas bougé", () => {
  expectTypeOf<NonNullable<TextProps["size"]>>().toEqualTypeOf<"sm" | "md" | "lg">();
  expectTypeOf<NonNullable<TextProps["tone"]>>().toEqualTypeOf<"default" | "muted" | "danger">();
  expectTypeOf<NonNullable<TextProps["as"]>>().toEqualTypeOf<"p" | "span">();
  expectTypeOf<TextProps>().toHaveProperty("ref");
  expectTypeOf<TextProps>().toHaveProperty("onClick");
});
