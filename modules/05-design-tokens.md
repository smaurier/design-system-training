---
titre: Design tokens — la source unique de vérité
cours: 21-design-system
notions: [design token, trois niveaux primitives-sémantiques-composant, conventions de nommage, tokens couleur, tokens espacement, tokens typographie, tokens rayon, tokens ombre, tokens durée, format W3C Design Tokens JSON, theming clair-sombre, theming multi-marques, du token au code CSS-Tailwind-JS, pipeline Style Dictionary, cohérence multi-plateforme]
outcomes: [structurer un système de tokens en trois niveaux, nommer des tokens sémantiques indépendants de la valeur, produire une source unique consommable en CSS/Tailwind/JS, décliner un thème clair/sombre par override de tokens]
prerequis: [04-shadcn-ui]
next: 06-framer-motion
libs: []
tribuzen: "système de tokens TribuZen (primitives sauge/terracotta -> sémantiques -> tokens composant), thème clair/sombre, source unique web + mobile"
last-reviewed: 2026-07
---

# Design tokens — la source unique de vérité

> **Outcomes — tu sauras FAIRE :** structurer un système de tokens en trois niveaux, nommer des tokens sémantiques indépendants de leur valeur, produire une source unique consommable en CSS/Tailwind/JS, décliner un thème clair/sombre par simple override.
> **Difficulté :** :star::star::star:

## 1. Cas concret d'abord

Tu reprends le front TribuZen. Le designer vient de changer la couleur primaire : le sauge `#6B7E6B` devient un sauge plus profond `#5A6F5A`. Tu ouvres le code et tu trouves ça, éparpillé sur 40 fichiers :

```tsx
// Un peu partout dans le codebase — la valeur brute copiée-collée
<button className="bg-[#6B7E6B] hover:bg-[#5C6E5C]">Valider</button>
<div style={{ borderColor: '#6B7E6B' }} />
<span className="text-[#6B7E6B]">Routine active</span>
// ...et 200 autres occurrences de #6B7E6B, parfois écrites #6b7e6b, parfois rgb(107,126,107)
```

**Trois problèmes immédiats :**
1. Le changement de couleur = un chercher-remplacer fragile sur 3 orthographes différentes de la même couleur. Tu vas en oublier.
2. `#6B7E6B` ne dit **rien** : est-ce la couleur d'action ? de marque ? de bordure ? Le sens est perdu.
3. Le thème sombre est impossible : tu ne peux pas « inverser » une valeur codée en dur dans 200 endroits.

Ce que tu voudrais, c'est écrire la couleur **une seule fois**, lui donner un **nom qui porte le sens**, et que tout le codebase pointe vers ce nom :

```tsx
// L'objectif de ce module
<button className="bg-primary hover:bg-primary/90">Valider</button>
// primary → défini UNE fois, changé UNE fois, thémable
```

Ce nom-valeur, c'est un **design token**. Ce module te donne le système complet pour les structurer.

---

## 2. Théorie complète, concise

### 2.1 Ce qu'est un design token

Un **design token** est la plus petite décision de design **nommée** : un identifiant stable associé à une valeur. C'est un couple `nom → valeur`.

```
Pas un token :  #6B7E6B                (une valeur anonyme)
Token :         color.primary = #6B7E6B  (un nom qui porte une décision)
```

Le token est la **source unique de vérité** (single source of truth) : la valeur existe à un seul endroit, tout le reste y **référence**. Trois bénéfices directs :

- **Changement en un point** : modifier la décision = éditer une ligne, pas 200 usages.
- **Sens explicite** : `color.danger` dit *ce que ça fait*, `#C4785A` dit seulement *quelle teinte*.
- **Thémabilité** : redéfinir les tokens (mode sombre, autre marque) sans toucher aux composants.

### 2.2 Les trois niveaux : primitives → sémantiques → composant

Un token unique ne suffit pas : `color.primary = #6B7E6B` mélange encore *la teinte* et *le rôle*. La maturité d'un design system tient à **trois niveaux** (aussi appelés tiers) :

