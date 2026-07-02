# Lab 01 — CSS moderne : tokens + grille de cartes famille

> **Outcome :** à la fin, tu sais poser les design tokens TribuZen en custom properties et bâtir une grille de cartes famille responsive avec Grid, Flex, container query, `clamp()` et `:has()` — le tout sans framework.
> **Vrai outil :** un fichier `index.html` + `style.css` ouverts dans un navigateur (DevTools pour inspecter cascade et container). Aucun build, aucun test-runner.
> **Feedback :** le coach valide visuellement en session — pas d'auto-correcteur.

---

## Énoncé

Tu poses le socle CSS de TribuZen **avant** toute librairie. Cahier des charges **exact** :

1. **Tokens** — déclare sur `:root` les custom properties de marque : couleurs sauge `#6B7E6B` / terracotta `#C4785A` / sable `#F8F5F0` / encre `#2C2C2C`, fonts Fraunces (titres) et Inter (corps), `--font-size-base: 1rem` (plancher RGAA), une échelle d'espacement et un rayon.
2. **Titre fluide** — un token `--font-size-title` en `clamp()` : jamais sous `1.25rem`, jamais au-dessus de `2rem`, fluide entre les deux.
3. **Grille** — `.family-grid` en **Grid** auto-remplie (`repeat(auto-fill, minmax(260px, 1fr))`), responsive **sans media query**, et déclarée comme conteneur (`container-type: inline-size`).
4. **Carte** — `.family-card` : surface + bordure + rayon en tokens, espacement en **propriétés logiques** (`padding-inline` / `padding-block`), en-tête en **Flex** (avatar + titre).
5. **Container query** — quand le conteneur `.family-grid` dépasse `380px`, le corps de carte passe en disposition horizontale.
6. **`:has()`** — une carte contenant `.badge--premium` reçoit une bordure accent terracotta, sans JS.

**Données de départ (3 familles à afficher) :**

```
Les Dupont  — 4 membres · prochaine routine dans 2 h
Les Martin  — 3 membres · 12 routines cette semaine   [Premium]
Les Nguyen  — 5 membres · routine du soir active
```

**Contraintes :**
- Zéro valeur de couleur/taille en dur dans les composants : tout passe par `var(--…)`.
- Aucune media query pour la grille (auto-fill uniquement).
- Typographie en `rem`, jamais en `px` sous `1rem`.
- **Pas de gap-fill** — tu écris tout le CSS depuis le starter.

### Starter minimal

Crée un dossier et deux fichiers, ouvre `index.html` dans le navigateur (double-clic suffit) :

```
tribuzen-css-lab/
  index.html    ← structure fournie ci-dessous (ne la modifie pas)
  style.css     ← à écrire entièrement
```

`index.html` (fourni, à ne pas toucher) :

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TribuZen — Lab 01</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Mes tribus</h1>
  <section class="family-grid">
    <article class="family-card">
      <header class="family-card__header">
        <span class="family-card__avatar" aria-hidden="true">D</span>
        <h2 class="family-card__title">Les Dupont</h2>
      </header>
      <div class="family-card__body">
        <p>4 membres · prochaine routine dans 2 h</p>
      </div>
    </article>

    <article class="family-card">
      <header class="family-card__header">
        <span class="family-card__avatar" aria-hidden="true">M</span>
        <h2 class="family-card__title">Les Martin</h2>
        <span class="badge badge--premium">Premium</span>
      </header>
      <div class="family-card__body">
        <p>3 membres · 12 routines cette semaine</p>
      </div>
    </article>

    <article class="family-card">
      <header class="family-card__header">
        <span class="family-card__avatar" aria-hidden="true">N</span>
        <h2 class="family-card__title">Les Nguyen</h2>
      </header>
      <div class="family-card__body">
        <p>5 membres · routine du soir active</p>
      </div>
    </article>
  </section>
