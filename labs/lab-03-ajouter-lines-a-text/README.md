# Lab 03 — Intervention : ajouter `lines` à `Text`, consommé par trois écrans

> **Outcome :** à la fin, tu sais **modifier un composant de design system en production** sans casser ce qui le consomme : décider l'API (une prop, pas deux), écrire tes findings avant de toucher au code, faire évoluer les six endroits, prouver la non-régression. C'est le geste exact sur lequel tu as bloqué en mission le 22/09/2026 (« passer deux props pour un truncate boolean et un nombre de lignes »).
> **Vrai outil :** le même DS que les labs 01-02, plus **trois écrans consommateurs** et **une suite de non-régression déjà verte** (`test/regression.test.tsx`). Le second oracle, `test/lines.test.tsx`, est RED : c'est la spécification de ce que tu ajoutes.
> **Feedback :** `npm run lab:03` — GREEN = la non-régression **et** la nouvelle capacité. `FINDINGS.md` est lu par le correcteur avant de regarder ton code. `npm run solution:03` prouve l'oracle ; tu ne l'ouvres pas avant ton GREEN.

## Lire avant (une lecture bornée)

- Ton propre `Text` du lab 01 : relis-le **en entier** (c'est l'existant, sauf qu'ici tu ne l'as pas écrit hier).
- DS, module [`08-accessibilite.md`](../../modules/08-accessibilite.md) : contenu masqué visuellement vs masqué au lecteur d'écran ; l'exigence d'une alternative.
- React, module [`32-patterns-composition.md`](../../../04-react/modules/32-patterns-composition.md) : étendre une API sans casser les appels existants (défauts, optionnels, rétro-compatibilité).
- DS, module [`07-storybook.md`](../../modules/07-storybook.md) §2.4 `argTypes` (contrôle `number` avec `min`/`max`).

## Énoncé

Le produit demande : *« dans le fil de la famille, les messages longs doivent être coupés à trois lignes avec une ellipse ; sur les cartes de routine, à une ligne »*. Un collègue propose d'ajouter `truncate: boolean` et `lines: number` à `Text`.

`Text` est consommé par **trois écrans** (`src/screens/`) que tu ne dois **pas modifier** et qui ont leur suite de tests, verte aujourd'hui. Ta mission :

**0. Les findings, avant toute ligne de code.** Crée `FINDINGS.md` à la racine du lab et réponds par écrit :
- Deux props ou une seule ? Que se passe-t-il avec `truncate={false} lines={3}` ? Avec `truncate lines={undefined}` ? Tranche, et justifie en une phrase (indice : le nombre porte déjà la décision).
- Quels endroits de `Text` ta modification touche-t-elle ? Liste-les **avant** d'ouvrir le fichier, puis compare après.
- Quel risque pour chacun des trois écrans ? Lequel passe un `style` ou un `title` que tu pourrais écraser ?
- Un texte coupé à l'écran : que lit un lecteur d'écran ? Qu'est-ce qu'un utilisateur clavier voyant ne peut plus faire ? Quelle alternative minimale proposes-tu ?

**1. Le contrat** : `lines?: number`. Absent = comportement actuel, strictement identique.
**2. Le mapping** : classe `ds-text--clamped` + variable CSS `--ds-text-lines` posée en style inline (une classe par valeur serait infinie ; un `-webkit-line-clamp` inline sortirait la règle du CSS du DS). La règle CSS lit la variable.
**3. L'hygiène** : `lines` ne fuit pas dans le DOM ; un `style` fourni par l'appelant est **fusionné** ; un `title` fourni n'est **pas écrasé**.
**4. L'accessibilité** : le contenu complet reste dans le DOM ; quand `children` est une chaîne, le texte complet est exposé en `title`. (C'est le minimum ; la variante J+30 fait mieux.)
**5. La story** : `Clamped`, avec un texte long et un conteneur étroit pour que la coupe se voie. Un `argType` `number` pour `lines`.
**6. La preuve** : `regression.test.tsx` reste vert, `lines.test.tsx` passe au vert. Puis un test à toi.

## Étapes (en friction)

1. Écris `FINDINGS.md` (15 min max, sans ouvrir `Text.tsx`).
2. Ouvre `Text.tsx`. Compare avec ta liste d'endroits. Note l'écart dans `FINDINGS.md`.
3. Ajoute la prop et destructure **aussi** `style`, `title`, `children` : tu vas les recomposer.
4. Calcule `clamped`, la classe, le style fusionné, le `title` résolu. Rends `children` explicitement.
5. Ajoute la règle `.ds-text--clamped` en bas de `Text.css`. Ne touche à rien d'autre.
6. Ajoute `Clamped` et l'`argType` dans les stories. Ne renomme rien.
7. `npm run lab:03`. Si `regression` casse, c'est toi : reviens à l'étape 3.

## Vérifier

```bash
cd 21-design-system/labs
npm run lab:03
```

**Contrat attendu par l'oracle**

- `TextProps.lines?: number` ; `lines="3"` et `lines={true}` refusés ; le contrat des labs 01 intact (`size`, `tone`, `as`, `ref`, `onClick`).
- `lines={n}` (n > 0) → classe `ds-text--clamped` + `style` contenant `--ds-text-lines: n` ; sans `lines` → ni classe, ni variable, ni `title`.
- `children` chaîne + `lines` → `title` = le texte complet ; `title` fourni → conservé ; `children` non textuel → clamp sans `title`.
- `style` de l'appelant fusionné ; aucun attribut `lines` ; aucun `console.error`.
- Story `Clamped` présente, rend un `.ds-text--clamped` avec un texte long ; `Default`, `Muted`, `Small` toujours là.
- `regression.test.tsx` : les trois écrans rendent exactement comme avant (variantes, `id`, `className` fusionné, `onClick`), axe propre, zéro `console.error`.

## Variante J+30 (fading)

Refais l'intervention de mémoire en 25 min, avec l'alternative accessible **complète** : une prop `expandable?: boolean` qui ajoute un bouton « Afficher tout » (`aria-expanded`, nom accessible, focusable) et retire la coupe au clic. Non-régression toujours verte. Story `ClampedExpandable`.

## Application TribuZen

Même diff sur `tribuzen/src/design-system/Text`, puis `FamilyFeed` passe `lines={3}` et `RoutineCard` `lines={1}` : c'est **une deuxième PR**, celle des consommateurs, séparée de celle du composant. Commit 1 : `feat(ds): Text.lines — troncature multi-lignes, title de repli, story Clamped`. Commit 2 : `feat(feed): messages coupés à 3 lignes`.
