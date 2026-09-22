# Lab 07 — Intervention : migrer un catalogue Storybook CSF2 vers CSF3

> **Outcome :** à la fin, tu sais migrer un fichier de stories CSF2 (`Template.bind({})`,
> `.args` posé après coup) vers CSF3 (objets typés) — et tu sais POURQUOI ça compte
> vraiment : pas parce que l'ancien format "casse" (il ne casse pas, Storybook le compose
> encore très bien), mais parce qu'il a perdu toute vérification de type sur les `args`.
> **Vrai outil :** Storybook 10.6, `composeStories`. La preuve n'est pas seulement "ça se
> rend" (ça se rendait déjà avant) mais une relecture du code source qui vérifie que les
> patterns CSF2 ont vraiment disparu.
> **Feedback :** `npm run lab:07` — RED tant que le fichier garde `Template.bind({})` ou une
> assignation `.args =` a posteriori. `npm run solution:07` prouve l'oracle.

## Prérequis technique

`npm install` depuis `21-design-system/labs`.

## Lire avant (une lecture bornée)

- DS, module [`07-storybook.md`](../../modules/07-storybook.md) — CSF3, `meta`, `args`,
  `satisfies Meta<typeof Component>`.

## Énoncé

`src/Badge.stories.tsx` est **en production**, écrit en CSF2. Ticket : *« migrer ce
catalogue vers CSF3. »*

**Le piège — et la vraie leçon du lab.** Lance `npm run lab:07` avant de toucher au fichier :
les tests de RENDU (via `composeStories`) passent déjà. Storybook 10.6 garde une
compatibilité descendante qui compose et affiche encore très bien un fichier CSF2 — ce
n'est PAS pour ça qu'on migre. La vraie raison : `Template.bind({})` renvoie un type trop
large (`.bind()` sur une fonction typée perd la précision de ses paramètres en TypeScript),
donc `Success.args = { tone: "succes" }` (faute de frappe) ne serait JAMAIS signalé par
TypeScript avant l'exécution. C'est ce que les deux derniers tests vérifient : pas "est-ce
que ça marche", mais "est-ce que les patterns qui ont fait perdre la sécurité de type ont
disparu".

## Étapes (en friction)

1. `npm run lab:07` : les 4 tests de rendu passent DÉJÀ (piège), les 2 tests de relecture du
   source sont ROUGES.
2. Remplace le `default export` par un objet `meta` typé `satisfies Meta<typeof Badge>`
   (avec `args: { children: "Actif" }` partagé).
3. Remplace chaque `Template.bind({})` + `.args = {...}` par un export nommé `: Story = {
   args: {...} }` — un objet, plus une fonction.
4. Relance : les 6 tests doivent passer.

## Vérifier

```bash
cd 21-design-system/labs
npm install
npm run lab:07
npm run solution:07
```

**Ce que l'oracle vérifie**

`composeStories` compose et rend correctement chacune des trois stories (classes attendues
selon le `tone`) ; le `default export` expose bien `title`/`component` ; le fichier source
ne contient plus `Template.bind({})` ni d'assignation `.args =` a posteriori, et utilise bien
`satisfies Meta<...>` / `StoryObj<...>`.

## Variante J+30 (fading)

Une story `Success` avec une faute de frappe dans `tone` (`"succes"` au lieu de `"success"`)
— le composant CSF3 typé le signale-t-il vraiment à la compilation ? Écris ce test toi-même
et vérifie.

## Application TribuZen

Même migration sur le catalogue réel de `tribuzen-admin`, fichier par fichier, sans tout
réécrire d'un coup (migration incrémentale, cours React 41). Commit :
`refactor(stories): Badge migré CSF2 → CSF3, sécurité de type sur les args restaurée`.
