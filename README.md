# 21 — Design System & UI/UX

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

## TribuZen deliverables

- `tribuzen/design.md` — direction artistique complète
- `tamagui.config.ts` — tokens + thèmes TribuZen (web + RN, source unique de vérité)
- shadcn/ui conservé pour web admin Next.js uniquement (tables, formulaires complexes)
- Tamagui pour tous les composants partagés web + mobile
- Composants core Tamagui : RoutineCard, FamilyDashboard, PrimaryButton, GazettePreview
- Tests accessibilité : jest-axe (web) + @testing-library/react-native (RN)