| Niveau | Autre nom | Rôle | Exemple |
|--------|-----------|------|---------|
| 1. Primitives | global / base / référence | Le catalogue brut des valeurs. Ne référence rien. | `--sage-500: #6B7E6B` |
| 2. Sémantiques | alias / système | Donne un **rôle** à une primitive. Référence un primitif. | `--color-primary: var(--sage-500)` |
| 3. Composant | component-specific | Spécialise un sémantique pour **un composant**. Référence un sémantique. | `--btn-bg: var(--color-primary)` |

```css
/* Niveau 1 — PRIMITIVES : la palette brute, sans opinion d'usage */
:root {
  --sage-400:  #8A9A8A;
  --sage-500:  #6B7E6B;   /* la teinte de marque, nommée par la couleur */
  --sage-600:  #5A6F5A;
  --terracotta-500: #C4785A;
}

/* Niveau 2 — SÉMANTIQUES : le rôle, pointant vers un primitif */
:root {
  --color-primary:  var(--sage-500);       /* "l'action principale" */
  --color-primary-hover: var(--sage-600);
  --color-danger:   var(--terracotta-500); /* "le danger/alerte" */
  --color-surface:  #F8F5F0;
}

/* Niveau 3 — COMPOSANT : la spécialisation locale */
:root {
  --btn-bg:       var(--color-primary);
  --btn-bg-hover: var(--color-primary-hover);
}
```

**Pourquoi trois niveaux et pas un ?** Le flux de dépendance `composant → sémantique → primitive` isole chaque changement à son niveau :
- Changer la teinte de marque : on édite `--sage-500`, tout suit.
- Réaffecter un rôle (le danger devient une autre teinte) : on repointe `--color-danger`, les primitives ne bougent pas.
- Restyler un seul composant sans toucher au reste : on override `--btn-bg`.

> **Règle d'or : les composants ne consomment JAMAIS de primitives.** Un composant lit `--color-primary` ou `--btn-bg`, jamais `--sage-500`. Sinon on recrée le problème du cas concret, déguisé.

### 2.3 Conventions de nommage

Le nom d'un token suit une hiérarchie lisible, du général au spécifique. Format usuel : `catégorie-[rôle/concept]-[variante]-[état]`.

```
--color-primary            catégorie: color, rôle: primary
--color-primary-hover      + état: hover
--color-text-muted         catégorie: color, concept: text, variante: muted
--space-4                  catégorie: space, échelle: 4
--font-size-lg             catégorie: font-size, échelle: lg
--radius-md                catégorie: radius, échelle: md
```

Trois principes :
1. **Nommer par le rôle, pas par la valeur.** `--color-primary`, pas `--color-green`. Si demain le primaire devient bleu, le nom reste vrai.
2. **Ordre général → spécifique.** `color-text-muted` se trie et se lit mieux que `muted-text-color`.
3. **Échelles cohérentes.** Pour les valeurs graduées (espacement, taille), une échelle numérique (`1,2,3,4…`) ou en t-shirt (`sm, md, lg, xl`) — jamais les deux mélangées dans une même catégorie.

### 2.4 Les catégories de tokens

Un design system couvre bien plus que la couleur. Les catégories usuelles :

```css
:root {
  /* COULEUR — teintes de marque, surfaces, texte, états */
  --color-primary:   #6B7E6B;
  --color-surface:   #F8F5F0;
  --color-text:      #2C2C2C;
  --color-danger:    #C4785A;

  /* ESPACEMENT — échelle numérique, souvent base 4px */
  --space-1: 0.25rem;  /* 4px  */
  --space-2: 0.5rem;   /* 8px  */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */

  /* TYPOGRAPHIE — familles, tailles, graisses, interlignes */
  --font-body:      'Inter', system-ui, sans-serif;
  --font-heading:   'Fraunces', Georgia, serif;
  --font-size-base: 1rem;      /* 16px — plancher lisibilité */
  --font-size-lg:   1.125rem;
  --font-weight-semibold: 600;
  --line-height-base: 1.6;

  /* RAYON — arrondi des coins */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* OMBRE — élévation */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

  /* DURÉE / MOTION — timings d'animation (voir module 06) */
  --duration-fast:   150ms;
  --duration-base:   250ms;
  --easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
}
```

