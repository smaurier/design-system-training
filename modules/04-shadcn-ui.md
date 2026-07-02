---
titre: "shadcn/ui : des composants que tu possèdes"
cours: 21-design-system
notions: [modèle copy-paste vs dépendance npm, CLI shadcn init et add, components.json, cn et tailwind-merge, cva et variants typés, theming par variables CSS, asChild et Slot Radix, shadcn vs Radix brut vs lib classique]
outcomes: [initialiser shadcn dans un projet et ajouter des composants qu'on possède, personnaliser un composant via cva et les tokens CSS, arbitrer entre shadcn, Radix brut et une lib de composants classique]
prerequis: [03-radix-ui]
next: 05-design-tokens
libs: [{ name: react, version: "^19" }, { name: "shadcn", version: "latest" }]
tribuzen: admin web Next.js de TribuZen — Button/Dialog/Form/Table shadcn thémés aux tokens TribuZen (le partagé web+mobile passera par Tamagui, module 09)
last-reviewed: 2026-07
---

# shadcn/ui : des composants que tu possèdes

> **Outcomes — tu sauras FAIRE :** initialiser shadcn dans un projet et ajouter des composants qui vivent dans TON code, personnaliser un composant via `cva` et les tokens CSS, arbitrer entre shadcn, Radix brut et une lib de composants classique.
> **Difficulté :** :star::star:

## 1. Cas concret d'abord

Tu démarres l'admin web de TribuZen (Next.js). Il te faut, vite, une UI propre et accessible : boutons, dialogues de confirmation, formulaires validés, tables de données. Deux réflexes classiques :

```bash
# Option A — une lib de composants classique
npm install @mui/material @emotion/react @emotion/styled
```

Trois semaines plus tard, la designer veut des coins plus doux, une palette sauge/terracotta et un focus ring maison. Tu te bats contre le thème MUI, tu écris des `sx={{ ... }}` partout, tu overrides du CSS que tu ne contrôles pas. Le composant est une **boîte noire** dans `node_modules` : pour changer son comportement interne, tu n'as que les points d'extension que la lib a bien voulu exposer.

shadcn/ui renverse le problème :

```bash
# Option B — shadcn : le code du bouton atterrit chez toi
npx shadcn@latest init
npx shadcn@latest add button dialog form table
```

Après ça, `src/components/ui/button.tsx` **est un fichier de ton projet**. Tu l'ouvres, tu le lis, tu le modifies. Pas de dépendance à mettre à jour, pas d'override fragile : tu possèdes le code. Ce module explique ce modèle, ses outils (`cn`, `cva`, `components.json`), et quand le choisir plutôt que Radix brut ou une lib classique.

> **État de l'outil (vérifié Context7, 2026-07) :** l'ancien paquet `shadcn-ui` est **déprécié**. La CLI actuelle s'appelle `shadcn` (`npx shadcn@latest ...`). Elle supporte **Tailwind v4** (tokens via `@theme inline`, plus besoin de `tailwind.config.js`) et **React 19** (elle propose `--force` ou `--legacy-peer-deps` si un pair de dépendance coince). Les tokens CSS générés utilisent désormais **oklch** par défaut (l'HSL reste valide).

---

## 2. Théorie complète, concise

### 2.1 Copy-paste vs dépendance npm

C'est LE concept du module. Une lib classique et shadcn répondent à la même question — « d'où vient le code du composant ? » — de façon opposée.

| | Lib classique (MUI, Chakra, Ant) | shadcn/ui |
|---|---|---|
| Où vit le code | `node_modules/` | `src/components/ui/` chez toi |
| Installation | `npm install` | `npx shadcn@latest add <c>` (copie un fichier) |
| Mise à jour | `npm update` (risque de breaking change) | tu ne mets pas à jour : c'est ton code |
| Personnalisation | points d'extension imposés + overrides CSS | édition directe du fichier, illimitée |
| Accessibilité | fournie par la lib | fournie par Radix (sur lequel shadcn est bâti) |
| Poids du bundle | tout le paquet | seulement les composants copiés |

shadcn n'est donc **pas une bibliothèque de composants** : c'est un **générateur / distributeur de code**. La CLI va chercher un composant dans un registre et écrit son fichier source dans ton projet, avec ses dépendances (`@radix-ui/*`, `class-variance-authority`, etc.).

> Contrepartie honnête : ownership = responsabilité. Pas de `npm update` qui corrige un bug pour toi. Si un composant reçoit un correctif upstream, c'est à toi de le ré-appliquer (ou de re-`add` le composant et de re-diffuser tes modifs).