</body>
</html>
```

Ouvre l'onglet DevTools > Elements pour inspecter la cascade, et redimensionne la fenêtre pour voir la grille passer de 1 à N colonnes.

---

## Étapes (en friction)

1. **Pose les tokens** dans `:root` : les 4 couleurs, les 2 fonts, `--font-size-base: 1rem`, `--font-size-title` en `clamp(1.25rem, 1rem + 1.8vw, 2rem)`, `--space-sm/md/lg`, `--radius-md`.
2. **Stylise `body`** : `font-family` corps, `font-size: var(--font-size-base)`, `color: var(--color-text)`, un `line-height` confortable.
3. **Écris `.family-grid`** : `display: grid`, colonnes auto-fill `minmax(260px, 1fr)`, `gap`, puis `container-type: inline-size` + `container-name: grid`.
4. **Écris `.family-card`** : `background-color` surface, `border` primaire, `border-radius`, espacement en `padding-inline` / `padding-block`.
5. **Écris `.family-card__header`** en Flex (`align-items: center`, `gap`) et `.family-card__title` avec `font-family` Fraunces + `font-size: var(--font-size-title)`.
6. **Ajoute la container query** : `@container grid (min-width: 380px) { .family-card__body { display: flex; gap; align-items } }`.
7. **Ajoute la règle `:has()`** : `.family-card:has(.badge--premium)` → bordure accent 2px.
8. **Vérifie** : redimensionne (grille 1→3 colonnes) ; élargis (le corps passe horizontal via `@container`) ; la carte Martin a la bordure terracotta ; zoome à 200 % (le titre reste lisible, ne descend pas sous le plancher).

---

## Corrigé complet commenté

```css
/* ─── style.css ──────────────────────────────────────────────────── */

/* 1. TOKENS — source de vérité unique, déclarés sur :root (globaux) */
:root {
  --color-primary: #6B7E6B;   /* sauge — fonds/bordures/focus uniquement (4.00:1 sur crème → OK composant ≥3:1, PAS texte AA) */
  --color-primary-text: #5A6B5A; /* sauge assombri pour le TEXTE (5.24:1 sur crème → AA ok). Contraste : voir module 08 */
  --color-accent:  #C4785A;   /* terracotta */
  --color-surface: #F8F5F0;   /* sable  */
  --color-text:    #2C2C2C;   /* encre  */

  --font-heading: 'Fraunces', Georgia, serif;   /* fallbacks si la webfont n'est pas chargée */
  --font-body: 'Inter', system-ui, sans-serif;

  --font-size-base: 1rem;                         /* 16px — plancher RGAA, jamais moins */
  /* Titre fluide : borné entre 1.25rem et 2rem, progression douce via vw */
  --font-size-title: clamp(1.25rem, 1rem + 1.8vw, 2rem);
  --line-height-base: 1.6;

  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --radius-md: 0.75rem;
}

/* 2. BODY — tout en tokens : changer un token répercute partout */
body {
  margin: 0;
  padding: var(--space-lg);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-text);
  background: #fff;
}

h1 {
  font-family: var(--font-heading);
  color: var(--color-primary-text);   /* texte < 24px → token TEXTE conforme AA, pas le sauge de fond */
}

/* 3. GRILLE — Grid 2 axes, auto-fill => responsive SANS media query.
      container-type fait de .family-grid un conteneur interrogeable par @container. */
.family-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-lg);
  container-type: inline-size;   /* mesure sur l'axe inline (largeur) */
  container-name: grid;
}

/* 4. CARTE — surface + bordure en tokens ; espacement en propriétés LOGIQUES
      (padding-inline/-block) => i18n-ready, s'inverse tout seul en RTL. */
.family-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding-inline: var(--space-md);
  padding-block: var(--space-md);
}

/* 5a. EN-TÊTE — Flex : 1 seul axe, avatar + titre alignés verticalement */
.family-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.family-card__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-surface);
  font-family: var(--font-heading);
  font-weight: 600;
  flex: 0 0 auto;                 /* l'avatar ne se comprime pas */
}

/* 5b. TITRE — Fraunces + taille fluide via le token clamp() */
.family-card__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--font-size-title);
  color: var(--color-primary-text);   /* titre = texte → token TEXTE conforme AA (contraste : voir module 08) */
}

.family-card__body {
  margin-block-start: var(--space-sm);
}

/* 6. CONTAINER QUERY — réagit à la largeur du CONTENEUR .family-grid,
      pas au viewport. Quand une colonne dépasse 380px, le corps passe horizontal. */
