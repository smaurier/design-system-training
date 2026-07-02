# Lab 02 — Tailwind CSS v4 : tokens de marque et composants à variantes

> **Outcome :** à la fin, tu sais installer Tailwind v4 en config CSS-first, mapper les tokens de marque TribuZen dans `@theme`, et construire `PrimaryButton` + `RoutineCard` à variantes typées avec `cva`.
> **Vrai outil :** Tailwind CSS v4 + `@tailwindcss/vite` + `class-variance-authority` + `clsx` dans un projet Vite/React réel. Aucun harnais simulé.
> **Feedback :** le coach valide en session — pas de test-runner auto-correcteur. Ta preuve = le rendu visuel dans le navigateur (`npm run dev`).

## Énoncé

Tu poses la couche de style du design system TribuZen dans un projet Vite + React + TypeScript neuf.

Tokens de marque à brancher :
- Sauge `#6B7E6B` — couleur primaire
- Terracotta `#C4785A` — couleur secondaire / accent
- Surface crème `#F8F5F0` — fond / texte sur fond sombre
- Fraunces — police des titres (`font-heading`)
- Inter — police du corps (`font-body`)

Objectif : que `bg-sage`, `text-surface`, `font-heading` existent comme utilities, puis les consommer dans deux composants à variantes.

