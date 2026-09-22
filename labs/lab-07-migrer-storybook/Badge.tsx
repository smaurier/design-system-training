// Badge.tsx — DONNÉ, ne se modifie pas dans ce lab. Le sujet de la migration, c'est le
// catalogue de stories (Badge.stories.tsx), pas le composant lui-même.
import type { ComponentPropsWithRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import "./tokens.css";
import "./Badge.css";

const badge = cva("ds-badge", {
  variants: {
    tone: {
      success: "ds-badge--tone-success",
      warning: "ds-badge--tone-warning",
      danger: "ds-badge--tone-danger",
    },
  },
  defaultVariants: { tone: "success" },
});

export interface BadgeProps extends ComponentPropsWithRef<"span">, VariantProps<typeof badge> {}

export function Badge({ tone, className, ...rest }: BadgeProps) {
  const classes = [badge({ tone }), className].filter(Boolean).join(" ");
  return <span className={classes} {...rest} />;
}
