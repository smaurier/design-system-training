# Lab 02 — `Button` de zéro : un composant avec du comportement

> **Outcome :** à la fin, tu as construit seul un `Button` de design system complet : variants `cva`, `asChild` (Radix `Slot`) pour rendre un lien avec l'apparence d'un bouton, `loading` et `disabled` corrects pour un lecteur d'écran, `type="button"` par défaut, story par état, oracle vert. Deuxième passage sur les six endroits, avec cette fois du comportement et pas seulement de l'apparence.
> **Vrai outil :** React 19 + TypeScript 7 + `class-variance-authority` + `@radix-ui/react-slot` + Storybook 10 (`composeStories`) + vitest 5 / Testing Library / user-event / jest-axe.
> **Feedback :** `npm run lab:02` depuis `21-design-system/labs` — RED tant que `src/` ne satisfait pas l'oracle. Au GREEN, le correcteur-labs tranche. `npm run solution:02` prouve l'oracle ; tu ne l'ouvres pas avant ton GREEN.

## Lire avant (une lecture bornée)

- DS, module [`03-radix-ui.md`](../../modules/03-radix-ui.md) : pourquoi headless, et `Slot`/`asChild` (« l'anatomie d'un composant Radix »).
- DS, module [`04-shadcn-ui.md`](../../modules/04-shadcn-ui.md) §2.6 `cva` et §2.7 `asChild` et le `Slot` de Radix.
- DS, module [`08-accessibilite.md`](../../modules/08-accessibilite.md) : nom accessible d'un bouton, `aria-busy`, contenu décoratif `aria-hidden`, focus visible.
- DS, module [`07-storybook.md`](../../modules/07-storybook.md) §2.3-2.4 : `args`, `argTypes` (`select`, `boolean`).

⛔ Pas les Worked examples avant ton GREEN (l'exemple 1 du module 04 est un Button).

## Énoncé

Après `Text` (lab 01), le DS TribuZen a besoin de son action de base. Les tokens de bouton sont déjà dans `src/tokens.css` (fournis). Tu construis `Button` avec ses six endroits, plus trois comportements que tout DS doit régler une fois pour toutes :

1. **`disabled`** : un vrai attribut, pas une classe grise. Le clic ne déclenche rien.
2. **`loading`** : le bouton est désactivé, annonce `aria-busy="true"`, montre un spinner **décoratif** (`aria-hidden`) et **garde son nom accessible** (le texte). Un lecteur d'écran doit toujours entendre « Enregistrer, occupé », jamais « bouton » tout court.
3. **`asChild`** : le bouton rend **son enfant** (par exemple un `<a href>`) en lui transmettant classes et props, via le `Slot` de Radix. Un lien qui ressemble à un bouton reste un lien : pas de `type`, pas de `disabled` dessus.

Et le détail qui coûte des bugs en prod : **`type="button"` par défaut**. Un `<button>` sans `type` dans un `<form>` soumet le formulaire.

Contraintes : classes `ds-button`, `ds-button--variant-{primary|secondary|danger}`, `ds-button--size-{sm|md|lg}`, `ds-button--loading`, spinner `.ds-button__spinner` ; tout en tokens ; aucun `any`. Un test à toi en plus (`test/Button.mien.test.tsx`).

## Étapes (en friction)

1. `cva` d'abord : `variant` (défaut `primary`) et `size` (défaut `md`).
2. `ButtonProps` = API native de `<button>` avec `ref` + `VariantProps` + `asChild?` + `loading?`.
3. Destructure **tout** ce qui ne doit pas atteindre le DOM : `asChild`, `loading`, `variant`, `size`, `className`, et aussi `disabled`, `type`, `children` que tu vas recomposer.
4. Branche `asChild` : `Slot` avec les classes et `...rest`, rien d'autre. Sinon `<button>` avec `type ?? "button"`, `disabled || loading`, `aria-busy` seulement si `loading`, spinner avant `children` seulement si `loading`.
5. `Button.css` : états `:focus-visible` (anneau en token) et `:disabled` (opacité en token), `prefers-reduced-motion` sur le spinner.
6. Stories : `Primary`, `Secondary`, `Danger`, `Small`, `Loading`, `Disabled`, `AsLink` (avec un vrai `<a href>` en `children`).
7. `npm run lab:02` → lis l'endroit qui échoue → corrige → relance. Puis ton test à toi.

## Vérifier

```bash
cd 21-design-system/labs
npm run lab:02
npm run check:02
```

**Contrat attendu par l'oracle**

Fichiers : `src/Button.tsx` (exporte `Button`, `ButtonProps`), `src/Button.css`, `src/Button.stories.tsx`.

- `ButtonProps` : `variant` ∈ `primary | secondary | danger`, `size` ∈ `sm | md | lg`, `loading?: boolean`, `asChild?: boolean`, hérite de `ComponentPropsWithRef<"button">` (`type`, `disabled`, `onClick`, `aria-*`, `ref`…).
- Rendu : `<button type="button">` par défaut avec `ds-button ds-button--variant-primary ds-button--size-md` ; `type="submit"` respecté ; `disabled` → attribut ; `loading` → `disabled` + `aria-busy="true"` + `.ds-button--loading` + `.ds-button__spinner[aria-hidden="true"]` ; sans `loading` ni `aria-busy` ni spinner ; `asChild` → l'enfant rendu avec les classes, sans `type` ni `disabled`.
- Stories : `meta.component === Button`, `title` string, au minimum `Primary`, `Secondary`, `Danger`, `Loading`, `AsLink` ; chaque story rend un `.ds-button` avec du texte ; `Loading` est `aria-busy`, `AsLink` est un lien.

**Ce que l'oracle vérifie**

- **Types** : les unions ; `type` ∈ `button | submit | reset` ; `onClick`, `aria-label`, `ref` présents ; `variant="ghost"`, `href` direct et `loading="true"` refusés.
- **Comportement** : clic sur `disabled` → `onClick` jamais appelé (user-event) ; `loading` → nom accessible = le texte.
- **Hygiène DOM** : aucun attribut `variant`/`size`/`loading`/`asChild` ; `className` fusionné ; `ref` = l'élément ; **aucun `console.error`**.
- **a11y** : axe propre sur une page avec bouton texte, bouton `loading`, bouton icône + `aria-label`, lien `asChild`.

## Variante J+30 (fading)

Refais `Button` de mémoire en 30 min avec `iconLeft?: ReactNode` (décoratif, `aria-hidden`) et une contrainte de type : **un bouton sans `children` doit exiger `aria-label`** (indice : union discriminée de props, lab TS 04). Story `IconOnly`. L'oracle du lab doit rester vert.

## Application TribuZen

`tribuzen/src/design-system/Button/…`, consommé par `InvitationForm` (submit), `FamilyCard` (asChild vers `/family/[id]`), `RoutineCard` (loading pendant l'enregistrement). Commit : `feat(ds): Button — variants, asChild, loading, stories, tests`.
