---
titre: CSS moderne — fondamentaux solides
cours: 21-design-system
notions: [custom properties (variables CSS), cascade et spécificité, héritage, flexbox vs grid, container queries, logical properties, sélecteur :has(), clamp() et fluid design]
outcomes: [poser des design tokens en custom properties, calculer une spécificité et prévoir le gagnant de la cascade, choisir Flexbox ou Grid selon la dimension du layout, rendre un composant responsive avec les container queries, fluidifier une valeur avec clamp()]
prerequis: []
next: 02-tailwind-css
libs: []
tribuzen: tokens design TribuZen en custom properties et layout des cartes famille en Grid/Flex
last-reviewed: 2026-07
---

# CSS moderne — fondamentaux solides

> **Outcomes — tu sauras FAIRE :** poser des design tokens en custom properties, calculer une spécificité et prévoir le gagnant de la cascade, choisir Flexbox ou Grid selon la dimension du layout, rendre un composant responsive avec les container queries, fluidifier une taille avec `clamp()`.
> **Difficulté :** :star::star:

## 1. Cas concret d'abord

Tu démarres l'UI de TribuZen. Avant toute librairie (Tailwind, shadcn, tokens JSON), tu dois poser le socle CSS : les couleurs, les typos, les espacements de la marque, puis afficher une **carte famille** dans une grille de cartes. Le designer a fourni la charte :

- couleurs : sauge `#6B7E6B` (primaire), terracotta `#C4785A` (accent), sable `#F8F5F0` (surface), encre `#2C2C2C` (texte) ;
- typos : Fraunces pour les titres, Inter pour le corps ;
- règle RGAA : taille de texte de base `1rem` minimum (16px), jamais en dessous.

Un collègue a écrit ça, en dur, copié-collé dans chaque composant :

```css
/* AVANT — valeurs en dur, dupliquées partout */
.family-card {
  background-color: #f8f5f0;
  color: #2c2c2c;
  border: 1px solid #6b7e6b;
  padding: 16px;
  font-family: 'Inter', sans-serif;
}
.family-card__title {
  color: #6b7e6b;
  font-family: 'Fraunces', serif;
  font-size: 22px;
}
```

**Trois problèmes immédiats :**
1. Si la marque change le sauge, il faut le remplacer dans 40 fichiers — et on en oublie.
2. Aucune source de vérité : `#6B7E6B` et `#6b7e6b` traînent en doublon, impossible à auditer.
3. `font-size: 22px` en dur ne s'adapte ni à l'écran ni au conteneur — ni fluid, ni responsive au composant.

Ce module pose le socle correct : **custom properties** comme tokens, **cascade** maîtrisée, **Grid/Flex** pour le layout, **container queries** + **`clamp()`** pour un responsive qui suit le composant, pas seulement le viewport.

---

## 2. Théorie complète, concise

### 2.1 Custom properties (variables CSS) — la base des design tokens

Une custom property est une variable CSS : un nom préfixé `--`, lue avec `var()`. Contrairement aux variables Sass (résolues à la compilation), elles vivent **dans le navigateur au runtime** — elles héritent, cascadent et changent à chaud (thème, media query, override local).

```css
:root {
  /* Couleurs de marque TribuZen */
  --color-primary: #6B7E6B;   /* sauge */
  --color-accent:  #C4785A;   /* terracotta */
  --color-surface: #F8F5F0;   /* sable */
  --color-text:    #2C2C2C;   /* encre */

  /* Typographie */
  --font-heading: 'Fraunces', serif;
  --font-body: 'Inter', sans-serif;
  --font-size-base: 1rem;     /* 16px min — plancher RGAA */
  --line-height-base: 1.6;

  /* Espacements (échelle) */
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --radius-md: 0.75rem;
}

.family-card {
  background-color: var(--color-surface);
  color: var(--color-text);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
}
```

`var()` accepte une **valeur de repli** : `var(--color-brand, #6B7E6B)` utilise `#6B7E6B` si `--color-brand` n'est pas défini. Les tokens déclarés sur `:root` sont globaux ; déclarés sur un sélecteur, ils ne valent que dans son sous-arbre.

```css
/* Override LOCAL — n'affecte que .family-card.is-featured et ses enfants */
.family-card.is-featured {
  --color-surface: #EAF0EA;   /* la carte redéfinit son propre token */
  background-color: var(--color-surface);
}
```

