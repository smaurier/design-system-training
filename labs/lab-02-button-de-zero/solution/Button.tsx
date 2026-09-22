// Button.tsx — SOLUTION DE RÉFÉRENCE (commentée). Ne l'ouvre pas avant ton GREEN.
import type { ComponentPropsWithRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import "./tokens.css";
import "./Button.css";

// ENDROIT 2 — le mapping, source unique des classes ET des types de variants.
const button = cva("ds-button", {
  variants: {
    variant: {
      primary: "ds-button--variant-primary",
      secondary: "ds-button--variant-secondary",
      danger: "ds-button--variant-danger",
    },
    size: { sm: "ds-button--size-sm", md: "ds-button--size-md", lg: "ds-button--size-lg" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

// ENDROIT 1 — le contrat : l'API native de <button> (avec ref) + variants + deux comportements.
export type ButtonProps = ComponentPropsWithRef<"button"> &
  VariantProps<typeof button> & {
    /** Rend l'enfant à la place d'un <button> (ex. un <a>), en lui passant classes et props. */
    asChild?: boolean;
    /** État d'attente : désactive, annonce aria-busy, affiche un spinner décoratif. */
    loading?: boolean;
  };

export function Button({
  asChild = false,
  loading = false,
  variant,
  size,
  className,
  disabled,
  type,
  children,
  ...rest
}: ButtonProps) {
  // ENDROIT 3 — hygiène DOM : variant/size/loading/asChild sont destructurés, jamais dans ...rest.
  const classes = [button({ variant, size }), loading && "ds-button--loading", className].filter(Boolean).join(" ");

  if (asChild) {
    // Slot fusionne classes et props sur l'enfant unique fourni (ex. <a href>). Pas de type="button",
    // pas de disabled : ce ne sont pas des attributs valides sur ce que l'appelant rend.
    return (
      <Slot className={classes} {...rest}>
        {children}
      </Slot>
    );
  }

  return (
    // type="button" par défaut : un bouton dans un <form> ne doit pas soumettre par accident.
    // ENDROIT 4 — a11y : disabled réel (pas seulement visuel), aria-busy pendant le chargement,
    // spinner aria-hidden pour que le nom accessible reste le texte du bouton.
    <button
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="ds-button__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
