// Text.tsx — SOLUTION DE RÉFÉRENCE de l'intervention (commentée). Ne l'ouvre pas avant ton GREEN.
// Diff par rapport à l'existant : une prop, quatre lignes. Le reste du fichier est intact — c'est le point.
import type { ComponentPropsWithRef, CSSProperties, ElementType } from "react";
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
    /**
     * Nombre de lignes visibles ; au-delà, le texte est coupé avec une ellipse.
     * Une seule prop porte la décision : `lines` absent = pas de troncature (pas de `truncate` + `lines`
     * qui ouvrirait des états incohérents). Le contenu complet reste dans le DOM (lu par les lecteurs
     * d'écran) et est exposé en `title` quand `children` est une chaîne.
     */
    lines?: number;
  };

export function Text({ as = "p", size, tone, weight, lines, className, style, title, children, ...rest }: TextProps) {
  const Tag: ElementType = as;
  const clamped = typeof lines === "number" && lines > 0;
  const classes = [text({ size, tone, weight }), clamped && "ds-text--clamped", className].filter(Boolean).join(" ");
  // La variable CSS porte le nombre : une classe par valeur possible serait infinie, un style inline
  // `-webkit-line-clamp` marcherait mais sortirait la règle du CSS du DS.
  const mergedStyle = clamped ? ({ ...style, "--ds-text-lines": lines } as CSSProperties) : style;
  // Alternative accessible minimale : le texte complet en `title` (sans écraser un `title` fourni).
  const resolvedTitle = title ?? (clamped && typeof children === "string" ? children : undefined);
  return (
    <Tag className={classes} style={mergedStyle} title={resolvedTitle} {...rest}>
      {children}
    </Tag>
  );
}