### 2.2 Les 3 fondations : Radix + Tailwind + cva

shadcn n'invente presque rien ; il assemble trois briques que tu connais déjà (modules 02–03) :

1. **Radix UI** — le comportement et l'accessibilité (focus trap, ARIA, clavier, portails). C'est le squelette *unstyled*.
2. **Tailwind CSS** — l'habillage visuel via classes utilitaires.
3. **class-variance-authority (`cva`)** — le pont : mappe des *variants* (`variant`, `size`) vers des ensembles de classes Tailwind, avec inférence de types.

shadcn = « Radix habillé en Tailwind, avec des variants typés, dans ton repo ».

### 2.3 `npx shadcn@latest init`

`init` prépare le projet : détecte le framework (Next, Vite, Astro…), installe les dépendances de base, crée `lib/utils.ts` (la fonction `cn`) et génère `components.json`. En React 19, il demande comment résoudre les pairs de dépendances :

```bash
npx shadcn@latest init
# It looks like you are using React 19.
# ? How would you like to proceed? ›
# ❯ Use --force
#   Use --legacy-peer-deps
```

Options utiles : `-d/--defaults` (config par défaut, template Next), `-t/--template <next|vite|astro|react-router|...>`, `--css-variables` (défaut) vs `--no-css-variables`.

### 2.4 `components.json`

Le fichier de config lu par la CLI à chaque `add`. Il dit *où* écrire les fichiers et *comment* générer les classes.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Points à connaître :
- `style` : `"new-york"` est le style par défaut actuel (l'ancien `"default"` existe encore).
- `tailwind.config: ""` **vide** = projet en **Tailwind v4** (les tokens vivent dans le CSS via `@theme inline`, pas dans un fichier config JS).
- `cssVariables: true` = theming par variables CSS sémantiques (`--primary`, `--background`…) plutôt que par classes en dur. C'est ce qui rend le re-theming trivial.
- `aliases` = les imports que la CLI écrira (`@/components/ui/button`). Doivent correspondre à tes alias `tsconfig`.

### 2.5 `cn` : merger des classes sans conflit

`init` génère cette fonction. Elle combine `clsx` (concat conditionnelle) et `tailwind-merge` (résolution des conflits Tailwind : `px-2` + `px-4` → `px-4`).

```ts
// src/lib/utils.ts — généré par la CLI
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```ts
cn("px-2 py-1", isActive && "bg-primary", "px-4");
// → "py-1 bg-primary px-4"  (px-2 écrasé par px-4, pas de doublon en conflit)
```

Sans `twMerge`, `"px-2 px-4"` laisserait les deux classes et le résultat dépendrait de l'ordre CSS. `cn` est utilisée dans **tous** les composants shadcn pour permettre au parent d'override via `className`.

### 2.6 `cva` : des variants typés

`cva` (class-variance-authority) déclare une base + des axes de variation. `VariantProps<typeof x>` en dérive les types automatiquement.

```ts
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", // base
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        active: "bg-primary/10 text-primary",
        warning: "bg-accent/15 text-accent-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

// Type dérivé : { tone?: "neutral" | "active" | "warning" }
type BadgeVariants = VariantProps<typeof badgeVariants>;
```

Appeler `badgeVariants({ tone: "active" })` renvoie la chaîne de classes correspondante. C'est le moteur derrière `<Button variant="outline" size="lg">`.

### 2.7 `asChild` et le `Slot` de Radix

Les composants shadcn qui rendent un élément (Button, etc.) exposent souvent `asChild`. Quand `asChild` est vrai, le composant ne rend **pas** son propre `<button>` : il fusionne ses props/classes dans son enfant direct via `Slot` (Radix). Indispensable pour transformer un bouton en lien sans perdre le style ni l'a11y.

```tsx
import { Slot } from "@radix-ui/react-slot";
// interne au Button :
const Comp = asChild ? Slot : "button";
return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
```

```tsx
// Le "bouton" est en réalité un <Link> Next, stylé comme un bouton
<Button asChild variant="default">
  <Link href="/familles">Voir les familles</Link>
</Button>
```

### 2.8 Theming par variables CSS

Comme `cssVariables: true`, les composants réfèrent des tokens sémantiques (`bg-primary`, `text-muted-foreground`). Re-thémer = redéfinir ces variables, **sans toucher aux composants**. En Tailwind v4, les tokens se déclarent dans le CSS et se relient aux utilitaires via `@theme inline` :

```css
/* src/app/globals.css — Tailwind v4, tokens en oklch (défaut moderne) */
@import "tailwindcss";
@plugin "tailwindcss-animate";
@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.98 0.01 95);   /* blanc chaud TribuZen */
  --foreground: oklch(0.25 0 0);       /* anthracite */
  --primary: oklch(0.58 0.04 150);     /* sauge */
  --primary-foreground: oklch(0.98 0.01 95);
  --accent: oklch(0.74 0.13 85);       /* ambre */
  --radius: 0.75rem;                    /* coins doux */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
}
```

> L'ancien format HSL (`--primary: 135 8% 45%;` + `hsl(var(--primary))` dans `tailwind.config.js`) reste parfaitement valide sur les projets en Tailwind v3. `oklch` est le nouveau défaut car il donne un dégradé de luminosité perceptuellement uniforme — pratique pour dériver `primary/10`, `primary/90`, etc.

### 2.9 Quand shadcn, Radix brut, ou lib classique ?

| Besoin | Choix | Pourquoi |
|---|---|---|
| UI custom, design system maison, contrôle total | **shadcn** | tu possèdes le code, theming par tokens, a11y Radix incluse |
| Un seul primitive comportemental (ex : juste un menu accessible) sans style imposé | **Radix brut** | shadcn ajouterait des classes Tailwind dont tu ne veux pas |
| Livrer très vite, design par défaut acceptable, pas d'équipe design | **lib classique** (MUI…) | composants riches clés en main, moins de code à maintenir |
| Partager le même composant web **et** mobile (React Native) | **ni l'un ni l'autre → Tamagui** | shadcn = DOM/Tailwind only, pas de RN (cf. TribuZen §5) |

---

## 3. Worked examples

### Exemple 1 — Init + Button thémé TribuZen, de zéro

But : obtenir un `<Button>` accessible, aux couleurs TribuZen, que l'on possède.

```bash
# 1) Initialiser dans l'admin Next.js (React 19 → choisir --legacy-peer-deps au prompt)
npx shadcn@latest init