Parce qu'elles vivent au runtime, elles pilotent un thème sombre sans dupliquer une seule règle de composant :

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #1A1A1A;
    --color-text: #F0EDE8;
    /* tout composant en var(--color-surface) bascule automatiquement */
  }
}
```

C'est exactement ce qu'est un **design token** : une valeur nommée, unique, réutilisée. Le module 05 les industrialisera (JSON → CSS), mais le mécanisme natif, c'est ça.

### 2.2 Cascade, spécificité, héritage

Quand plusieurs règles ciblent le même élément, le navigateur tranche par **origine → spécificité → ordre d'apparition**. Concentrons-nous sur la spécificité, notée en triplet `(a, b, c)` :

- `a` = nombre d'ID (`#nav`) ;
- `b` = nombre de classes, attributs, pseudo-classes (`.menu`, `[type=text]`, `:hover`) ;
- `c` = nombre de types (balises) et pseudo-éléments (`li`, `::before`).

On compare de gauche à droite ; le plus grand `a` gagne, puis `b`, puis `c`.

```
#nav .menu li a     → (1, 1, 2)   ← 1 ID, 1 classe, 2 balises
.menu a             → (0, 1, 1)
a                   → (0, 0, 1)
```

`#nav .menu li a` l'emporte sur les deux autres. À spécificité **égale**, c'est la dernière règle déclarée qui gagne (ordre source).

Au-dessus de tout ça : le style inline `style="…"` bat les sélecteurs, et `!important` bat le inline. Les deux **cassent la cascade** — à éviter, c'est le signe d'une spécificité mal maîtrisée.

L'**héritage** est distinct de la cascade : certaines propriétés (`color`, `font-family`, `line-height`, `font-size`…) passent du parent aux enfants sans qu'on les redéclare ; d'autres (`padding`, `border`, `background`, `margin`) non. Les mots-clés `inherit`, `initial`, `unset`, `revert` forcent le comportement :

```css
.family-card { color: var(--color-text); }
.family-card a { color: inherit; }   /* le lien reprend la couleur du parent */
```

> Avec Tailwind (module 02), la spécificité devient un souci mineur : on empile des classes utilitaires de même poids `(0,1,0)`, et l'ordre + `twMerge` gèrent les conflits. Mais comprendre la cascade reste indispensable pour déboguer un override qui « ne prend pas ».

### 2.3 Flexbox vs Grid — quelle dimension ?

Règle unique : **Flexbox = 1 axe, Grid = 2 axes**.

- **Flexbox** distribue des éléments sur **une** direction (ligne *ou* colonne). Idéal pour aligner le contenu *à l'intérieur* d'un composant : une barre de navigation, un bouton « icône + texte », centrer verticalement, répartir avec `gap`.
- **Grid** place des éléments sur **deux** directions simultanément (lignes *et* colonnes). Idéal pour la structure : layout de page, grille de cartes, zones nommées d'un dashboard.

Heuristique : *« je pense en lignes ET colonnes → Grid ; je pense en une seule direction → Flex ».*

```css
/* Flex — aligner le contenu D'UNE carte sur un axe */
.family-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

/* Grid — disposer LES cartes en grille responsive auto-remplie */
.family-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-lg);
}
```

`repeat(auto-fill, minmax(260px, 1fr))` crée autant de colonnes de ≥ 260px que la largeur le permet, chacune s'étirant à parts égales — une grille responsive **sans media query**. Grid gère aussi les zones nommées pour un layout applicatif :

```css
.app-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100vh;
}
.app-shell__sidebar { grid-area: sidebar; }
.app-shell__header  { grid-area: header; }
.app-shell__main    { grid-area: main; }
```

Les deux se combinent : Grid pour la structure de page, Flex pour l'intérieur de chaque cellule.

### 2.4 Container queries — répondre au conteneur, pas au viewport

Une media query (`@media`) réagit à la taille du **viewport**. Problème : la même carte famille peut vivre en pleine largeur *ou* dans une sidebar étroite — le viewport est identique, mais l'espace réel diffère. Les **container queries** (`@container`) réagissent à la taille du **conteneur parent**, ce qui rend un composant vraiment autonome.

