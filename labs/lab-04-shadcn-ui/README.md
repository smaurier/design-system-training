# Lab 04 — shadcn/ui : initialiser, thémer, étendre

> **Outcome :** à la fin, tu sais initialiser shadcn dans un projet Next.js + React 19, ajouter des composants que tu possèdes, les re-thémer aux tokens TribuZen **sans toucher à leur code**, et créer ton propre composant en « style shadcn ».
> **Vrai outil :** la CLI `shadcn` (`npx shadcn@latest`), un vrai projet Next.js + Tailwind v4. Pas de harnais simulé, pas de gap-fill.
> **Feedback :** le coach valide en session (pas de test-runner auto-correcteur).

## Énoncé

Tu montes le squelette UI de l'**admin web TribuZen**. Objectif concret :

1. Un projet Next.js neuf, shadcn initialisé.
2. Les composants `button` et `dialog` ajoutés (donc présents dans `src/components/ui/`).
3. Le thème passé aux couleurs TribuZen (sauge / blanc chaud / ambre, coins doux) **uniquement via les tokens CSS** — aucune ligne modifiée dans `button.tsx`.
4. Un composant maison `RoutineCard` écrit à la main dans le style shadcn (`cva` + `cn`), avec un variant `status`.
5. Une page qui montre un bouton (dont un `asChild` sur un `<Link>`), un dialog de confirmation, et trois `RoutineCard` de statuts différents.

Point de départ minimal :

```bash
# starter réel — Next.js + Tailwind v4 (App Router)
npx create-next-app@latest tribuzen-admin --typescript --tailwind --app --src-dir --import-alias "@/*"
```

> Si le prompt React 19 apparaît pendant `shadcn init`, choisis `--legacy-peer-deps` (ou `--force`). C'est attendu, pas une erreur.

## Étapes (en friction)

1. Lance `create-next-app` puis `npx shadcn@latest init`. Réponds aux prompts. **Avant de continuer**, ouvre `components.json` et repère : `style`, `tailwind.config` (doit être vide → Tailwind v4), `cssVariables: true`, les `aliases`. Sache expliquer chaque champ.
2. Ajoute les composants : `npx shadcn@latest add button dialog`. Ouvre `src/components/ui/button.tsx` — c'est TON fichier. Repère `cva`, `buttonVariants`, `asChild`/`Slot`, l'appel à `cn`.
3. Re-thème **sans toucher aux composants** : dans `globals.css`, remplace les tokens `:root` par la palette TribuZen (sauge en `--primary`, blanc chaud en `--background`, ambre en `--accent`, `--radius: 0.75rem`). Recharge : le bouton doit changer de couleur tout seul.
4. Crée `src/components/ui/routine-card.tsx` à la main. Un `cva` avec un axe `status` (`pending | inProgress | completed`), `VariantProps` pour le type, `cn(...)` pour merger, et `...props` + `className` pour rester override-able.
5. Assemble une page (`src/app/page.tsx`) : un `<Button asChild>` autour d'un `<Link>`, un `<Dialog>` de confirmation, trois `<RoutineCard>` de statuts différents. Vérifie visuellement + au clavier (Tab, Échap ferme le dialog — a11y Radix gratuite).

## Corrigé complet commenté

### `src/app/globals.css` — le re-theming (étape 3)

```css
@import "tailwindcss";
@plugin "tailwindcss-animate";
@custom-variant dark (&:is(.dark *));

:root {
  /* Tokens TribuZen en oklch — c'est ICI qu'on thème, jamais dans les composants */
  --background: oklch(0.98 0.01 95);        /* blanc chaud */
  --foreground: oklch(0.25 0 0);            /* anthracite */
  --primary: oklch(0.58 0.04 150);          /* sauge */
  --primary-foreground: oklch(0.98 0.01 95);
  --accent: oklch(0.74 0.13 85);            /* ambre */
  --accent-foreground: oklch(0.25 0 0);
  --muted: oklch(0.95 0.01 95);
  --muted-foreground: oklch(0.5 0 0);
  --border: oklch(0.9 0.01 95);
  --input: oklch(0.9 0.01 95);
  --ring: oklch(0.58 0.04 150);             /* focus ring = sauge */
  --destructive: oklch(0.62 0.13 40);       /* terracotta, jamais rouge vif */
  --destructive-foreground: oklch(0.98 0.01 95);
  --radius: 0.75rem;                        /* coins doux = chaleur */
}

/* @theme inline relie les variables aux utilitaires Tailwind v4 (bg-primary, etc.) */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --radius-lg: var(--radius);
}
```

