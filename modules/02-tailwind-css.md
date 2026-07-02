---
titre: Tailwind CSS v4 pour un design system
cours: 21-design-system
notions: [utility-first, config CSS-first v4, directive @theme, plugin Vite, design tokens exposés en utilities, responsive mobile-first, états et variantes, dark mode par variant, cva et clsx pour variantes de composants, usage parcimonieux de @apply]
outcomes: [installer Tailwind v4 en config CSS-first, mapper des design tokens dans @theme et les consommer comme utilities, construire des composants à variantes typées avec cva et clsx]
prerequis: [01-css-fondamentaux]
next: 03-radix-ui
libs: [{ name: tailwindcss, version: "^4" }]
tribuzen: tokens de marque TribuZen mappés dans @theme, PrimaryButton et RoutineCard à variantes via cva
last-reviewed: 2026-07
---

# Tailwind CSS v4 pour un design system

> **Outcomes — tu sauras FAIRE :** installer Tailwind v4 en config CSS-first, mapper des design tokens dans `@theme` et les consommer comme utilities, construire des composants à variantes typées avec `cva` et `clsx`.
> **Difficulté :** :star::star:

## 1. Cas concret d'abord

Tu démarres le design system de TribuZen. La designer t'a livré une palette de marque : sauge `#6B7E6B`, terracotta `#C4785A`, surface crème `#F8F5F0`, titres en Fraunces, texte en Inter. Un collègue a commencé le bouton principal comme ça :

```tsx
// PrimaryButton.tsx — AVANT design system
function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="bg-[#6B7E6B] text-[#F8F5F0] px-4 py-2 rounded-lg hover:bg-[#5c6d5c] font-['Inter']">
      {children}
    </button>
  );
}
```

**Trois problèmes immédiats :**
1. La valeur `#6B7E6B` est **codée en dur** dans le JSX. Le jour où la marque change de sauge, il faut chercher-remplacer dans tout le repo.
2. `hover:bg-[#5c6d5c]` est une **variante d'assombrissement inventée à la main** — aucune garantie qu'elle soit cohérente avec les autres composants.
3. Aucune **variante** (secondaire, danger, taille). Chaque nouveau besoin va dupliquer une chaîne de classes.

Ce module montre comment brancher ces tokens dans Tailwind v4 (config CSS-first + `@theme`) pour qu'ils deviennent des utilities réutilisables — `bg-sage`, `text-surface`, `font-heading` — puis comment construire des composants à variantes typées avec `cva`.

---

## 2. Théorie complète, concise

### 2.1 Utility-first — le paradigme

Tailwind ne te donne pas des composants, il te donne des **classes utilitaires atomiques** que tu composes directement dans le markup. Une classe = une déclaration CSS.

```html
<!-- CSS classique (BEM) : tu inventes des noms, la feuille grossit sans fin -->
<div class="routine-card">…</div>       <!-- .routine-card { padding: 1rem; border-radius: … } -->

<!-- Utility-first : l'apparence est lisible dans le markup, zéro CSS custom -->
<div class="rounded-xl border p-4 transition-all">…</div>
```

Bénéfices dans un design system : pas de nommage à inventer, l'état du composant est visible dans le HTML, et le CSS final ne contient **que les classes réellement utilisées** (le moteur scanne tes fichiers). Le risque — des chaînes de classes à rallonge dupliquées — se règle avec des **composants** (React + `cva`), pas avec du CSS custom (voir 2.7).

### 2.2 Config CSS-first : le grand changement de la v4

> **Vérifié via Context7** (`/tailwindlabs/tailwindcss.com`, juillet 2026). En v4, **il n'y a plus de `tailwind.config.js` par défaut**. Toute la configuration vit dans ton fichier CSS.

En v3, tu importais trois directives et configurais en JavaScript :

```css
/* ❌ v3 — ne plus faire en v4 */
@tailwind base;
@tailwind components;
@tailwind utilities;
/* + un tailwind.config.js séparé pour le thème */
```

En v4, un **seul import** remplace les trois directives, et le thème se déclare en CSS :

```css
/* ✅ v4 — app.css */
@import "tailwindcss";
```

