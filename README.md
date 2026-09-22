# 21 — Design System & UI/UX

![VitePress](https://img.shields.io/badge/-VitePress-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
[![fullstack-autotraining](https://img.shields.io/badge/curriculum-fullstack--autotraining-4C1?style=flat-square)](https://github.com/smaurier/fullstack-autotraining)

> **Prérequis** : React (cours 03). CSS de base.

Cours ajouté suite au brainstorm TribuZen — lacune identifiée : shadcn/ui et Radix UI inconnus malgré profil UI/UX.

<!-- labs-gestes:start -->
## Labs — refonte du 22/09/2026 : un lab = un geste métier complet

> Règle qualité 5 du parcours : chaque lab est **un geste métier complet**, sous deux formes — **Zéro** (construire de zéro un artefact réel et entier) ou **Intervention** (modifier de l'existant avec consommateurs, findings avant code, non-régression). Un lab n'entre en file qu'avec un **oracle exécutable** (`src/` starter · `test/` · `solution/` séparée). Les labs historiques de ce cours (un concept par lab, sans oracle) restent dans `labs/` jusqu'à remplacement et **ne sont plus la file**. Cible détaillée : [`docs/gestes-complets.md`](../docs/gestes-complets.md). État : **4/8 avec oracle**.

| # | Lab | Forme | Geste | Oracle |
|---|-----|-------|-------|--------|
| 01 | [`lab-01-text-de-zero`](labs/lab-01-text-de-zero/README.md) | Zéro | Text avec ses six endroits | ✅ vérifié |
| 02 | [`lab-02-button-de-zero`](labs/lab-02-button-de-zero/README.md) | Zéro | Button : cva, asChild, loading/disabled accessibles | ✅ vérifié |
| 03 | [`lab-03-ajouter-lines-a-text`](labs/lab-03-ajouter-lines-a-text/README.md) | Intervention | ajouter lines à Text consommé par 3 écrans | ✅ vérifié |
| 04 | [`lab-04-bug-a11y-dialog`](labs/lab-04-bug-a11y-dialog/README.md) | Intervention | bug rapporté sur un Dialog Radix, findings avant code | ✅ vérifié |
| 05 | `lab-05-routinecard-de-zero` | Zéro | composé + stories des états vide/chargement/erreur | · à écrire |
| 06 | `lab-06-dark-mode-par-les-tokens` | Intervention | sans toucher aux consommateurs | · à écrire |
| 07 | `lab-07-migrer-storybook` | Intervention | catalogue SB8/9 → 10.6 | · à écrire |
| 08 | `lab-08-tamagui-de-zero` | Zéro | cross-platform web + RN | · à écrire |

<!-- labs-gestes:end -->

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

## TribuZen deliverables

- `tribuzen/design.md` — direction artistique complète
- `tamagui.config.ts` — tokens + thèmes TribuZen (web + RN, source unique de vérité)
- shadcn/ui conservé pour web admin Next.js uniquement (tables, formulaires complexes)
- Tamagui pour tous les composants partagés web + mobile
- Composants core Tamagui : RoutineCard, FamilyDashboard, PrimaryButton, GazettePreview
- Tests accessibilité : jest-axe (web) + @testing-library/react-native (RN)