### `src/components/ui/routine-card.tsx` — le composant maison (étape 4)

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils"; // cn généré par `shadcn init`

// Style shadcn : base + variants + defaultVariants
const routineCardVariants = cva(
  "rounded-lg border p-4 transition-all duration-200", // classes toujours présentes
  {
    variants: {
      status: {
        pending: "border-border bg-background",
        inProgress: "border-primary/30 bg-primary/5",   // dérivé du token primary
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
    // cn(variants, className) : le parent peut toujours override → override-able
    <div className={cn(routineCardVariants({ status }), className)} {...props}>
      <p className="font-medium text-foreground">{title}</p>
      {time && <p className="text-sm text-muted-foreground">{time}</p>}
    </div>
  );
}
```

### `src/app/page.tsx` — l'assemblage (étape 5)

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { RoutineCard } from "@/components/ui/routine-card";

export default function Page() {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-8">
      {/* asChild : le bouton EST un <Link> Next, stylé comme un bouton, a11y préservée */}
      <Button asChild>
        <Link href="/familles/new">Nouvelle famille</Link>
      </Button>

      {/* Dialog Radix : focus trap + Échap + overlay, gratuit. Thémé destructive = terracotta */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Archiver la famille</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archiver cette famille ?</DialogTitle>
            <DialogDescription>
              Elle disparaîtra des listes actives. Action réversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost">Annuler</Button>
            <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Archiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Le composant maison, trois statuts */}
      <div className="space-y-3">
        <RoutineCard title="Bain du soir" time="19:30" status="completed" />
        <RoutineCard title="Devoirs" time="17:00" status="inProgress" />
        <RoutineCard title="Rangement chambre" time="18:00" status="pending" />
      </div>
    </main>
  );
}
```

**Preuve que le lab est réussi :**
- Changer `--primary` dans `globals.css` recolore Button ET les bordures de `RoutineCard` (`border-primary/30`) sans éditer un seul composant.
- `button.tsx` est resté identique à ce que la CLI a écrit (theming = tokens uniquement).
- Le dialog se ferme au clavier (Échap) et piège le focus — a11y héritée de Radix, sans code custom.

## Variante J+30 (fading)

Refais le lab **en 25 minutes**, de mémoire, avec ces contraintes :
- Interdiction de copier-coller le corrigé.
- Ajoute au `Button` un **nouveau variant maison `soft`** (`bg-primary/10 text-primary hover:bg-primary/20`) en éditant `button.tsx` — prouve que l'ownership permet ce qu'une lib classique interdit.
- Ajoute à `RoutineCard` un second axe de variants `size` (`compact | default`) via `cva`, et compose-le avec `status`.
- Sans relire le module : explique à voix haute pourquoi `cn` a besoin de `twMerge` et ce que fait `asChild`.

## Application TribuZen

Porte ce lab dans le vrai dépôt `smaurier/tribuzen-admin` :
1. `npx shadcn@latest init` sur l'admin Next.js réel, puis `add button dialog form input label table`.
2. Colle la palette TribuZen dans `globals.css` (mêmes tokens que ci-dessus) — c'est la source de vérité couleur du back-office.
3. Garde `RoutineCard` comme premier composant maison du dossier `components/ui/`.
4. Commit : `feat(admin): init shadcn + thème TribuZen + RoutineCard` sur `smaurier/tribuzen-admin`.

> Rappel d'architecture : shadcn reste **web admin only**. Le partagé web+mobile (React Native) viendra de Tamagui (module 09), qui consommera **les mêmes design tokens** (module 05). Ne recopie pas ces composants shadcn côté mobile.
