# 21 — Design System & UI/UX

![VitePress](https://img.shields.io/badge/-VitePress-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
[![fullstack-autotraining](https://img.shields.io/badge/curriculum-fullstack--autotraining-4C1?style=flat-square)](https://github.com/smaurier/fullstack-autotraining)

> **Prérequis** : React (cours 03). CSS de base.

Cours ajouté suite au brainstorm TribuZen — lacune identifiée : shadcn/ui et Radix UI inconnus malgré profil UI/UX.

## Modules

| # | Module | Durée |
|---|--------|-------|
| 01 | [CSS fondamentaux solides](modules/01-css-fondamentaux.md) | 60 min |
| 02 | [Tailwind CSS](modules/02-tailwind-css.md) | 90 min |
| 03 | [Radix UI (headless)](modules/03-radix-ui.md) | 75 min |
| 04 | [shadcn/ui](modules/04-shadcn-ui.md) | 90 min |
| 05 | [Design Tokens & Système cohérent](modules/05-design-tokens.md) | 60 min |
| 06 | [Animations & Motion](modules/06-framer-motion.md) | 60 min |
| 07 | [Storybook (notions)](modules/07-storybook.md) | 45 min |
| 08 | [Accessibilité appliquée RGAA](modules/08-accessibilite.md) | 75 min |
| 09 | [Tamagui — design system cross-platform (Web + RN)](modules/09-tamagui.md) | 120 min |

## Labs — refonte du 22/09/2026 : un lab = un geste métier complet

Les labs historiques (`labs/lab-01-css-fondamentaux` … `lab-09-tamagui`, un outil chacun, sans oracle) sont **remplacés progressivement** par des labs-gestes avec oracle exécutable (`src/` starter · `test/` RTL + jest-axe + stories rendues par `composeStories` · `solution/` séparée). Outillage partagé dans `labs/package.json` (React 19.3, Storybook 10.6, vitest 5). Depuis `labs/` : `npm install` puis `npm run lab:NN`.

| # | Lab | Forme | Geste | Oracle |
|---|-----|-------|-------|--------|
| 01 | [`lab-01-text-de-zero`](labs/lab-01-text-de-zero/README.md) | Zéro | `Text` avec ses six endroits : contrat, tokens → style, hygiène DOM, a11y, story, test | ✅ |
| 02 | [`lab-02-button-de-zero`](labs/lab-02-button-de-zero/README.md) | Zéro | `Button` : variants `cva`, `asChild` (Radix Slot), `loading`/`disabled` accessibles | ✅ |
| 03 | [`lab-03-ajouter-lines-a-text`](labs/lab-03-ajouter-lines-a-text/README.md) | Intervention | ajouter `lines` à `Text` consommé par 3 écrans : findings avant code, non-régression, alternative a11y, story | ✅ |
| 04 | à écrire | Intervention | bug a11y rapporté sur un `Dialog` Radix | · |
| 05 | à écrire | Zéro | `RoutineCard` composé + stories des états vide/chargement/erreur | · |
| 06 | à écrire | Intervention | dark mode par les tokens sans toucher aux consommateurs | · |
| 07 | à écrire | Intervention | migrer le catalogue Storybook (le corpus cible 8/9, courant 10.6) | · |
| 08 | à écrire | Zéro | Tamagui cross-platform | · |

CSS fondamentaux et Framer Motion deviennent des lectures d'appui (« Lire avant »), pas des labs.

## TribuZen deliverables

- `tribuzen/design.md` — direction artistique complète
- `tamagui.config.ts` — tokens + thèmes TribuZen (web + RN, source unique de vérité)
- shadcn/ui conservé pour web admin Next.js uniquement (tables, formulaires complexes)
- Tamagui pour tous les composants partagés web + mobile
- Composants core Tamagui : RoutineCard, FamilyDashboard, PrimaryButton, GazettePreview
- Tests accessibilité : jest-axe (web) + @testing-library/react-native (RN)
