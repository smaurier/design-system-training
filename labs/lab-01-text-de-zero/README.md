# Lab 01 — `Text` de zéro : les six endroits d'un composant de design system

> **Outcome :** à la fin, tu as construit **seul et en entier** le composant le plus simple d'un design system, `Text`, avec ses six endroits : le contrat de props typé, le mapping prop → style par tokens, l'hygiène DOM (rien ne fuit, tout passe), l'accessibilité, la story, le test. Ce geste, tu le referas pour chaque composant, et c'est lui que le lab 03 te demandera de **modifier** sur un composant consommé par d'autres.
> **Vrai outil :** React 19 + TypeScript 7 + `class-variance-authority` + Storybook 10 (stories rendues par `composeStories`) + vitest 5 / Testing Library / jest-axe.
> **Feedback :** `npm run lab:01` depuis `21-design-system/labs` — RED tant que `src/` ne satisfait pas l'oracle. Au GREEN, le correcteur-labs tranche (GO/FIX/STOP). La solution vit dans `solution/` : `npm run solution:01` prouve l'oracle, tu ne l'ouvres pas avant ton GREEN.

## Lire avant (une lecture bornée, pas les modules entiers)

- React, module [`04-props-et-children.md`](../../../04-react/modules/04-props-et-children.md) : `...rest`, `children`, `className` fusionné.
- DS, module [`04-shadcn-ui.md`](../../modules/04-shadcn-ui.md) §2.5 `cn` et §2.6 `cva` : des variants **typés** à partir d'une seule déclaration.
- DS, module [`05-design-tokens.md`](../../modules/05-design-tokens.md) : pourquoi un composant ne contient jamais une couleur en dur.
- DS, module [`07-storybook.md`](../../modules/07-storybook.md) §2.1 à §2.3 : CSF3, `meta`, `args`, une story = un état rendu.
- DS, module [`08-accessibilite.md`](../../modules/08-accessibilite.md) : ce qu'un texte doit laisser passer (`aria-*`, `id`, `role`).

⛔ **Pas les Worked examples avant ton GREEN.** Ensuite : page blanche. Le module ne se rouvre qu'en dépannage ciblé, sur l'endroit que le test qui échoue désigne.

## Énoncé

Le design system TribuZen n'a encore aucun composant. Ses **tokens** existent (`src/tokens.css`, fournis : c'est la fondation, elle préexiste toujours au composant). Tu construis `Text`, le composant typographique de base, que tous les autres consommeront.

Un composant de DS n'est pas « un `<p>` avec des classes ». C'est six choses, et l'oracle vérifie les six :

1. **Le contrat** (`TextProps`) : trois variants fermés (`size`, `tone`, `weight`), un élément rendu borné (`as`), et **toute l'API native de `<p>`** (children, className, id, aria-*, data-*, onClick, ref…). Un consommateur ne doit jamais être bloqué par ton composant pour poser un `aria-label`.
2. **Le mapping prop → style** : une classe par variant, chaque classe consomme un token, **zéro valeur en dur**. C'est ce qui rendra le dark mode possible sans toucher au composant (lab 06).
3. **L'hygiène DOM** : `size`, `tone`, `weight`, `as` ne doivent **jamais** atterrir comme attributs HTML (React avertit, le HTML est pollué, et c'est le bug n°1 des DS maison). `className` de l'appelant est **fusionné**, pas écrasé. `ref` atteint l'élément.
4. **L'accessibilité** : `Text` ne cache rien, ne porte pas de sens par la couleur seule, et laisse passer tout ce qu'un lecteur d'écran attend. axe ne doit rien trouver sur une page composée de tes variants.
5. **La story** : `Text.stories.tsx` en CSF3, `meta` avec `component: Text` et un `title`, au minimum les stories `Default`, `Muted`, `Small`. **Une prop sans story n'existe pas** : c'est ce que le reviewer ouvre, ce que l'addon a11y scanne, ce que Chromatic photographie.
6. **Le test** : l'oracle est fourni ; tu écris **un test à toi** en plus (fichier `test/Text.mien.test.tsx`), sur un comportement que tu juges important et que l'oracle ne couvre pas. Le correcteur le lit.

