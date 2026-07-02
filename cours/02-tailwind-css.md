# Module 02 — Tailwind CSS

| Difficulté | Durée estimée |
|------------|---------------|
| 2/5        | 90 min        |

> **Prérequis** : Module 01 (CSS fondamentaux).

## Objectifs

- Comprendre le paradigme utility-first et pourquoi il gagne
- Maîtriser responsive, dark mode, group/peer
- Configurer `tailwind.config.ts` avec les tokens TribuZen
- Comprendre le tree-shaking et la génération du CSS final

---

## Pourquoi utility-first ?

```
CSS classique (BEM) :
  .routine-card { ... }            → feuille CSS croît sans limite
  .routine-card--completed { ... } → duplication, désync HTML/CSS
  .routine-card__title { ... }     → noms à inventer en permanence

Tailwind :
  <div class="rounded-xl border p-4 bg-white/5 transition-all">
  → Zero feuille CSS custom
  → L'état du composant est visible dans le HTML
  → Pas de nommage de classes
  → CSS final = uniquement les classes utilisées (tree-shaking)
```

---

## Classes essentielles à mémoriser

```html
<!-- Spacing -->
<div class="p-4 px-6 py-2 m-2 mx-auto space-y-4 gap-3">

<!-- Sizing -->
<div class="w-full h-screen max-w-lg min-h-0">

<!-- Flexbox -->
<div class="flex items-center justify-between gap-4 flex-wrap">

<!-- Grid -->
<div class="grid grid-cols-2 md:grid-cols-3 gap-4">

<!-- Typography -->
<p class="text-sm font-medium text-muted-foreground leading-relaxed">

<!-- Colors (via CSS variables shadcn) -->
<div class="bg-primary text-primary-foreground hover:bg-primary/90">

<!-- Borders & Radius -->
<div class="border border-border rounded-lg shadow-sm">

<!-- States -->
<button class="hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">

<!-- Transitions -->
<div class="transition-all duration-200 ease-in-out">
```

---

## Responsive

```html
<!-- Mobile first : sm: md: lg: xl: 2xl: -->
<div class="
  grid
  grid-cols-1          <!-- mobile : 1 colonne -->
  sm:grid-cols-2       <!-- ≥640px : 2 colonnes -->
  lg:grid-cols-3       <!-- ≥1024px : 3 colonnes -->
  gap-4
">
```

---

## Dark mode

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class', // ou 'media'
  // ...
}
```

```html
<!-- 'class' strategy : toggle via JS -->
<html class="dark">
  <div class="bg-white dark:bg-zinc-900 text-black dark:text-white">
```

Avec shadcn/ui → déjà géré via CSS variables (`:root` / `.dark`).

---

## group et peer

```html
<!-- group : styler un enfant quand le parent est hover -->
<div class="group rounded-xl border p-4 hover:border-primary">
  <h3 class="group-hover:text-primary transition-colors">Bain du soir</h3>
  <button class="opacity-0 group-hover:opacity-100 transition-opacity">✓</button>
</div>

<!-- peer : styler un élément selon l'état d'un SIBLING -->
<input id="check" type="checkbox" class="peer sr-only" />
<label
  for="check"
  class="cursor-pointer rounded-full border-2 border-muted peer-checked:border-primary peer-checked:bg-primary/10"
>
</label>
```

---

## @layer et composants réutilisables

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Composants Tailwind réutilisables (quand une classe devient trop longue) */
@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center rounded-md bg-primary
           px-4 py-2 text-sm font-medium text-primary-foreground
           hover:bg-primary/90 focus-visible:outline-none
           focus-visible:ring-2 focus-visible:ring-ring
           disabled:pointer-events-none disabled:opacity-50;
  }
}
```

> **Attention** : utiliser `@layer components` avec parcimonie. shadcn/ui préfère les composants React avec `cva` — plus flexible, plus typé.

---

## tailwind.config.ts TribuZen

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // shadcn/ui colors (CSS variables)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

---

## Checklist

- [ ] Je comprends pourquoi utility-first réduit la dette CSS long terme
- [ ] Les breakpoints responsive (sm/md/lg/xl) sont maîtrisés
- [ ] `group` et `peer` sont compris et utilisés dans TribuZen
- [ ] Le `tailwind.config.ts` TribuZen est configuré avec les CSS variables shadcn
- [ ] Je sais quand utiliser `@layer components` (rarement) vs composant React + cva