@container grid (min-width: 380px) {
  .family-card__body {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }
}

/* 7. :has() — style le PARENT selon son contenu, sans JS.
      Une carte qui contient un badge premium reçoit l'accent terracotta. */
.family-card:has(.badge--premium) {
  border-color: var(--color-accent);
  border-width: 2px;
}

/* Badge premium (pour rendre la règle :has() visible) */
.badge--premium {
  margin-inline-start: auto;      /* pousse le badge à la fin de l'en-tête flex */
  padding-inline: var(--space-sm);
  padding-block: 0.15rem;
  border-radius: 999px;
  background: var(--color-accent);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Bonus — thème sombre gratuit : on ne redéclare AUCUNE règle de composant,
   seulement les tokens ; tout ce qui est en var() bascule. */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #1F211F;
    --color-text: #F0EDE8;
  }
  body { background: #141514; }
}
```

**Pourquoi ce corrigé est correct :**
- **Une seule source de vérité** : toutes les couleurs/tailles vivent dans `:root`. Changer `--color-primary` met à jour avatars, bordures, titres et `h1` d'un coup.
- **Grid pour la structure 2D** (colonnes alignées, auto-fill), **Flex pour l'en-tête 1D** (avatar + titre) — chaque outil sur sa dimension.
- **`container-type` + `@container`** rendent la carte responsive à son conteneur : placée demain dans une sidebar étroite, elle réagira correctement là où une media query se tromperait.
- **Propriétés logiques** (`padding-inline`, `margin-block-start`, `margin-inline-start`) : la mise en page s'inverse seule en RTL.
- **`:has()`** distingue la carte Premium sans une ligne de JavaScript.
- **`clamp()`** garde le titre fluide mais borné : jamais illisible (plancher), jamais géant (max).
- Le **dark mode** ne duplique aucune règle de composant : preuve que les tokens runtime font le travail.

---

## Variante J+30 (fading)

**Même socle, contraintes ajoutées — reproduire de mémoire en 25 minutes, sans rouvrir ce corrigé ni le module :**

1. Ajoute un token `--space-xl` et un **`AppShell`** en Grid à zones nommées (`grid-template-areas: "sidebar header" / "sidebar main"`, colonnes `240px 1fr`), avec `.family-grid` placée dans la zone `main`.
2. Remplace la valeur fixe `260px` de `minmax()` par un token `--card-min` et fais varier la densité de la grille rien qu'en changeant ce token.
3. Ajoute un état sélectionné : une carte contenant `input[type=checkbox]:checked` (ajoute une case dans l'en-tête) reçoit un fond `--color-surface` assombri, via `:has(input:checked)`.
4. Rends le `padding` de la carte fluide avec `clamp(0.75rem, 2vw, 1.5rem)`.

**Critère de réussite :** l'AppShell tient en pleine hauteur avec sidebar fixe + contenu fluide ; changer `--card-min` reflow la grille ; cocher une carte la met en surbrillance sans JS ; le padding respire avec la largeur.

---

## Application TribuZen

Dans le repo `smaurier/tribuzen`, ce socle vit ici :

```
tribuzen/src/
  styles/
    tokens.css        ← les custom properties de ce lab (source de vérité)
    globals.css       ← reset + body en tokens + dark mode
  components/
    layout/
      AppShell.tsx     ← Grid à zones nommées (variante J+30)
    family/
      FamilyGrid.tsx   ← grille auto-fill + container-type
      FamilyCard.tsx   ← Flex header + clamp titre + :has(premium)
```

**Différences par rapport au lab :**
- Le CSS sera scindé en `tokens.css` (importé une fois) + CSS modules par composant, au lieu d'un `style.css` global.
- Les `<span class="family-card__avatar">` deviendront le composant `Avatar` du cours React (module 05).
- `tokens.css` sera **généré** depuis un JSON de tokens au module 05 — ici on l'écrit à la main pour maîtriser le mécanisme natif avant de l'industrialiser.

**Commit cible :**
```
feat(styles): tokens.css — custom properties de marque TribuZen (source de vérité)
feat(family): FamilyGrid + FamilyCard — Grid/Flex, container query, clamp, :has()
```