Starter (à créer toi-même, c'est le point du lab — pas de gap-fill) :

```bash
npm create vite@latest tribuzen-ds -- --template react-ts
cd tribuzen-ds
npm install
npm install tailwindcss @tailwindcss/vite class-variance-authority clsx
```

## Étapes (en friction)

1. **Brancher le plugin Vite.** Édite `vite.config.ts` pour ajouter `@tailwindcss/vite`. Ne copie pas la config v3 : il n'y a **pas** de `tailwind.config.js` à créer.
2. **Config CSS-first.** Dans `src/index.css`, remplace tout le contenu par l'`@import` v4, déclare la variante `dark` par classe, et mappe les 5 tokens dans `@theme`. Importe bien ce CSS dans `main.tsx`.
3. **Vérifie que les utilities existent.** Dans `App.tsx`, écris un `<div className="bg-sage text-surface font-heading p-4">Test</div>` et lance `npm run dev` : le fond doit être sauge, le texte crème, la police serif. Si `bg-sage` ne fait rien → le token n'est pas capté.
4. **`PrimaryButton` avec `cva`.** Crée `button-variants.ts` (base + axes `intent` primary/secondary/ghost et `size` sm/md/lg, `defaultVariants`) puis `PrimaryButton.tsx` qui étend `ButtonHTMLAttributes`, dérive ses props de `VariantProps`, et fusionne avec `clsx`.
5. **`RoutineCard` avec `cva`.** Même pattern sur un `<article>`, axe `status` active/completed/skipped. Titre en `font-heading text-sage`, sous-texte en `text-sage/70`.
6. **Prouve les variantes.** Dans `App.tsx`, affiche les 3 intents du bouton et les 3 statuts de carte côte à côte. Observe que le hover primary utilise bien `bg-sage/90` (dérivé du token), pas une couleur figée.

> Note polices : Fraunces/Inter doivent être chargées (Google Fonts `<link>` dans `index.html` ou `@import` en tête de CSS) pour voir le rendu réel — sinon le fallback serif/sans s'applique.

## Corrigé complet commenté

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // plugin v4 dédié, remplace la voie PostCSS

export default defineConfig({
  plugins: [react(), tailwindcss()], // tailwindcss() détecte les sources tout seul
});
```

```css
/* src/index.css */
/* Polices de marque (à charger avant l'usage) */
@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400..600&display=swap");

/* v4 : un seul import remplace les trois directives @tailwind de la v3 */
@import "tailwindcss";

/* Dark mode par classe : sans ça, dark: suivrait prefers-color-scheme */
@custom-variant dark (&:where(.dark, .dark *));

/* @theme = source de vérité des tokens. Chaque entrée génère une utility ET une var CSS. */
@theme {
  --color-sage: #6B7E6B;        /* FONDS/bordures/ring — 4.00:1 sur crème (OK composant ≥3:1, PAS texte AA) */
  --color-terracotta: #C4785A;  /* FONDS/accent — 3.12:1 sur crème (OK composant, PAS texte AA) */
  --color-surface: #F8F5F0;     /* → bg-surface, text-surface… */

  /* Tokens TEXTE conformes AA (≥4.5:1 sur crème) — voir module 08.
     À utiliser pour tout texte < 24px et les labels de bouton. */
  --color-sage-text: #5A6B5A;       /* → text-sage-text — 5.24:1 sur crème */
  --color-terracotta-text: #9E5236; /* → text-terracotta-text — 5.20:1 sur crème */

  --font-heading: "Fraunces", Georgia, serif; /* → font-heading */
  --font-body: "Inter", system-ui, sans-serif; /* → font-body */
}
```

```tsx
// src/main.tsx — importer le CSS une seule fois
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // sinon aucune utility n'est appliquée
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```ts
// src/components/ui/button-variants.ts
import { cva, type VariantProps } from "class-variance-authority";

// cva(base, config) : la base est toujours appliquée, les variants s'ajoutent
export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      intent: {
        // Fond foncé au token TEXTE pour que le label crème passe AA (contraste : voir module 08).
        // bg-sage crème = 4.36:1 (échec) → bg-sage-text crème = 5.24:1 (ok).
        primary: "bg-sage-text text-surface hover:bg-sage-text/90",
        secondary: "bg-terracotta-text text-surface hover:bg-terracotta-text/90",
        // ghost = texte sauge sur fond clair → token TEXTE conforme, pas le sauge de fond
        ghost: "bg-transparent text-sage-text hover:bg-sage/10",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    // valeurs par défaut si l'appelant ne passe rien
    defaultVariants: { intent: "primary", size: "md" },
  },
);

// VariantProps dérive automatiquement { intent?: ..., size?: ... } depuis la config ci-dessus
export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

```tsx
// src/components/ui/PrimaryButton.tsx
import clsx from "clsx";
import { buttonVariants, type ButtonVariants } from "./button-variants";

// On étend les attributs HTML natifs du <button> + les variantes typées
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {}

export function PrimaryButton({ intent, size, className, ...props }: ButtonProps) {
  return (
    <button
      // buttonVariants(...) → chaîne d'utilities ; clsx fusionne un override ponctuel
      className={clsx(buttonVariants({ intent, size }), className)}
      {...props}
    />
  );
}
```

```ts
// src/components/ui/routine-card-variants.ts
import { cva, type VariantProps } from "class-variance-authority";

export const routineCardVariants = cva(
  "rounded-xl border p-4 font-body transition-all",
  {
    variants: {
      status: {
        active: "border-sage bg-surface hover:shadow-md",
        completed: "border-sage/40 bg-sage/5 opacity-90",
        skipped: "border-terracotta/40 bg-terracotta/5",
      },
    },
    defaultVariants: { status: "active" },
  },
);

export type RoutineCardVariants = VariantProps<typeof routineCardVariants>;
```

```tsx
// src/components/ui/RoutineCard.tsx
import clsx from "clsx";
import { routineCardVariants, type RoutineCardVariants } from "./routine-card-variants";

interface RoutineCardProps extends RoutineCardVariants {
  title: string;
  time: string;
  className?: string;
}

export function RoutineCard({ status, title, time, className }: RoutineCardProps) {
  return (
    <article className={clsx(routineCardVariants({ status }), "group", className)}>
      {/* font-heading (Fraunces) + token TEXTE conforme AA (text-sage-text), pas text-sage (échec contraste) */}
      <h3 className="font-heading text-lg text-sage-text group-hover:text-terracotta-text transition-colors">
        {title}
      </h3>
      {/* sous-texte lisible : token TEXTE plein, sans opacité qui casserait le contraste AA */}
      <p className="text-sm text-sage-text">{time}</p>
    </article>
  );
}
```

```tsx
// src/App.tsx — preuve visuelle des variantes
import { PrimaryButton } from "./components/ui/PrimaryButton";
import { RoutineCard } from "./components/ui/RoutineCard";

export default function App() {
  return (
    <main className="min-h-screen bg-surface p-8 font-body">
      <h1 className="font-heading text-2xl text-sage-text mb-6">Design system TribuZen</h1>

      <div className="flex gap-3 mb-8">
        <PrimaryButton>Créer une routine</PrimaryButton>
        <PrimaryButton intent="secondary" size="lg">Rejoindre la famille</PrimaryButton>
        <PrimaryButton intent="ghost" size="sm">Annuler</PrimaryButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RoutineCard title="Bain du soir" time="19h30" status="active" />
        <RoutineCard title="Histoire" time="20h00" status="completed" />
        <RoutineCard title="Rangement" time="18h00" status="skipped" />
      </div>
    </main>
  );
}
```

**Vérifications attendues à l'écran :**
- Fond crème (`bg-surface`), titres serif (Fraunces via `font-heading`), corps sans-serif (Inter).
- Bouton primary sauge, secondary terracotta, ghost transparent ; le hover primary assombrit **légèrement** (opacité 90 %) sans changer de teinte.
- Les trois cartes ont des bordures/fonds distincts selon `status` ; au survol le titre passe en terracotta.

> **Contraste AA (voir module 08) :** sur crème, `sage` (4.00:1) et `terracotta` (3.12:1) ne passent pas le seuil texte AA (4.5:1) — ils restent réservés aux **fonds/bordures/ring** (≥3:1 ok). Tout **texte** et **label de bouton** utilise les tokens dédiés `sage-text` (#5A6B5A, 5.24:1) / `terracotta-text` (#9E5236, 5.20:1). Un bouton `bg-sage text-surface` = 4.36:1 → label illisible, d'où le fond foncé au token texte.

## Variante J+30 (fading)

Refais `PrimaryButton` **de mémoire, en 20 min**, avec ces deux contraintes en plus :
1. Ajoute une variante `intent="danger"` (fond terracotta plein, texte surface) **sans** dupliquer la base.
2. Ajoute une prop booléenne `fullWidth` qui applique `w-full` — via un **nouvel axe de variantes booléen** dans `cva` (`fullWidth: { true: "w-full" }`), pas via un `clsx` conditionnel externe.

Objectif : prouver que tu sais étendre une recette `cva` sans toucher à la base ni casser le typage.

## Application TribuZen

Porte le résultat dans `smaurier/tribuzen` :
1. Ajoute `@tailwindcss/vite` + l'`@import "tailwindcss"` et le bloc `@theme` (5 tokens) dans le vrai `src/app.css`.
2. Commite `button-variants.ts` / `PrimaryButton.tsx` et `routine-card-variants.ts` / `RoutineCard.tsx` dans `src/components/ui/`.
3. Remplace au moins un bouton codé en dur existant par `<PrimaryButton>`.
4. Commit : `feat(ui): tokens de marque en @theme + PrimaryButton/RoutineCard à variantes cva`.

> Ce `@theme` minimal (couleurs + polices) est le socle que le **module 05 (design tokens)** viendra formaliser et étendre (espacements, rayons, ombres). Retenir le pont : **token dans `@theme` → utility → variante `cva`**.