C'est le point central du module : la configuration est désormais **du CSS**, ce qui rapproche naturellement le thème de tes design tokens (module 05).

### 2.3 Installation avec le plugin Vite

En v4, le plus simple est le plugin dédié `@tailwindcss/vite` (plus rapide que passer par PostCSS).

```ts
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

```css
/* src/app.css — importé une fois dans main.tsx */
@import "tailwindcss";
```

```bash
npm install tailwindcss @tailwindcss/vite
```

Rien d'autre : pas de fichier de config JS, pas de `content: [...]` à maintenir (la v4 détecte automatiquement les sources).

### 2.4 `@theme` — exposer les design tokens comme utilities

C'est le cœur du pont vers le design system. La directive `@theme` déclare des **variables de thème** qui, selon leur préfixe (`--color-*`, `--font-*`, `--breakpoint-*`…), génèrent automatiquement les utilities correspondantes **et** sont exposées comme variables CSS classiques.

```css
@import "tailwindcss";

@theme {
  /* Couleurs de marque TribuZen → génèrent bg-sage, text-sage, border-sage… */
  --color-sage: #6B7E6B;
  --color-terracotta: #C4785A;
  --color-surface: #F8F5F0;

  /* Polices → génèrent font-heading et font-body */
  --font-heading: "Fraunces", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
}
```

Effet concret :

```html
<!-- La couleur codée en dur… -->
<button class="bg-[#6B7E6B] text-[#F8F5F0]">…</button>

<!-- …devient un token nommé, réutilisable et unique source de vérité -->
<button class="bg-sage text-surface font-body">…</button>
```

**Double bénéfice à retenir :**
- Le token génère une **utility** (`bg-sage`) → utilisable partout dans le markup.
- Le token est aussi exposé comme **variable CSS** (`var(--color-sage)`) → utilisable dans du CSS custom, un `@layer components`, ou un composant qui a besoin de la valeur brute.

Changer la marque = éditer **une ligne** dans `@theme`. C'est exactement ce qu'on attend d'un token de design system.

### 2.5 Responsive mobile-first

Les préfixes `sm: md: lg: xl: 2xl:` appliquent une classe **à partir** d'un breakpoint. Sans préfixe = mobile ; avec préfixe = à partir de cette largeur.

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- 1 colonne sur mobile, 2 dès 640px, 3 dès 1024px -->
</div>
```

Les breakpoints eux-mêmes sont des tokens `@theme` (`--breakpoint-3xl: 120rem;` ajoute le préfixe `3xl:`).

### 2.6 États, group, peer, dark mode

Les **variantes d'état** préfixent une utility par une pseudo-classe :

```html
<button class="bg-sage hover:bg-sage/90 focus-visible:ring-2 focus-visible:ring-sage disabled:opacity-50">
  Valider
</button>
```

`bg-sage/90` = la couleur token à 90 % d'opacité — c'est la bonne façon de dériver un état hover, **au lieu** d'inventer un `#5c6d5c` à la main.

`group` et `peer` stylent un élément selon l'état d'un **autre** élément :

```html
<!-- group : styler un enfant quand le PARENT est survolé -->
<article class="group rounded-xl border p-4 hover:border-terracotta">
  <h3 class="group-hover:text-terracotta transition-colors">Bain du soir</h3>
</article>

<!-- peer : styler un élément selon l'état d'un SIBLING -->
<input id="done" type="checkbox" class="peer sr-only" />
<label for="done" class="border-2 peer-checked:border-sage peer-checked:bg-sage/10">Terminé</label>
```

**Dark mode en v4** : la stratégie « classe » n'est plus une option JS, elle se déclare avec `@custom-variant` dans le CSS (vérifié Context7) :

```css
@import "tailwindcss";

/* Active dark: quand un ancêtre porte la classe .dark */
@custom-variant dark (&:where(.dark, .dark *));
```

```html
<div class="bg-surface text-sage dark:bg-sage dark:text-surface">…</div>
```

### 2.7 `cva` + `clsx` pour les variantes de composants

Utility-first règle le styling atomique mais pas les **variantes** d'un composant (primaire/secondaire, sm/md/lg). Deux petites libs standard du monde design system :