Deux étapes : déclarer un conteneur, puis l'interroger.

```css
/* 1. Le parent devient un conteneur mesurable sur son axe inline (largeur) */
.family-grid {
  container-type: inline-size;
  container-name: grid;
}

/* 2. La carte s'adapte à l'espace de SON conteneur, où qu'elle soit placée */
.family-card {
  display: block;
}
@container grid (min-width: 400px) {
  .family-card {
    display: flex;         /* passe en ligne quand le conteneur est large */
    align-items: center;
    gap: var(--space-md);
  }
}
```

Unités de conteneur : `cqi` (1% de l'inline-size du conteneur), `cqb` (block-size). Standard largement supporté par les navigateurs modernes ; c'est aujourd'hui la façon par défaut de rendre des **composants** responsive (le viewport ne renseigne que le layout de page).

### 2.5 Logical properties — mise en page indépendante de la direction

Les propriétés physiques (`left`, `right`, `top`, `bottom`, `margin-left`…) sont figées à l'orientation visuelle. Les **logical properties** s'expriment par rapport au **flux** du texte : `inline` (sens de lecture) et `block` (sens d'empilement). En français/anglais (LTR) `inline-start` = gauche ; en arabe/hébreu (RTL) `inline-start` = droite — le CSS s'inverse tout seul.

```css
/* Physique — casse en RTL */
.family-card { margin-left: var(--space-md); padding-right: var(--space-sm); }

/* Logique — suit le sens de lecture, i18n-ready */
.family-card {
  margin-inline-start: var(--space-md);
  padding-inline-end: var(--space-sm);
  border-block-end: 1px solid var(--color-primary);
}
```

Correspondances utiles : `margin-inline` (gauche+droite en LTR), `margin-block` (haut+bas), `inset-inline-start` (≈ `left`), `padding-block`. Réflexe design system : préférer les logiques, l'internationalisation devient gratuite.

### 2.6 `:has()` — le « sélecteur parent »

`:has()` sélectionne un élément **d'après son contenu ou son état**. Historiquement impossible en CSS (on ne pouvait cibler que vers le bas). Désormais on style un parent selon ses enfants, sans JavaScript.

```css
/* Une carte qui CONTIENT un badge "premium" reçoit une bordure accent */
.family-card:has(.badge--premium) {
  border: 2px solid var(--color-accent);
}

/* Un champ dont l'input est invalide passe son label en rouge */
.field:has(input:invalid) label {
  color: #b00020;
}
```

Puissant pour l'UI état-dépendante (formulaires, cartes sélectionnées, groupes) — combiné à `:not()`, `:checked`, etc.

### 2.7 `clamp()` — le fluid design en une ligne

`clamp(MIN, PRÉFÉRÉ, MAX)` renvoie la valeur préférée bornée entre un minimum et un maximum. Avec une unité viewport dans la valeur préférée, on obtient une typographie/un espacement **fluides** — qui grandissent en continu entre deux écrans, sans paliers de media queries.

```css
:root {
  /* Titre : jamais < 1.5rem, jamais > 2.5rem, fluide entre les deux */
  --font-size-title: clamp(1.5rem, 1rem + 2.5vw, 2.5rem);
}
.family-card__title {
  font-family: var(--font-heading);
  font-size: var(--font-size-title);
}
```

Le `MIN` protège la lisibilité (plancher RGAA), le `MAX` évite le titre géant sur écran large, le terme `vw` assure la progression douce. Même principe pour un padding fluide : `padding: clamp(1rem, 3vw, 2rem)`.

---

## 3. Worked examples

### Exemple 1 — Poser les tokens TribuZen et la carte famille (Flex + Grid + clamp)

Reprise du cas concret, résolu de bout en bout : tokens, une carte en Flex, une grille de cartes en Grid, un titre fluide.

```css
/* ─── tokens.css — source de vérité unique ───────────────────────── */
:root {
  --color-primary: #6B7E6B;
  --color-accent:  #C4785A;
  --color-surface: #F8F5F0;
  --color-text:    #2C2C2C;

  --font-heading: 'Fraunces', serif;
  --font-body: 'Inter', sans-serif;
  --font-size-base: 1rem;                          /* plancher RGAA */
  --font-size-title: clamp(1.25rem, 1rem + 1.8vw, 2rem);
  --line-height-base: 1.6;

  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --radius-md: 0.75rem;
}

body {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-text);
}

/* ─── family.css — layout des cartes ─────────────────────────────── */

/* Grille responsive SANS media query + conteneur pour les container queries */
.family-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-lg);
  container-type: inline-size;
  container-name: grid;
}

/* Carte : surface + espacement en tokens, propriétés logiques (i18n-ready) */
.family-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding-block: var(--space-md);
  padding-inline: var(--space-md);
}

/* En-tête : Flex 1 axe — avatar + titre alignés */
.family-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.family-card__title {
  font-family: var(--font-heading);
  font-size: var(--font-size-title);       /* fluide via clamp() */
  color: var(--color-primary);
  margin: 0;
}

/* Quand le conteneur est large, la carte passe en disposition horizontale */
@container grid (min-width: 380px) {
  .family-card__body {
    display: flex;
    gap: var(--space-md);
    align-items: center;
  }
}

/* :has() — une carte contenant un badge "premium" reçoit l'accent terracotta */
.family-card:has(.badge--premium) {
  border-color: var(--color-accent);
  border-width: 2px;
}
```

```html
<!-- démo — trois cartes dans la grille -->
<section class="family-grid">
  <article class="family-card">
    <header class="family-card__header">
      <img src="/avatars/dupont.jpg" alt="" width="40" height="40" />
      <h2 class="family-card__title">Les Dupont</h2>
    </header>
    <div class="family-card__body">
      <p>4 membres · prochaine routine dans 2 h</p>
    </div>
  </article>

  <article class="family-card">
    <header class="family-card__header">
      <img src="/avatars/martin.jpg" alt="" width="40" height="40" />
      <h2 class="family-card__title">Les Martin</h2>
      <span class="badge badge--premium">Premium</span>
    </header>
    <div class="family-card__body">
      <p>3 membres · 12 routines cette semaine</p>
    </div>
  </article>
</section>
```

**Ce que ça apporte :** une seule source de vérité (`tokens.css`) ; changer `--color-primary` met à jour toutes les cartes ; la grille est responsive sans media query ; le titre est fluide et ne descend jamais sous le plancher RGAA ; la carte Martin se distingue automatiquement grâce à `:has()`, sans JS.

### Exemple 2 — Résoudre un conflit de spécificité qui « ne prend pas »

Un bug fréquent : « j'ai ajouté ma couleur mais elle est ignorée ». Diagnostic par la spécificité.

```css
/* Feuille A (design system) */
#app .family-card__title { color: #6B7E6B; }   /* (1, 1, 1) */

/* Feuille B (ta correction, chargée APRÈS) */
.family-card__title { color: #C4785A; }        /* (0, 1, 1) */
```

Le titre reste sauge malgré ta règle terracotta chargée après. Pourquoi ? `(1,1,1)` bat `(0,1,1)` : l'ID dans la règle A pèse plus lourd que l'ordre source. L'ordre ne départage **qu'à spécificité égale**.

**Mauvaise solution** — surenchérir avec `!important` : ça masque la dette et casse la cascade pour la suite.

**Bonne solution** — aligner ou baisser la spécificité de la règle A (retirer l'ID inutile), ou, si on ne peut pas la toucher, égaler sa spécificité :

```css
/* On égale (1,1,1) sans ID, via une double classe — puis l'ordre tranche */
.family-card__title.family-card__title { color: #C4785A; }  /* (0, 2, 1) → gagne proprement */
```

Le vrai remède long terme : **ne pas utiliser d'ID pour styler**. Une architecture à classes plates (BEM, utilitaires Tailwind) maintient toute la feuille à `(0,1,0)` / `(0,2,0)`, et l'ordre source suffit à raisonner.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Croire que les variables CSS sont comme les variables Sass

```scss
/* Sass — résolu à la COMPILATION, figé dans le CSS produit */
$color: #6B7E6B;
.card { color: $color; }   /* devient color: #6B7E6B; en dur */
```

```css
/* Custom property — vit au RUNTIME, héritée, surchargeable, réactive au thème */
:root { --color: #6B7E6B; }
.card { color: var(--color); }   /* change si --color change dans .card, en dark mode, en JS… */
```

**Correct :** une custom property cascade et se recalcule à chaud ; une variable Sass n'existe plus après le build. C'est précisément le runtime qui permet le thème sombre et les overrides locaux.

### PIÈGE #2 — Choisir Flexbox pour une grille 2D

```css
/* ❌ Flex-wrap pour une grille de cartes — alignement colonne fragile */
.family-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; }
.family-card { flex: 1 1 260px; }
/* Les dernières cartes s'étirent bizarrement, les colonnes ne s'alignent pas verticalement */

/* ✅ Grid — vraies colonnes alignées, auto-remplies */
.family-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
```

**Règle :** dès qu'on veut un alignement sur lignes ET colonnes, c'est Grid. Flex-wrap simule une grille mais ne garantit pas l'alignement 2D.

### PIÈGE #3 — Confondre container query et media query

```css
/* ❌ Media query : réagit au viewport, pas à l'espace réel du composant */
@media (min-width: 400px) { .family-card { display: flex; } }
/* Dans une sidebar de 300px sur un écran de 1400px, la carte passe en flex À TORT */

/* ✅ Container query : réagit à la largeur du conteneur parent */
.family-grid { container-type: inline-size; }
@container (min-width: 400px) { .family-card { display: flex; } }
```

**Règle :** viewport → layout de page (`@media`) ; espace d'un composant → `@container`. Oublier `container-type` sur le parent rend `@container` silencieusement inopérant.

### PIÈGE #4 — Recourir à `!important` pour gagner un conflit

```css
/* ❌ On écrase à coups de !important — dette qui se propage */
.family-card__title { color: #C4785A !important; }
/* La prochaine règle devra AUSSI mettre !important, et ainsi de suite */

/* ✅ Diagnostiquer la spécificité et l'aligner (retirer l'ID adverse, égaler le poids) */
.family-card__title.family-card__title { color: #C4785A; }
```

**Règle :** `!important` ne corrige pas la cause (une spécificité trop haute quelque part), il la cache. Réserver aux cas extrêmes (surcharge d'un CSS tiers non modifiable).

### PIÈGE #5 — Fixer `font-size` en px sous le plancher de lisibilité

```css
/* ❌ 13px en dur — sous le plancher RGAA, non fluide, ignore les préférences user */
.family-card__meta { font-size: 13px; }

/* ✅ rem + clamp — respecte le zoom navigateur et borne la fluidité */
.family-card__meta { font-size: clamp(0.875rem, 0.8rem + 0.3vw, 1rem); }
```

**Règle :** typographier en `rem` (suit la préférence utilisateur), garder `--font-size-base: 1rem` comme plancher, et fluidifier avec `clamp()` plutôt que des paliers px.

---

## 5. Ancrage TribuZen

Ce module pose la **couche 0** du design system TribuZen : le socle CSS natif sur lequel s'appuieront Tailwind (module 02), Radix/shadcn (03-04) et les tokens industrialisés (05).

**`tokens.css`** (`src/styles/tokens.css`) — déclare sur `:root` toutes les valeurs de marque : `--color-primary` (sauge), `--color-accent` (terracotta), `--color-surface` (sable), `--color-text` (encre), les typos Fraunces/Inter, `--font-size-base: 1rem` (plancher RGAA), l'échelle d'espacement et de rayons. C'est la source de vérité unique, importée en tête de l'app. Le module 05 générera ce fichier depuis un JSON de tokens ; ici on l'écrit à la main pour comprendre le mécanisme sous-jacent.

**`FamilyCard`** (`src/components/family/FamilyCard.tsx` + styles) — la carte de tribu affichée dans la grille du dashboard. En-tête en **Flex** (avatar + nom), grille de cartes en **Grid** auto-remplie, titre en **`clamp()`**, propriétés **logiques** pour l'i18n future, et **`:has()`** pour surligner les familles « premium » sans JS.

**`AppShell`** (`src/components/layout/AppShell.tsx` + styles) — la coquille applicative en **Grid** à zones nommées (`sidebar` / `header` / `main`), reprise à l'identique de la section 2.3.

**Thème sombre** — piloté par `prefers-color-scheme` qui redéfinit `--color-surface` et `--color-text` sur `:root` : tous les composants en `var()` basculent sans une seule règle dupliquée.

Fichiers cibles dans `smaurier/tribuzen` :
```
tribuzen/src/
  styles/
    tokens.css        ← custom properties de marque (source de vérité)
    globals.css       ← reset + body en tokens
  components/
    layout/
      AppShell.tsx     ← Grid à zones nommées
    family/
      FamilyCard.tsx   ← Flex + Grid + clamp + :has()
      FamilyGrid.tsx   ← grille auto-fill + container-type
```

---

## 6. Points clés

1. Une custom property (`--x` / `var(--x)`) est une variable **runtime** : elle hérite, cascade, se surcharge localement et réagit au thème — c'est la base native d'un design token.
2. La spécificité se lit en triplet `(ID, classes, types)` ; à égalité, le dernier déclaré gagne ; `style` inline et `!important` cassent la cascade et sont à éviter.
3. L'héritage (color, font…) est distinct de la cascade ; `inherit`/`initial`/`unset`/`revert` le contrôlent.
4. Flexbox = 1 axe (contenu d'un composant) ; Grid = 2 axes (structure de page, grille de cartes). `repeat(auto-fill, minmax(...))` = grille responsive sans media query.
5. `@container` réagit au conteneur parent (composant autonome), `@media` au viewport (layout de page) ; il faut `container-type` sur le parent.
6. Les logical properties (`margin-inline`, `padding-block`, `inset-inline-start`) rendent la mise en page indépendante de la direction — i18n gratuite.
7. `:has()` style un parent selon son contenu/état, sans JS ; `clamp(MIN, PRÉFÉRÉ, MAX)` fluidifie une valeur en la bornant (plancher RGAA + max écran large).

---

## 7. Seeds Anki

```
Quelle différence fondamentale entre une variable Sass et une custom property CSS ?|La variable Sass est résolue à la compilation et figée dans le CSS produit. La custom property (--x / var(--x)) vit au runtime : elle hérite, cascade, se surcharge localement et réagit au thème ou au JS.
Comment se lit la spécificité d'un sélecteur et qui gagne à égalité ?|En triplet (nombre d'ID, nombre de classes/attributs/pseudo-classes, nombre de types/pseudo-éléments), comparé de gauche à droite. À spécificité égale, la dernière règle déclarée (ordre source) l'emporte.
Flexbox ou Grid, comment choisir ?|Flexbox pour une distribution sur UN seul axe (contenu d'un composant, barre de nav, centrage). Grid pour un placement sur DEUX axes (layout de page, grille de cartes, zones nommées). Penser lignes ET colonnes → Grid.
Quelle est la différence entre @container et @media ?|@media réagit à la taille du viewport (layout de page). @container réagit à la taille du conteneur parent (composant autonome), à condition d'avoir déclaré container-type sur ce parent. Même composant dans une sidebar étroite, seul @container s'adapte correctement.
À quoi servent les logical properties comme margin-inline-start ?|À exprimer la mise en page par rapport au flux du texte (inline = sens de lecture, block = empilement) plutôt qu'à l'orientation physique. Le CSS s'inverse automatiquement en RTL, l'internationalisation devient gratuite.
Que fait le sélecteur :has() et pourquoi est-il notable ?|Il sélectionne un élément d'après son contenu ou son état (ex. .card:has(.badge--premium)). C'est le premier moyen CSS de styler un parent selon ses enfants, sans JavaScript.
Comment fonctionne clamp(MIN, PRÉFÉRÉ, MAX) et à quoi sert-il ?|Il renvoie la valeur PRÉFÉRÉE bornée entre MIN et MAX. Avec une unité vw dans le terme préféré, on obtient une taille fluide continue : le MIN protège la lisibilité (plancher RGAA), le MAX évite le débordement sur grand écran.
Comment créer une grille de cartes responsive sans aucune media query ?|display: grid + grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)). Le navigateur crée autant de colonnes de largeur ≥ 260px que possible, chacune s'étirant à parts égales.
```

---

## Pont vers le lab

> Lab associé : `21-design-system/labs/lab-01-css-fondamentaux/README.md`. Poser les tokens TribuZen en custom properties, puis construire la grille de cartes famille en Grid + Flex, avec container query, `clamp()` et `:has()` — corrigé complet et variante J+30 inclus.
