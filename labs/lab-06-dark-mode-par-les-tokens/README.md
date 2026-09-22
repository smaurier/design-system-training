# Lab 06 — Intervention : mode sombre par les tokens, sans toucher aux consommateurs

> **Outcome :** à la fin, tu sais qu'un vrai design system permet un thème sombre en ne
> touchant QU'AUX TOKENS — jamais aux composants qui les consomment. C'est la preuve que
> `Text`/`Button` (labs 01-02) sont bien construits : ils ne savent rien du thème actif,
> ils lisent des variables.
> **Vrai outil :** de vraies custom properties CSS, un vrai fichier `tokens.css`. `Text.tsx`
> et `Button.tsx` vivent à la RACINE de ce lab (pas dans `src/` ni `solution/`) — tu ne peux
> structurellement pas les modifier pour ce lab, seul `tokens.css` est à ta portée.
> **Feedback :** `npm run lab:06` — RED tant qu'un bloc `[data-theme="dark"]` avec de vraies
> valeurs différentes n'existe pas. `npm run solution:06` prouve l'oracle.

## Prérequis technique

`npm install` depuis `21-design-system/labs`.

## Lire avant (une lecture bornée)

- DS, module [`05-design-tokens.md`](../../modules/05-design-tokens.md) — pourquoi un
  composant ne contient jamais une couleur en dur : c'est précisément ce qui rend ce lab
  possible.

## Énoncé

`tokens.css` (`src/`) est **en production**, mode clair uniquement. Ticket : *« ajouter un
mode sombre — sans toucher à `Text.tsx`, `Button.tsx`, ni leurs `.css`. »*

Ajoute un bloc `[data-theme="dark"]` qui redéfinit les MÊMES noms de variables de couleur
(`--ds-color-text-default`, `--ds-color-primary`, etc.) avec des valeurs différentes. Ne
touche à rien d'autre — ni aux tailles/espacements (qui n'ont pas de raison de changer avec
le thème), ni aux deux fichiers de composants (de toute façon hors de `src/` dans ce lab).

**Le piège technique découvert en construisant ce lab, pas juste un piège pédagogique.**
`getComputedStyle` sous jsdom (l'environnement de test) ne résout PAS la cascade des
propriétés custom CSS : un test qui rendrait `<Text>` sous deux thèmes et comparerait la
couleur calculée renverrait toujours la même chose (littéralement `"var(--x)"`, jamais la
couleur finale), que ta correction soit juste ou pas. L'oracle de ce lab lit donc
directement les VALEURS déclarées dans `tokens.css` — une preuve plus fiable ici qu'un test
de rendu.

## Étapes (en friction)

1. `npm run lab:06` : RED — aucun bloc `[data-theme="dark"]` n'existe encore.
2. Ajoute le bloc dans `src/tokens.css`, avec des valeurs de couleur RÉELLEMENT différentes
   (pas juste une variation cosmétique du même ton).
3. Relance : les 5 tests doivent passer.

## Vérifier

```bash
cd 21-design-system/labs
npm install
npm run lab:06
npm run solution:06
```

**Ce que l'oracle vérifie**

Un bloc `[data-theme="dark"]` existe avec au moins les couleurs clés redéfinies ; chaque
valeur redéfinie diffère RÉELLEMENT de son équivalent clair (pas un no-op) ; aucun nom de
variable n'a changé (même clés des deux côtés — un renommage casserait tout consommateur
existant) ; les tailles/espacements ne sont pas dans le bloc sombre ; `Text`/`Button` se
rendent normalement sous `data-theme="dark"` sans qu'on ait eu besoin d'y toucher.

## Variante J+30 (fading)

Le produit veut respecter `prefers-color-scheme: dark` du système ET permettre un choix
manuel qui le prime. Comment articuler `@media (prefers-color-scheme: dark)` et
`[data-theme="dark"]` dans le même fichier sans conflit de cascade ?

## Application TribuZen

Même geste sur les tokens réels de `tribuzen-admin`, avec un sélecteur de thème dans les
réglages utilisateur. Commit :
`feat(tokens): mode sombre par redéfinition des variables, zéro changement dans les consommateurs`.