# 2) Ajouter le bouton : la CLI écrit src/components/ui/button.tsx + installe @radix-ui/react-slot, cva
npx shadcn@latest add button
```

Le fichier copié (extrait, version fonction moderne — React 19 accepte `ref` comme prop, plus besoin de `forwardRef`) :

```tsx
// src/components/ui/button.tsx  ← CE FICHIER EST À TOI
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
```

La personnalisation TribuZen **ne touche pas ce fichier** : elle vit dans `globals.css` (les tokens `--primary` = sauge, `--radius` = 0.75rem de §2.8). Le bouton hérite automatiquement de la palette.

```tsx
// Usage dans une page admin
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FamiliesHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-heading">Familles</h1>
      <Button asChild>
        <Link href="/familles/new">Nouvelle famille</Link>
      </Button>
    </div>
  );
}
```

Et si un jour tu veux un variant maison `soft` ? Tu ouvres `button.tsx` et tu ajoutes une ligne dans `variants.variant` — impossible avec une lib classique sans hack.

### Exemple 2 — Composant custom `RoutineCard` avec `cva`

On réutilise le pattern shadcn (base + variants + `cn`) pour un composant **qui n'existe pas dans le registre** : une carte de routine, dérivée du statut.

```tsx
// src/components/ui/routine-card.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const routineCardVariants = cva(
  "rounded-xl border p-4 transition-all duration-200", // base
  {
    variants: {
      status: {
        pending: "border-border bg-background",
        inProgress: "border-primary/30 bg-primary/5",
        completed: "border-primary/50 bg-primary/10 opacity-80",
      },
    },
    defaultVariants: { status: "pending" },
  }
);

interface RoutineCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof routineCardVariants> {
  title: string;
  time?: string;
}

export function RoutineCard({ title, time, status, className, ...props }: RoutineCardProps) {
  return (
    <div className={cn(routineCardVariants({ status }), className)} {...props}>
      <p className="font-heading font-medium text-foreground">{title}</p>
      {time && <p className="text-sm text-muted-foreground">{time}</p>}
    </div>
  );
}
```

Ce qu'on a réutilisé de shadcn sans installer de composant : la fonction `cn` (générée par `init`), la convention `cva` base+variants+`defaultVariants`, `VariantProps` pour typer, `...props` + `className` pour rester override-able. C'est le « style shadcn » appliqué à ton propre composant.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Utiliser la CLI dépréciée `shadcn-ui`

```bash
# ❌ Déprécié — paquet historique, peut échouer ou tirer une vieille version
npx shadcn-ui@latest add button