- **`clsx`** : concatène des classes conditionnellement (`clsx("base", isActive && "bg-sage")`).
- **`cva`** (class-variance-authority) : déclare une base + des axes de variantes typés, et retourne la bonne chaîne de classes.

```ts
import { cva, type VariantProps } from "class-variance-authority";

const button = cva(
  // classes toujours présentes
  "inline-flex items-center justify-center rounded-lg font-body transition-colors focus-visible:ring-2 focus-visible:ring-sage disabled:opacity-50",
  {
    variants: {
      intent: {
        primary: "bg-sage text-surface hover:bg-sage/90",
        secondary: "bg-terracotta text-surface hover:bg-terracotta/90",
        ghost: "bg-transparent text-sage hover:bg-sage/10",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
      },
    },
    defaultVariants: { intent: "primary", size: "md" },
  },
);

// Les types des variantes sont dérivés automatiquement
type ButtonVariants = VariantProps<typeof button>;
```

`cva` s'appuie directement sur les utilities générées par tes tokens `@theme` — c'est là que la boucle se ferme : **token → utility → variante de composant**.

### 2.8 `@apply` — avec parcimonie

`@apply` inline des utilities existantes dans une règle CSS. Utile pour styler du markup que tu ne contrôles pas (contenu injecté, plugin tiers) ou une base globale (`body`).

```css
@layer components {
  .prose-quote {
    @apply border-l-4 border-terracotta pl-4 italic text-sage;
  }
}
```

> **Piège classique** : recréer tous ses composants en classes `@apply` reproduit exactement le CSS custom que Tailwind cherche à éliminer — sans le typage ni les variantes. Pour un composant React, préfère **`cva`**. Garde `@apply` pour les cas où tu n'as pas de composant sous la main.

---

## 3. Worked examples

### Exemple 1 — Brancher les tokens TribuZen puis un PrimaryButton à variantes

**Étape 1 — le CSS de thème** (unique source de vérité des tokens) :

```css
/* src/app.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-sage: #6B7E6B;
  --color-terracotta: #C4785A;
  --color-surface: #F8F5F0;

  --font-heading: "Fraunces", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
}
```

**Étape 2 — la recette de variantes** avec `cva` :

```ts
// components/ui/button-variants.ts
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      intent: {
        primary: "bg-sage text-surface hover:bg-sage/90",
        secondary: "bg-terracotta text-surface hover:bg-terracotta/90",
        ghost: "bg-transparent text-sage hover:bg-sage/10",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: { intent: "primary", size: "md" },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

**Étape 3 — le composant**, qui combine la recette et d'éventuelles classes ponctuelles via `clsx` :

```tsx
// components/ui/PrimaryButton.tsx
import clsx from "clsx";
import { buttonVariants, type ButtonVariants } from "./button-variants";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {}

export function PrimaryButton({
  intent,
  size,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      // buttonVariants(...) produit la chaîne de tokens ; clsx fusionne l'override
      className={clsx(buttonVariants({ intent, size }), className)}
      {...props}
    />
  );
}
```

**Usage — plus aucune couleur codée en dur :**

```tsx
<PrimaryButton>Créer une routine</PrimaryButton>
<PrimaryButton intent="secondary" size="lg">Rejoindre la famille</PrimaryButton>
<PrimaryButton intent="ghost" size="sm">Annuler</PrimaryButton>
```

Comparé au cas concret de la section 1 : la couleur vient du token `bg-sage`, le hover en dérive proprement (`bg-sage/90`), et trois variantes typées existent sans une seule ligne dupliquée.

### Exemple 2 — RoutineCard à variantes d'état

Une carte de routine TribuZen a un état visuel selon son statut (`active`, `completed`, `skipped`). Même pattern `cva`, appliqué à un conteneur.

```ts
// components/ui/routine-card-variants.ts
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
// components/ui/RoutineCard.tsx
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
      <h3 className="font-heading text-lg text-sage group-hover:text-terracotta transition-colors">
        {title}
      </h3>
      <p className="text-sm text-sage/70">{time}</p>
    </article>
  );
}
```

```tsx
<RoutineCard title="Bain du soir" time="19h30" status="active" />
<RoutineCard title="Histoire" time="20h00" status="completed" />
```

Le titre utilise `font-heading` (Fraunces, token) et la couleur `text-sage` (token) — le composant est entièrement piloté par le thème.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Garder la config v3 en v4

```css
/* ❌ v3 — ne compile pas / n'a plus le comportement attendu en v4 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ v4 — un seul import */
@import "tailwindcss";
```

**Pourquoi** : la v4 remplace les trois directives par un import unique et déplace le thème du JS vers le CSS (`@theme`). Chercher un `tailwind.config.js` en v4 est le réflexe à désapprendre.

### PIÈGE #2 — Valeurs arbitraires au lieu de tokens

```html
<!-- ❌ Couleur codée en dur : aucune source de vérité, impossible à faire évoluer -->
<div class="bg-[#6B7E6B] text-[#F8F5F0]">…</div>

