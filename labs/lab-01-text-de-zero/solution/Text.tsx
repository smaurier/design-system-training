// Text.tsx — SOLUTION DE RÉFÉRENCE (commentée). Ne l'ouvre pas avant ton GREEN.
// Les six endroits d'un composant de design system, sur le plus simple d'entre eux.
import type { ComponentPropsWithRef, ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import "./tokens.css";
import "./Text.css";

// ── ENDROIT 2 (le mapping prop → classe) déclaré AVANT le contrat : cva produit les classes
//    ET les types des variants, une seule source de vérité pour les deux.
const text = cva("ds-text", {
  variants: {
    size: { sm: "ds-text--size-sm", md: "ds-text--size-md", lg: "ds-text--size-lg" },
    tone: { default: "ds-text--tone-default", muted: "ds-text--tone-muted", danger: "ds-text--tone-danger" },
    weight: { regular: "ds-text--weight-regular", bold: "ds-text--weight-bold" },
  },
  defaultVariants: { size: "md", tone: "default", weight: "regular" },
});

// ── ENDROIT 1 : le contrat. Les variants viennent de cva ; `as` borne l'élément rendu ;
//    tout le reste (`id`, `aria-*`, `data-*`, `className`, `ref`, `onClick`…) est l'API native de <p>.
export type TextProps = ComponentPropsWithRef<"p"> &
  VariantProps<typeof text> & {
    /** Élément HTML rendu. `p` par défaut ; `span` pour un texte en ligne. */
    as?: "p" | "span";
  };

export function Text({ as = "p", size, tone, weight, className, ...rest }: TextProps) {
  // ── ENDROIT 3 : l'hygiène DOM. `size`/`tone`/`weight`/`as` sont DESTRUCTURÉS, donc jamais
  //    dans `...rest` : ils n'atterrissent pas comme attributs sur l'élément (React avertirait,
  //    et le HTML serait pollué). `className` de l'appelant est FUSIONNÉ, pas écrasé.
  const Tag: ElementType = as;
  const classes = [text({ size, tone, weight }), className].filter(Boolean).join(" ");
  return <Tag className={classes} {...rest} />;
}

// ── ENDROIT 4 (a11y) : Text ne cache rien, ne colore pas seul le sens (tone=danger reste du texte
//    lisible, le sens est porté par le contenu), et laisse passer aria-*/id/role via ...rest.
//    Le lab 3 (troncature) rendra cet endroit non trivial : un contenu masqué exige une alternative.
// ── ENDROIT 5 : Text.stories.tsx · ENDROIT 6 : test/ (ici l'oracle ; le tien s'ajoute à côté).