# ✅ CLI actuelle
npx shadcn@latest add button
```

Beaucoup de tutos d'avant 2024 montrent encore `shadcn-ui`. Le renommage vers `shadcn` accompagne le support Tailwind v4 / React 19. Toujours vérifier la commande dans la doc officielle.

### PIÈGE #2 — Croire que shadcn est « une lib à installer »

```bash
# ❌ Ce paquet n'est pas une lib de composants à importer
npm install shadcn
```

```tsx
import { Button } from "shadcn"; // ❌ n'existe pas
```

shadcn ne s'`import` jamais depuis `node_modules`. On `add` un composant, puis on l'importe **depuis son propre code** :

```tsx
import { Button } from "@/components/ui/button"; // ✅ ton propre fichier
```

Le mot-clé mental : *distribution de code source*, pas *dépendance runtime*.

### PIÈGE #3 — Écraser le thème avec des classes en dur au lieu des tokens

```tsx
// ❌ Couleur en dur : casse le dark mode et le re-theming
<Button className="bg-[#6B7E6B]">Valider</Button>

// ✅ Le token porte la couleur, défini une seule fois dans globals.css
<Button variant="default">Valider</Button>
```

Tout l'intérêt de `cssVariables: true` est de centraliser la couleur. Mettre `bg-[#...]` sur un composant recrée le problème des overrides d'une lib classique.

### PIÈGE #4 — Oublier `twMerge` en réimplémentant `cn`

```ts
// ❌ clsx seul : "px-2" et "px-4" coexistent, conflit résolu par l'ordre CSS
export const cn = (...c: ClassValue[]) => clsx(c);
```

```tsx
<Button className="px-8" />  // le px-4 du variant peut gagner → largeur imprévisible
```

```ts
// ✅ twMerge fait gagner la dernière classe Tailwind en conflit
export const cn = (...c: ClassValue[]) => twMerge(clsx(c));
```

Sans `tailwind-merge`, `className` passé par le parent ne peut pas fiablement override les classes du variant. C'est pour ça que la CLI génère `cn` avec les deux.

### PIÈGE #5 — Vouloir partager les composants shadcn avec le mobile

shadcn produit du **DOM + Tailwind**. Il ne tourne **pas** en React Native. Si un composant doit exister à l'identique sur le web et l'app mobile TribuZen, shadcn n'est pas le bon outil : c'est le rôle de **Tamagui** (module 09). shadcn reste réservé à l'admin **web**.

---

## 5. Ancrage TribuZen

shadcn équipe **l'admin web Next.js** de TribuZen — l'interface des parents/animateurs pour gérer familles, routines et contenus. Le back-office est riche en **tables de données** et **formulaires complexes**, terrain idéal pour shadcn.

Composants copiés dans `smaurier/tribuzen-admin` :

```
tribuzen-admin/src/
  app/globals.css                 # tokens TribuZen (sauge/terracotta/ambre, radius 0.75rem)
  lib/utils.ts                    # cn() généré par `shadcn init`
  components/ui/
    button.tsx                    # actions (Nouvelle famille, Valider…)
    dialog.tsx                    # confirmations (supprimer une famille, archiver)
    form.tsx  input.tsx  label.tsx  # formulaires + react-hook-form + zod
    table.tsx                     # listes familles / routines / membres
  components/ui/routine-card.tsx  # composant custom "style shadcn" (Exemple 2)
```

Rôles concrets :
- **Button** — toutes les actions du back-office, `asChild` pour les liens de navigation stylés en bouton.
- **Dialog** — confirmations destructives, thémées `--destructive` en terracotta (jamais rouge vif : charte TribuZen).
- **Form / Input / Label** — création/édition de routines et familles, validation `zod`, messages d'erreur pilotés par `FormMessage`.
- **Table** — la liste des familles et le suivi des routines (tri, pagination).

**Nuance d'architecture à retenir :** shadcn = **web admin uniquement**. Tout ce qui est partagé entre le web et l'app mobile (React Native) — la home famille, l'écran routines côté enfant — passera par **Tamagui** (module 09), qui compile vers DOM *et* natif. On accepte donc **deux systèmes de composants** : shadcn pour l'admin desktop, Tamagui pour l'expérience cross-platform. Les deux consomment **les mêmes design tokens** (module 05, `next`), ce qui garde la cohérence visuelle malgré la double stack.

---

## 6. Points clés

1. shadcn n'est pas une lib npm : la CLI **copie** le code source du composant dans ton repo (`src/components/ui/`) — ownership total, zéro dépendance à mettre à jour.
2. La CLI actuelle est `shadcn` (`npx shadcn@latest init | add`) ; `shadcn-ui` est **déprécié**. Support Tailwind v4 et React 19.
3. shadcn assemble Radix (a11y/comportement) + Tailwind (style) + `cva` (variants typés) ; il n'invente pas de primitives.
4. `components.json` pilote `add` : chemins (`aliases`), `style`, `cssVariables`, `tailwind.config` vide = Tailwind v4.
5. `cn = twMerge(clsx(...))` merge les classes en résolvant les conflits Tailwind ; c'est ce qui rend `className` override-able par le parent.
6. Le theming passe par des **variables CSS sémantiques** (`--primary`, `--radius`), en **oklch** par défaut (HSL encore valide) ; re-thémer ne touche jamais les composants.
7. `asChild` + `Slot` Radix rendent l'enfant à la place de l'élément par défaut (Button → Link) sans perdre style ni a11y.
8. Choix : shadcn pour un DS maison web, Radix brut pour un primitive nu, lib classique pour livrer vite, **Tamagui** dès qu'il faut partager web + mobile.

---

## 7. Seeds Anki

```
En quoi shadcn/ui diffère-t-il d'une lib de composants classique comme MUI ?|shadcn ne s'installe pas comme dépendance : sa CLI copie le code source du composant dans ton projet (src/components/ui/). Tu possèdes et modifies le code, aucune mise à jour npm, personnalisation illimitée. MUI vit dans node_modules comme boîte noire.
Quelle est la commande actuelle pour ajouter un composant shadcn, et laquelle est dépréciée ?|Actuelle : npx shadcn@latest add button. Dépréciée : npx shadcn-ui@latest add button (ancien paquet renommé). La CLI shadcn supporte Tailwind v4 et React 19.
Sur quelles 3 briques shadcn/ui est-il construit ?|Radix UI (comportement et accessibilité, unstyled), Tailwind CSS (style utilitaire), class-variance-authority/cva (mapping variants→classes avec types). shadcn assemble, il n'invente pas de primitives.
À quoi sert la fonction cn générée par shadcn ?|cn = twMerge(clsx(...)). clsx concatène les classes conditionnellement, tailwind-merge résout les conflits Tailwind (px-2 + px-4 → px-4). Cela rend className passé par le parent capable d'override les classes du variant.
Que fait cva et que fournit VariantProps<typeof x> ?|cva déclare une base de classes + des axes de variants (variant, size) + defaultVariants, et renvoie la chaîne de classes pour un jeu de variants donné. VariantProps<typeof x> dérive automatiquement le type TypeScript des props de variants.
À quoi sert asChild sur un composant shadcn ?|asChild fait rendre l'enfant direct à la place de l'élément par défaut, via Slot de Radix, en y fusionnant classes et props. Ex : <Button asChild><Link>…</Link></Button> = un lien stylé comme un bouton, sans perdre l'accessibilité.
Comment re-thème-t-on des composants shadcn sans les modifier ?|Via cssVariables:true : les composants réfèrent des tokens sémantiques (bg-primary, --radius). On redéfinit ces variables CSS dans globals.css (oklch par défaut, HSL possible). En Tailwind v4 on les relie aux utilitaires avec @theme inline. Aucun composant n'est touché.
Quand choisir shadcn vs Radix brut vs lib classique vs Tamagui ?|shadcn : design system web maison, contrôle total. Radix brut : un seul primitive comportemental sans style imposé. Lib classique (MUI) : livrer vite avec un design par défaut. Tamagui : dès qu'un composant doit être partagé web + mobile (React Native), car shadcn est DOM/Tailwind only.
Que signifie tailwind.config vide ("") dans components.json ?|Que le projet est en Tailwind v4 : les tokens vivent dans le CSS (via @theme inline) au lieu d'un fichier de config JS. cssVariables:true active le theming par variables CSS sémantiques.
```

---

## Pont vers le lab

> Lab associé : `21-design-system/labs/lab-04-shadcn-ui/README.md`. Initialiser shadcn dans un starter Next.js + React 19, ajouter Button/Dialog, le thémer aux tokens TribuZen, puis créer un composant custom `RoutineCard` en style shadcn — le tout sans jamais toucher au code des composants pour re-thémer.