<!-- ✅ Token défini dans @theme : une ligne à changer pour toute la marque -->
<div class="bg-sage text-surface">…</div>
```

**Pourquoi** : la syntaxe `bg-[#…]` (valeur arbitraire) est faite pour les cas ponctuels, pas pour les couleurs de marque. Dans un design system, toute valeur récurrente doit être un token `@theme`.

### PIÈGE #3 — Reconstruire ses composants en `@apply`

```css
/* ❌ On recrée du CSS custom nommé — retour à la case départ, sans typage ni variantes */
@layer components {
  .btn-primary { @apply bg-sage text-surface px-4 py-2 rounded-lg hover:bg-sage/90; }
  .btn-secondary { @apply bg-terracotta text-surface px-4 py-2 rounded-lg; }
}
```

```ts
// ✅ Variantes typées avec cva — auto-complétées, dérivées en types
const button = cva("px-4 py-2 rounded-lg", {
  variants: { intent: { primary: "bg-sage text-surface hover:bg-sage/90", secondary: "bg-terracotta text-surface" } },
});
```

**Pourquoi** : `@apply` n'offre ni typage ni composition de variantes. Pour un composant React réutilisable, `cva` est le bon outil ; `@apply` reste réservé au markup non componentisé.

### PIÈGE #4 — Confondre `hover:bg-sage/90` et une couleur inventée

```html
<!-- ❌ Nuance de hover inventée à la main, décorrélée du token -->
<button class="bg-sage hover:bg-[#5c6d5c]">…</button>

<!-- ✅ État dérivé du token par opacité — cohérent partout -->
<button class="bg-sage hover:bg-sage/90">…</button>
```

**Pourquoi** : `bg-sage/90` reste ancré sur le token. Si la sauge change, le hover suit automatiquement. Une valeur figée `#5c6d5c` se désynchronise silencieusement.

### PIÈGE #5 — Croire que `dark:` marche sans variant en v4

```css
/* ❌ En v4, la stratégie « classe » n'est pas active par défaut */
/* dark:bg-sage ne réagira pas à <html class="dark"> sans déclaration */

/* ✅ Déclarer la variante dans le CSS */
@custom-variant dark (&:where(.dark, .dark *));
```

**Pourquoi** : en v4, `dark:` suit par défaut `prefers-color-scheme`. Pour un toggle piloté par une classe `.dark`, il faut le déclarer explicitement avec `@custom-variant`.

---

## 5. Ancrage TribuZen

Dans TribuZen, ce module pose la **couche de style** sur laquelle repose tout le design system.

**`src/app.css`** — le fichier `@theme` est la **source de vérité des tokens de marque** : sauge `#6B7E6B`, terracotta `#C4785A`, surface `#F8F5F0`, Fraunces (titres) / Inter (corps). Toute couleur ou police du produit passe par là. C'est le préambule direct du module 05 (design tokens formalisés).

**`src/components/ui/PrimaryButton.tsx`** + **`button-variants.ts`** — le bouton d'action présent partout (créer une routine, rejoindre une famille, valider). Trois `intent` (primary/secondary/ghost) et trois `size`, typés par `cva`.

**`src/components/ui/RoutineCard.tsx`** + **`routine-card-variants.ts`** — la carte de routine du quotidien familial, avec ses états `active` / `completed` / `skipped` pilotés par variantes.

Fichiers cibles dans `smaurier/tribuzen` :
```
tribuzen/src/
  app.css                              # @import "tailwindcss" + @theme (tokens)
  components/ui/
    button-variants.ts
    PrimaryButton.tsx
    routine-card-variants.ts
    RoutineCard.tsx
```

> Le `@theme` d'aujourd'hui est volontairement minimal (couleurs + polices). Le module 05 le fera grossir (échelles d'espacement, rayons, ombres) et introduira la formalisation en design tokens. Retenir : **Tailwind v4 = le véhicule des tokens dans le markup**.

---

## 6. Points clés

1. Utility-first : on compose des classes atomiques dans le markup ; le CSS final ne contient que les classes utilisées.
2. En v4, la config est **CSS-first** : `@import "tailwindcss";` remplace les trois `@tailwind`, et il n'y a plus de `tailwind.config.js` par défaut.
3. Installation moderne = plugin `@tailwindcss/vite` dans `vite.config.ts`, plus un `@import` dans le CSS.
4. `@theme` déclare les design tokens ; chaque token génère une utility (`bg-sage`) **et** une variable CSS (`var(--color-sage)`).
5. Responsive mobile-first (`sm: md: lg:`), états (`hover:`, `focus-visible:`, `disabled:`), `group`/`peer` pour styler selon un autre élément.
6. Un état hover se dérive du token par opacité (`bg-sage/90`), jamais par une couleur inventée.
7. Le dark mode « classe » se déclare en v4 avec `@custom-variant dark (&:where(.dark, .dark *));`.
8. `cva` + `clsx` gèrent les variantes typées d'un composant (intent, size, status) en s'appuyant sur les utilities des tokens.
9. `@apply` reste réservé au markup non componentisé — pas pour reconstruire ses composants.

---

## 7. Seeds Anki

```
Qu'est-ce qui change fondamentalement dans la config Tailwind v4 ?|La config devient CSS-first : un seul @import "tailwindcss" remplace les trois directives @tailwind, et il n'y a plus de tailwind.config.js par défaut — le thème se déclare en CSS via @theme.
À quoi sert la directive @theme en Tailwind v4 ?|Elle déclare les design tokens (--color-*, --font-*, --breakpoint-*…). Chaque token génère automatiquement les utilities correspondantes (bg-sage, font-heading) ET est exposé comme variable CSS (var(--color-sage)).
Comment installe-t-on Tailwind v4 avec Vite ?|On ajoute le plugin @tailwindcss/vite dans vite.config.ts (plugins: [tailwindcss()]) et on met @import "tailwindcss"; dans le CSS. Pas de fichier de config JS ni de liste content à maintenir.
Pourquoi préférer bg-sage/90 à hover:bg-[#5c6d5c] pour un état hover ?|bg-sage/90 dérive l'état du token par opacité : si la couleur de marque change, le hover suit automatiquement. Une valeur figée se désynchronise silencieusement du token.
À quoi servent cva et clsx dans un design system ?|clsx concatène des classes conditionnellement ; cva déclare une base + des axes de variantes typés (intent, size) et retourne la bonne chaîne d'utilities. Ils gèrent les variantes de composant que l'utility-first seul ne couvre pas.
Comment activer le dark mode par classe en Tailwind v4 ?|Avec @custom-variant dark (&:where(.dark, .dark *)); dans le CSS. Sans ça, dark: suit prefers-color-scheme et ne réagit pas à une classe .dark togglée en JS.
Quand utiliser @apply plutôt qu'un composant cva ?|@apply sert au markup qu'on ne componentise pas (contenu injecté, plugin tiers, base globale). Pour un composant React réutilisable, cva est préférable car il apporte typage et composition de variantes.
```

---

## Pont vers le lab

> Lab associé : `21-design-system/labs/lab-02-tailwind-css/README.md`. Installer Tailwind v4 en config CSS-first, mapper les tokens de marque TribuZen dans `@theme`, puis construire `PrimaryButton` et `RoutineCard` à variantes avec `cva`.
