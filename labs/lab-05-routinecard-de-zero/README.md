# Lab 05 — `RoutineCard` de zéro : un composé et ses trois états réels

> **Outcome :** à la fin, tu as construit un composant COMPOSÉ (pas un atome comme
> `Text`/`Button`) dont la complexité n'est pas dans des variants visuels mais dans ses
> ÉTATS : chargement, erreur, vide, rempli. Tu sais rendre les états impossibles
> IMPOSSIBLES à construire avec une union discriminée, choisir `role="status"` vs
> `role="alert"` selon ce que chaque état doit annoncer, et prouver chaque état par une
> story rendue et testée — pas juste "ça a l'air bon" dans Storybook.
> **Vrai outil :** React 19 + TypeScript 7 + Storybook 10 (stories rendues par
> `composeStories`) + vitest 5 / Testing Library / jest-axe.
> **Feedback :** `npm run lab:05` — RED tant que `src/` ne satisfait pas l'oracle.
> `npm run solution:05` prouve l'oracle.

## Lire avant (une lecture bornée)

- DS, module [`07-storybook.md`](../../modules/07-storybook.md) — CSF3, `composeStories`,
  une story = un état rendu, testable comme n'importe quel composant.
- DS, module [`08-accessibilite.md`](../../modules/08-accessibilite.md) — `role="status"`
  (annonce polie, n'interrompt pas) vs `role="alert"` (annonce immédiate) : quand utiliser
  lequel.
- Ton lab 01 (`Text`) : même méthode des "endroits", appliquée cette fois à des ÉTATS plutôt
  qu'à des variants visuels.

## Énoncé

Lis les commentaires en tête de `src/RoutineCard.tsx` — ils décrivent le contrat exact
(union discriminée par `status`) et le mapping état → rendu. Construis `RoutineCard.tsx` ET
`RoutineCard.stories.tsx` (les deux sont page blanche).

**Le piège à éviter.** Des props optionnelles en vrac (`tasks?: Task[]; error?: string;
loading?: boolean`) permettent des combinaisons absurdes (`loading: true` ET `error: "x"` en
même temps — lequel affiche-t-on ?). Une union discriminée par `status` rend ces
combinaisons **impossibles à écrire**, pas juste à éviter par discipline.

## Étapes (en friction)

1. Écris le contrat (`RoutineTask`, `RoutineCardProps` en union discriminée).
2. Implémente les quatre branches de rendu dans `RoutineCard.tsx` — loading, error, success
   vide, success rempli — avec le bon rôle ARIA pour loading/error.
3. Écris `RoutineCard.stories.tsx` : `Default`, `Vide`, `Chargement`, `Erreur`.
4. `npm run lab:05` : les tests "ENDROIT" valent pour le composant seul ; les tests
   "ENDROIT 5" valent pour tes STORIES (rendues via `composeStories`) — une story mal
   câblée échoue exactement comme un bug dans le composant.

## Vérifier

```bash
cd 21-design-system/labs
npm install
npm run lab:05
npm run solution:05
```

**Ce que l'oracle vérifie**

Le composant seul (contrat, mapping, hygiène DOM, `jest-axe` sur les trois formes) ; puis
CHACUNE de tes quatre stories, rendue via `composeStories` : `Default` affiche une vraie
liste, `Vide` affiche le texte d'état vide (pas de `<ul>`), `Chargement` expose
`role="status"`, `Erreur` expose `role="alert"` avec un bouton "Réessayer" fonctionnel.

## Variante J+30 (fading, correcteur-gradée)

Écris un test à toi (`test/RoutineCard.mien.test.tsx`) sur un comportement que tu juges
important et que l'oracle ne couvre pas — par exemple : que se passe-t-il si `onRetry` lui-
même échoue (l'utilisateur reclique "Réessayer" plusieurs fois de suite) ?

## Application TribuZen

Même geste sur l'écran routines de `tribuzen-admin`, avec un vrai `useQuery` (cours React 23)
dont les trois états (`isPending`, `isError`, `data`) se mappent directement sur `status`.
Commit : `feat(routine-card): composé avec ses 3 états réels, stories testées`.