Contraintes : aucun `any` ; les classes suivent la convention `ds-text`, `ds-text--size-md`, `ds-text--tone-muted`, `ds-text--weight-bold` (c'est la convention du DS, pas la tienne : tu la suis).

## Étapes (en friction)

1. Déclare le mapping avec `cva` **avant** le contrat : les classes et les types des variants sortent de la même déclaration (une seule source de vérité). Défauts : `md` / `default` / `regular`.
2. Écris `TextProps` : l'API native de `<p>` (avec `ref`) **+** `VariantProps<typeof …>` **+** `as?: "p" | "span"`.
3. Écris `Text` : destructure `as`, `size`, `tone`, `weight`, `className`, garde le reste dans `...rest`. Rends l'élément choisi avec la classe calculée **fusionnée** à `className`, puis `{...rest}`.
4. Crée `src/Text.css` : une règle par classe, chaque règle lit un token de `tokens.css`. Importe les deux CSS depuis `Text.tsx`.
5. Écris `Text.stories.tsx` : `meta` (`title`, `component`, `args` par défaut avec un vrai texte, `argTypes` en `select`/`radio`), puis `Default`, `Muted`, `Small`, et ce que tu veux d'autre.
6. Lance `npm run lab:01`. Lis **quel endroit** échoue, corrige cet endroit, relance. Quand c'est vert, écris ton test à toi (étape 6 de l'énoncé).

## Vérifier

```bash
cd 21-design-system/labs
npm install            # une fois
npm run lab:01         # oracle sur TON code : RED → tu continues, GREEN → correcteur-labs
npm run check:01       # tsc seul, pour isoler une erreur de types
```

**Contrat attendu par l'oracle**

Fichiers : `src/Text.tsx` (exporte `Text` et `TextProps`), `src/Text.css` (à créer), `src/Text.stories.tsx` (exporte `default` = meta et les stories). `src/tokens.css` est fourni.

- `TextProps` : `size` ∈ `"sm" | "md" | "lg"`, `tone` ∈ `"default" | "muted" | "danger"`, `weight` ∈ `"regular" | "bold"`, `as` ∈ `"p" | "span"` ; hérite de l'API de `<p>` avec `ref` (`ComponentPropsWithRef<"p">`).
- Rendu : `<p>` par défaut, `<span>` si `as="span"` ; classes `ds-text` + `ds-text--size-{sm|md|lg}` + `ds-text--tone-{default|muted|danger}` + `ds-text--weight-{regular|bold}` ; défauts `md` / `default` / `regular`.
- Story : `meta.component === Text`, `meta.title` string, stories `Default`, `Muted` (tone muted), `Small` (size sm) au minimum ; chaque story rend un `.ds-text` avec du texte.

**Ce que l'oracle vérifie** (le *quoi*, jamais le *comment*)

- **Types** : les quatre unions exactes ; `children`, `className`, `id`, `onClick`, `aria-label`, `ref` présents avec les bons types ; `size="xl"`, `tone="warning"`, `as="div"` refusés.
- **Rendu** : balise et classes par défaut ; chaque variant mappe sa classe et retire celle du défaut ; `as="span"`.
- **Hygiène DOM** : aucun attribut `size`/`tone`/`weight`/`as` sur l'élément ; `className` fusionné ; `id`, `data-testid`, `aria-label`, `onClick`, `ref` fonctionnels ; **aucun `console.error` React** pendant le rendu.
- **a11y** : `axe` sans violation sur une page composée des variants.
- **Story** : `composeStories` rend chaque story exportée avec du texte et un `.ds-text` ; `Muted`/`Small` montrent leur classe.

Une ligne `// @ts-expect-error` de l'oracle qui ne produit **pas** d'erreur compte comme un échec.

## Variante J+30 (fading)

Refais `Text` **de mémoire, en 30 min**, avec deux contraintes ajoutées : un variant `align` (`start | center | end`) et une prop `truncate?: boolean` (une ligne, ellipsis) **avec** l'alternative accessible que tu juges nécessaire (indice : un texte coupé visuellement doit rester lisible quelque part). Écris la story qui le montre. `npm run lab:01` doit rester vert : ton ajout ne casse rien de l'existant. C'est l'échauffement du lab 03.

## Application TribuZen

`Text` devient `tribuzen/src/design-system/Text/{Text.tsx,Text.css,Text.stories.tsx,Text.test.tsx}`, importé par `FamilyFeed`, `RoutineCard` et `ProfilePage` au cours React. Commit : `feat(ds): Text — contrat, tokens, stories, tests`.