Ces catégories forment le vocabulaire complet du système : chaque décision visuelle a un token. La catégorie **durée/motion** fait le pont avec le module 06 (Framer Motion) — une animation cohérente réutilise `--duration-base` au lieu de nombres magiques.

### 2.5 Le tiers d'échange : W3C Design Tokens format (JSON)

Les CSS vars vivent dans le navigateur. Mais un token doit aussi alimenter iOS, Android, Figma, la doc… Il faut un format **neutre**, indépendant de la plateforme. Le **W3C Design Tokens Community Group** standardise un format JSON (fichiers `.tokens.json`).

```json
{
  "color": {
    "sage": {
      "500": { "$type": "color", "$value": "#6B7E6B" }
    },
    "primary": {
      "$type": "color",
      "$value": "{color.sage.500}"
    }
  },
  "space": {
    "4": { "$type": "dimension", "$value": "16px" }
  }
}
```

Points clés du format :
- Chaque token a un `$value` et un `$type` (`color`, `dimension`, `fontFamily`, `duration`…).
- Les **références** utilisent la syntaxe accolade `{color.sage.500}` — c'est ainsi qu'on exprime le lien sémantique → primitive dans le JSON.
- Ce fichier est la **source neutre** : on ne l'écrit pas à la main dans chaque plateforme, on le **transforme** (section 2.7).

### 2.6 Theming : clair/sombre et multi-marques

Le theming est la **raison d'être** des niveaux. Un thème = un jeu de valeurs alternatif pour les tokens **sémantiques**, les primitives et les composants restant tels quels dans leur logique.

```css
/* Thème clair — valeurs par défaut */
:root {
  --color-surface: #F8F5F0;   /* blanc chaud */
  --color-text:    #2C2C2C;   /* anthracite  */
  --color-primary: var(--sage-500);
}

/* Thème sombre — on REDÉFINIT seulement les sémantiques */
[data-theme="dark"] {
  --color-surface: #1A1A1A;
  --color-text:    #F0EDE6;
  --color-primary: var(--sage-400);  /* teinte plus claire pour tenir le contraste */
}
```

Le composant ne change pas d'une ligne : il lit toujours `var(--color-surface)`. Basculer le thème = changer l'attribut `data-theme` sur `<html>`. Même mécanique pour le **multi-marques** (white-label) : `[data-brand="ecole"]` redéfinit `--color-primary` vers une autre teinte, sans dupliquer un seul composant.

> **Ce qu'on override : les sémantiques et composants, pas les primitives.** Les primitives sont un catalogue stable ; le thème choisit *quel* primitif chaque rôle utilise. (En pratique le sombre peut aussi étendre le catalogue de primitives, mais la bascule se joue sur les sémantiques.)

### 2.7 Du token au code : trois cibles

Une même décision doit atterrir dans plusieurs syntaxes. Les trois cibles web courantes :

**a) CSS custom properties** — le socle runtime, thémable sans rebuild :
```css
:root { --color-primary: #6B7E6B; }
.btn { background: var(--color-primary); }
```

**b) Tailwind v4 via `@theme`** — Tailwind v4 lit les tokens directement en CSS et génère les utilitaires (`bg-primary`, `text-primary`…) :
```css
/* app.css — Tailwind v4 : plus de tailwind.config.js pour ça */
@import "tailwindcss";

@theme {
  --color-primary: #6B7E6B;   /* génère bg-primary, text-primary, border-primary… */
  --radius-lg:     0.75rem;    /* génère rounded-lg */
  --spacing-4:     1rem;
}
```
```tsx
// L'usage rêvé du cas concret, enfin possible :
<button className="bg-primary rounded-lg">Valider</button>
```

