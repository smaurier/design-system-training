// Text.tsx — L'EXISTANT. Ce composant est en production : trois écrans le consomment (src/screens/).
// Tu vas le MODIFIER pour lui ajouter `lines` (troncature), sans casser ces écrans. Contrat : README § Vérifier.
import type { ComponentPropsWithRef, ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import "./tokens.css";
import "./Text.css";

const text = cva("ds-text", {
  variants: {
    size: { sm: "ds-text--size-sm", md: "ds-text--size-md", lg: "ds-text--size-lg" },
    tone: { default: "ds-text--tone-default", muted: "ds-text--tone-muted", danger: "ds-text--tone-danger" },
    weight: { regular: "ds-text--weight-regular", bold: "ds-text--weight-bold" },
  },
  defaultVariants: { size: "md", tone: "default", weight: "regular" },
});

export type TextProps = ComponentPropsWithRef<"p"> &
  VariantProps<typeof text> & {
    /** Élément HTML rendu. `p` par défaut ; `span` pour un texte en ligne. */
    as?: "p" | "span";
  };

export function Text({ as = "p", size, tone, weight, className, ...rest }: TextProps) {
  const Tag: ElementType = as;
  const classes = [text({ size, tone, weight }), className].filter(Boolean).join(" ");
  return <Tag className={classes} {...rest} />;
}
