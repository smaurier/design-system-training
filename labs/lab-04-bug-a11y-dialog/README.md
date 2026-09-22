# Lab 04 — Intervention : bug rapporté sur un Dialog Radix, findings avant code

> **Outcome :** à la fin, tu sais pourquoi Radix `Dialog.Content` exige un `Dialog.Title`
> (pas juste un `<h2>` visuel), pourquoi un bouton icône a besoin d'un `aria-label`, et
> surtout : qu'un scan automatisé (`jest-axe`) ne remplace PAS un test qui interroge le DOM
> comme un lecteur d'écran le ferait. Ce lab te le prouve : le scan passe déjà sur le code
> buggé.
> **Vrai outil :** `@radix-ui/react-dialog`, Testing Library (`getByRole(..., { name })`),
> `jest-axe`. `regression.test.tsx` (déjà vert) + `a11y.test.tsx` (rouge sur le bug rapporté).
> **Feedback :** `npm run lab:04` — GREEN seulement si non-régression **et** le bug rapporté
> sont corrigés ensemble. `FINDINGS.md` est lu par le correcteur avant ton code.
> `npm run solution:04` prouve l'oracle.

## Prérequis technique

`npm install` depuis `21-design-system/labs`.

## Lire avant (une lecture bornée)

- Module [`08-accessibilite.md`](../../modules/08-accessibilite.md) — nom accessible,
  `aria-labelledby`, pourquoi un texte visuel seul ne suffit pas à nommer un composant pour
  un lecteur d'écran.
- [Documentation Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
  — `Dialog.Title`, `Dialog.Description`, ce qu'ils posent automatiquement sur
  `Dialog.Content`.

## Énoncé

`ConfirmDialog` (`src/ConfirmDialog.tsx`) est **en production**. Un rapport arrive :

> *« En utilisant VoiceOver pour supprimer un post, la modale de confirmation s'annonce
> juste "dialog, web dialog" — aucun titre, aucune idée de ce qui va être supprimé. Le
> bouton pour fermer, lui, n'est annoncé que "bouton" — je ne sais pas ce qu'il fait avant
> de l'activer. »*

**0. `FINDINGS.md`, avant toute ligne de code.** Lis `src/ConfirmDialog.tsx` — rien d'autre
— et réponds aux questions de `FINDINGS.md`. Le correcteur le lit avant ton code.

**1. Corrige les deux problèmes**, en place :
- Le `<h2>Supprimer ce post ?</h2>` visuel devient `<Dialog.Title>` — c'est ce composant,
  pas le texte lui-même, qui pose `aria-labelledby` sur `Dialog.Content`.
- Le bouton `×` reçoit `aria-label="Fermer"`.

**Le piège à éviter — et la vraie leçon du lab.** Lance `npm run lab:04` avant de corriger
quoi que ce soit : le test `jest-axe` **passe déjà**. Un scan automatisé ne détecte ici NI le
dialogue sans nom fonctionnel, NI le bouton mal nommé (un caractère `×` compte comme un nom
pour l'outil, même s'il ne veut rien dire). Les deux tests qui, eux, échouent
(`getByRole("dialog", { name })` et `getByRole("button", { name })`) interrogent le DOM
EXACTEMENT comme un lecteur d'écran le ferait — c'est cette différence qui est le sujet du
lab, pas juste la correction elle-même.

## Étapes (en friction)

1. Remplis `FINDINGS.md`.
2. `npm run lab:04` : la non-régression est VERTE, `jest-axe` aussi (!), mais les deux tests
   de nom accessible sont ROUGES.
3. Remplace le `<h2>` par `<Dialog.Title>`, ajoute `<Dialog.Description>` (Radix la
   réclame aussi), ajoute `aria-label="Fermer"` sur le bouton `×`.
4. Relance : les 6 tests doivent passer.

## Vérifier

```bash
cd 21-design-system/labs
npm install
npm run lab:04
npm run solution:04
```

**Ce que l'oracle vérifie**

Non-régression : Annuler ferme sans confirmer, Confirmer appelle `onConfirm` puis ferme, rien
ne s'affiche si `open` est faux. Revue : le dialogue a un nom accessible dérivé de son titre
(`getByRole("dialog", { name })`), le bouton de fermeture a un nom accessible utile
(`getByRole("button", { name: "Fermer" })`) — et `jest-axe` ne remonte aucune violation dans
les deux cas (rappel : ça ne prouve PAS l'absence de bug, voir plus haut).

## Variante J+30 (fading)

Le produit ajoute une deuxième modale imbriquée (confirmation de la confirmation, pour une
suppression définitive). Le focus doit-il revenir sur le bouton "Confirmer" de la première
modale, ou ailleurs, une fois la deuxième fermée ? Teste ton hypothèse.

## Application TribuZen

Même revue sur une vraie modale de `tribuzen-admin` avec un VRAI lecteur d'écran (NVDA ou
VoiceOver) en plus des tests automatisés — jamais l'un sans l'autre. Commit :
`fix(dialog): Dialog.Title + aria-label sur la fermeture — nom accessible réel, pas juste jest-axe au vert`.