**c) JS/TS** — pour du style-in-JS, du canvas, ou React Native qui ne lit pas le CSS :
```ts
// tokens.ts — mêmes valeurs, consommables en logique
export const tokens = {
  color: { primary: '#6B7E6B', surface: '#F8F5F0' },
  space: { 4: 16 },
  radius: { lg: 12 },
} as const;
```

Le risque évident : **trois copies qui divergent**. D'où le pipeline.

### 2.8 Le pipeline : Style Dictionary (survol)

Écrire à la main CSS + Tailwind + TS, c'est réintroduire la duplication qu'on combat. La solution : **une source, plusieurs sorties générées**. **Style Dictionary** (Amazon) est l'outil de référence : il lit les fichiers `.tokens.json` (format W3C) et **transforme** vers autant de cibles que voulu.

```
                         ┌─→ build/tokens.css   (:root { --color-primary })
tokens.json  ──►  Style  ─┼─→ build/tokens.ts    (export const tokens)
(source W3C)     Dictionary├─→ build/theme.css    (@theme Tailwind)
                          └─→ build/tokens.swift  (iOS)  / .xml (Android)
```

Le principe (config déclarative, tu n'as pas à le mémoriser ici) :
```js
// style-dictionary.config.js — l'idée, pas à réciter
export default {
  source: ['tokens/**/*.tokens.json'],
  platforms: {
    css: { transformGroup: 'css', files: [{ destination: 'tokens.css', format: 'css/variables' }] },
    ts:  { transformGroup: 'js',  files: [{ destination: 'tokens.ts',  format: 'javascript/es6' }] },
  },
};
```
Un `npx style-dictionary build` régénère toutes les cibles. La décision reste **unique** dans le JSON ; les copies deviennent des **artefacts de build**, jamais éditées à la main.

### 2.9 Cohérence multi-plateforme (pont vers Tamagui, module 09)

Le web lit les CSS vars ; **React Native ne les lit pas**. Sans discipline, l'app mobile diverge du web. Deux stratégies :
- **Tokens en JS/TS partagés** (section 2.7c) : un seul objet `tokens` importé par le web *et* le natif.
- **Un moteur cross-platform** : **Tamagui** (module 09) définit les tokens une fois (`createTokens`) et les résout en CSS vars côté web *et* en styles natifs côté mobile.

```ts
// Aperçu Tamagui — approfondi au module 09
import { createTokens } from '@tamagui/core';

export const tokens = createTokens({
  color: { primary: '#6B7E6B', surface: '#F8F5F0' },
  radius: { lg: 12 },
  space:  { 4: 16 },
});
// $primary devient utilisable en web ET en React Native, même source
```

L'idée à retenir maintenant : **la source des tokens doit être neutre** (JSON W3C ou objet TS) pour que le web et le mobile n'aient jamais deux vérités.

---

## 3. Worked examples

### Exemple 1 — Construire le système TribuZen en trois niveaux

On part des couleurs de marque et on remonte jusqu'aux tokens composant, avec un thème sombre.

```css
/* ─── tokens.css ──────────────────────────────────────────────── */

/* NIVEAU 1 — PRIMITIVES : catalogue brut, nommé par la teinte */
:root {
  --sage-400:  #8A9A8A;
  --sage-500:  #6B7E6B;   /* sauge de marque */
  --sage-600:  #5A6F5A;
  --terracotta-400: #D08E72;
  --terracotta-500: #C4785A;   /* terracotta de marque */
  --terracotta-600: #A5613F;
  --cream-50:  #F8F5F0;   /* surface chaude */
  --ink-900:   #2C2C2C;   /* texte anthracite */
  --ink-100:   #F0EDE6;
}

/* NIVEAU 2 — SÉMANTIQUES : rôles, pointant vers des primitives */
:root {
  --color-primary:        var(--sage-500);
  --color-primary-hover:  var(--sage-600);
  --color-danger:         var(--terracotta-500);  /* jamais de rouge pur */
  --color-surface:        var(--cream-50);
  --color-text:           var(--ink-900);
}

/* NIVEAU 3 — COMPOSANT : spécialisation du bouton */
:root {
  --btn-bg:       var(--color-primary);
  --btn-bg-hover: var(--color-primary-hover);
  --btn-text:     var(--cream-50);
  --btn-radius:   var(--radius-lg, 0.75rem);
}

/* THÈME SOMBRE — on repointe UNIQUEMENT les sémantiques */
[data-theme="dark"] {
  --color-primary:       var(--sage-400);   /* plus clair → contraste tenu */
  --color-primary-hover: var(--sage-500);
  --color-surface:       #1A1A1A;
  --color-text:          var(--ink-100);
}

/* Le composant lit des tokens composant/sémantiques — jamais de primitive */
.btn {
  background: var(--btn-bg);
  color:      var(--btn-text);
  border-radius: var(--btn-radius);
  padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
}
.btn:hover { background: var(--btn-bg-hover); }
```

**Ce que ce système apporte :**
- Changer le sauge de marque : une ligne (`--sage-500`), tout suit — bouton, focus ring, texte primaire.
- Passer en sombre : un attribut `data-theme="dark"` sur `<html>`, aucun composant modifié.
- Le `.btn` ne connaît que `--btn-bg` : on peut restyler *ce seul bouton* sans risque de casser le reste.

### Exemple 2 — La même source en JSON W3C → CSS + Tailwind + TS

On exprime la décision une fois en JSON neutre, puis on montre les trois sorties qu'un pipeline génère.

```json
// tribuzen.tokens.json — LA source neutre (transformable par Style Dictionary)
{
  "color": {
    "sage":   { "500": { "$type": "color", "$value": "#6B7E6B" } },
    "primary":{ "$type": "color", "$value": "{color.sage.500}" },
    "surface":{ "$type": "color", "$value": "#F8F5F0" }
  },
  "radius": { "lg": { "$type": "dimension", "$value": "12px" } }
}
```

Sorties générées (jamais éditées à la main) :

```css
/* build/tokens.css — cible runtime web */
:root {
  --color-sage-500: #6B7E6B;
  --color-primary:  #6B7E6B;   /* la référence {color.sage.500} a été résolue */
  --color-surface:  #F8F5F0;
  --radius-lg:      12px;
}
```
```css
/* build/theme.css — cible Tailwind v4 */
@import "tailwindcss";
@theme {
  --color-primary: #6B7E6B;   /* → utilitaires bg-primary, text-primary… */
  --color-surface: #F8F5F0;
  --radius-lg:     0.75rem;
}
```
```ts
// build/tokens.ts — cible JS/TS (web style-in-JS + React Native)
export const tokens = {
  color: { sage500: '#6B7E6B', primary: '#6B7E6B', surface: '#F8F5F0' },
  radius: { lg: 12 },
} as const;
```

**Pourquoi c'est correct :** la valeur `#6B7E6B` et la référence `primary → sage.500` sont écrites **une seule fois**, dans le JSON. Les trois fichiers `build/` sont des artefacts régénérés par `style-dictionary build`. Web (CSS + Tailwind) et mobile (TS) partagent la même vérité — impossible de diverger.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Nommer un token par sa valeur, pas par son rôle

```css
/* ❌ Le nom décrit la teinte — il ment dès qu'on change la couleur */
--color-green: #6B7E6B;
.btn { background: var(--color-green); }
/* Demain le primaire devient bleu → soit --color-green: #3B82F6 (nom faux),
   soit on renomme partout (le problème qu'on voulait éviter). */

/* ✅ Le nom décrit le rôle — reste vrai quelle que soit la valeur */
--color-primary: #6B7E6B;
.btn { background: var(--color-primary); }
```

**Règle :** le nom d'un token sémantique décrit **ce à quoi il sert**, jamais **de quelle couleur il est**.

### PIÈGE #2 — Faire consommer une primitive par un composant

```css
/* ❌ Le composant saute le niveau sémantique */
.btn { background: var(--sage-500); }
/* Le thème sombre ne peut plus l'affecter : sage-500 est une valeur fixe.
   On a recréé le hardcoding, déguisé en variable. */

/* ✅ Le composant lit un sémantique (ou un token composant) */
.btn { background: var(--color-primary); }
/* [data-theme="dark"] repointe --color-primary → le bouton suit tout seul. */
```

**Signal d'alarme :** un `var(--sage-500)` (nom de primitive) dans un fichier de composant = un niveau sauté.

### PIÈGE #3 — Confondre « une CSS var » et « un design system »

Mettre `#6B7E6B` dans une variable ne fait pas un système. Une variable plate sans niveaux, sans sémantique, sans thème, ne résout que le chercher-remplacer. Le système, c'est la **structure à trois niveaux + les conventions de nommage + la source neutre**. La variable est le *moyen*, pas la fin.

### PIÈGE #4 — Écrire les tokens à la main dans chaque plateforme

```
❌ Trois fichiers maintenus en parallèle → divergence garantie
   tokens.css   : --color-primary: #6B7E6B
   tokens.ts    : primary: '#6B7E6C'   ← une faute de frappe, personne ne voit
   Colors.swift : primary = 0x6B7E6B

✅ Une source neutre → générée vers N cibles
   tribuzen.tokens.json  ──(style-dictionary build)──►  css / ts / swift / xml
```

Dès qu'il y a plus d'une plateforme, la source doit être **unique et transformée**, pas recopiée.

### PIÈGE #5 — Overrider des primitives pour faire le thème sombre

```css
/* ❌ On modifie le catalogue de base pour le sombre */
[data-theme="dark"] { --sage-500: #1A1A1A; }
/* Absurde : "sage-500" n'est plus du tout sauge. Toute référence à --sage-500
   ailleurs (bordures, hover) devient incohérente. */

/* ✅ On repointe le RÔLE, le catalogue reste stable */
[data-theme="dark"] { --color-surface: #1A1A1A; }
```

**Règle :** le thème choisit *quel primitif* chaque rôle utilise ; il ne réécrit pas les primitives.

---

## 5. Ancrage TribuZen

TribuZen a besoin d'une identité chaleureuse et **anti-anxiogène** (jamais de rouge pur pour les alertes) cohérente entre le web (Next.js) et le mobile (Expo/Tamagui, module 09). Les design tokens sont la couche qui garantit cette cohérence.

**Primitives** (`tokens/primitives.tokens.json`) — le catalogue de marque : sauge (`#6B7E6B` et déclinaisons), terracotta (`#C4785A`), crème (`#F8F5F0`), anthracite (`#2C2C2C`). Nommées par la teinte, jamais consommées directement par un composant.

**Sémantiques** (`tokens/semantic.tokens.json`) — les rôles : `--color-primary` (sauge, actions + focus ring), `--color-danger` (terracotta, **jamais de rouge** — décision produit anti-anxiété), `--color-surface` (crème), `--color-text` (anthracite). C'est ici que se joue le thème clair/sombre.

**Composant** (`tokens/component.tokens.json`) — `--btn-bg`, `--btn-bg-hover`, `--card-radius`, `--input-border` : chaque composant du design system TribuZen tire ses valeurs de la couche sémantique.

Ces trois fichiers sont la **source unique** ; Style Dictionary les transforme en `tokens.css` (Next.js + Tailwind v4 `@theme`) et `tokens.ts` (Tamagui côté Expo). Web et mobile ne peuvent pas diverger.

Fichiers cibles dans `smaurier/tribuzen` :
```
tribuzen/
  tokens/
    primitives.tokens.json     # niveau 1 — catalogue de marque
    semantic.tokens.json       # niveau 2 — rôles + thème clair/sombre
    component.tokens.json      # niveau 3 — tokens par composant
  style-dictionary.config.js   # source → cibles
  build/
    tokens.css                 # généré → importé par app web (Tailwind @theme)
    tokens.ts                  # généré → importé par Tamagui (module 09)
```

---

## 6. Points clés

1. Un design token est un couple `nom → valeur` : la source unique de vérité d'une décision de design.
2. Trois niveaux : primitives (catalogue brut) → sémantiques (rôles) → composant (spécialisation locale). Le flux de dépendance va du composant vers la primitive.
3. Un composant ne consomme jamais de primitive : il lit un sémantique ou un token composant — sinon le thème est impossible.
4. Nommer par le rôle (`color-primary`), jamais par la valeur (`color-green`).
5. Catégories à couvrir : couleur, espacement, typographie, rayon, ombre, durée/motion.
6. Le format W3C Design Tokens (JSON, `$type`/`$value`, références `{...}`) est la source **neutre**, indépendante de la plateforme.
7. Le theming (clair/sombre, multi-marques) se fait en overridant les tokens sémantiques ; les primitives restent stables.
8. Trois cibles web : CSS vars (runtime thémable), `@theme` Tailwind v4 (utilitaires), objet TS (style-in-JS + React Native).
9. Style Dictionary transforme une source unique JSON en N cibles générées — les copies deviennent des artefacts de build, jamais éditées à la main.
10. Pour la cohérence web + mobile, la source doit être neutre (JSON ou TS) ; Tamagui (module 09) résout les mêmes tokens en CSS vars et en styles natifs.

---

## 7. Seeds Anki

```
Qu'est-ce qu'un design token et quel problème résout-il ?|Un couple nom → valeur : la source unique de vérité d'une décision de design. La valeur existe à un seul endroit (changement en un point), le nom porte le sens, et le système devient thémable.
Quels sont les trois niveaux de tokens et leur rôle ?|Primitives (catalogue brut, ex --sage-500, ne référence rien), sémantiques (rôles, ex --color-primary → var(--sage-500)), composant (spécialisation locale, ex --btn-bg → var(--color-primary)). Dépendance : composant → sémantique → primitive.
Pourquoi un composant ne doit-il jamais consommer une primitive directement ?|Parce qu'une primitive est une valeur fixe : le thème (sombre, marque) override les sémantiques. Lire --sage-500 dans un composant recrée le hardcoding et rend le thème impossible ; il faut lire --color-primary.
Nommer par le rôle ou par la valeur ? Pourquoi ?|Par le rôle (--color-primary), jamais par la valeur (--color-green). Le nom-rôle reste vrai même si la couleur change ; le nom-valeur devient un mensonge ou force un renommage global.
Quelles catégories de tokens un design system doit-il couvrir ?|Couleur, espacement (échelle base 4px), typographie (familles/tailles/graisses/interlignes), rayon, ombre (élévation) et durée/motion (timings d'animation).
À quoi sert le format W3C Design Tokens (JSON) ?|C'est une source neutre, indépendante de la plateforme : chaque token a un $type et un $value, les liens sémantique→primitive s'expriment par référence {color.sage.500}. Un pipeline le transforme vers CSS, TS, Swift, XML.
Comment implémente-t-on un thème sombre avec des tokens ?|En redéfinissant uniquement les tokens sémantiques dans un sélecteur de thème ([data-theme="dark"]) — ex --color-surface: #1A1A1A. Les composants lisent var(--color-surface) et suivent sans être modifiés. On n'override pas les primitives.
Quelles sont les trois cibles web d'un token et comment éviter qu'elles divergent ?|CSS custom properties (runtime thémable), @theme Tailwind v4 (génère bg-primary…), objet TS (style-in-JS + React Native). Pour éviter la divergence : une source neutre unique (JSON W3C) transformée par Style Dictionary en artefacts de build.
Que fait Style Dictionary dans un pipeline de tokens ?|Il lit une source unique (fichiers .tokens.json au format W3C) et la transforme en plusieurs cibles générées (css, ts, swift, xml). Les copies par plateforme deviennent des artefacts de build régénérés, jamais édités à la main.
```

---

## Pont vers le lab

> Lab associé : `21-design-system/labs/lab-05-design-tokens/README.md`. Construire le système de tokens TribuZen en trois niveaux (primitives → sémantiques → composant), l'exposer en CSS vars + `@theme` Tailwind, et brancher un thème clair/sombre par override — corrigé complet inline.
