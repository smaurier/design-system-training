# Module 01 — CSS fondamentaux solides

| Difficulté | Durée estimée |
|------------|---------------|
| 2/5        | 60 min        |

> **Prérequis** : Connaître HTML. Ce module consolide les bases CSS qui conditionnent tout le reste du cours.

## Objectifs

- Maîtriser Custom Properties (variables CSS — base des design tokens)
- Comprendre la cascade, la spécificité, l'héritage
- Flexbox + Grid : savoir choisir lequel utiliser
- Container queries : nouveau standard, indispensable

---

## Custom Properties (variables CSS)

```css
/* Déclarer dans :root = disponible partout */
:root {
  --color-primary: #6B7E6B;
  --color-accent: #C4785A;
  --color-surface: #F8F5F0;
  --color-text: #2C2C2C;

  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;

  --font-heading: 'Fraunces', serif;
  --font-body: 'Inter', sans-serif;
  --font-size-base: 1rem;         /* 16px minimum — règle RGAA */
  --line-height-base: 1.6;
}

/* Usage */
.routine-card {
  background-color: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  font-family: var(--font-body);
}

/* Override local — sans affecter le global */
.routine-card.highlighted {
  --color-surface: #EAF0EA; /* Override local uniquement */
  background-color: var(--color-surface);
}
```

**Thème sombre avec Custom Properties :**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #1A1A1A;
    --color-text: #F0EDE8;
    /* Les composants utilisent var() → changent automatiquement */
  }
}
```

---

## Cascade et spécificité

```
Ordre de priorité (du plus fort au plus faible) :
  1. !important (à éviter — brise la cascade)
  2. Attribut style="" inline
  3. ID    → spécificité (1, 0, 0)
  4. Class → spécificité (0, 1, 0)
  5. Tag   → spécificité (0, 0, 1)

Calcul :
  #nav .menu li a    → (1,1,2) = 112
  .menu a            → (0,1,1) = 11
  → #nav .menu li a gagne

Avec Tailwind/shadcn → spécificité devient moins importante
car on utilise des classes utilitaires directes.
La fonction cn() + twMerge gère les conflits.
```

---

## Flexbox vs Grid : quand choisir

```
FLEXBOX = distribution sur un axe (ligne OU colonne)
  → Navigation horizontale
  → Centrage vertical d'un élément
  → Liste d'items avec espacement variable
  → Composants (bouton avec icône + texte)

GRID = placement sur deux axes (lignes ET colonnes)
  → Layout de page entière
  → Grille de cards
  → Dashboard avec zones nommées
  → Alignements complexes en 2D

Règle simple : si tu penses en lignes ET colonnes → Grid.
               Si tu penses en une seule direction → Flex.
```

```css
/* Flex — centrage classique */
.button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Grid — layout TribuZen dashboard */
.dashboard {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100vh;
}

.sidebar { grid-area: sidebar; }
.header  { grid-area: header; }
.main    { grid-area: main; }
```

---

## Container Queries (2023+)

Media queries = basées sur la taille du VIEWPORT. Container queries = basées sur la taille du CONTENEUR PARENT.

```css
/* Avant : media query → problème si le composant est dans une sidebar étroite */
@media (min-width: 768px) {
  .routine-card { display: flex; }
}

/* Container query → répond à l'espace disponible dans son conteneur */
.cards-container {
  container-type: inline-size;
  container-name: cards;
}

@container cards (min-width: 400px) {
  .routine-card {
    display: flex;
    flex-direction: row;
  }
}
```

---

## Checklist

- [ ] Je définis les tokens TribuZen en Custom Properties dans `:root`
- [ ] Je comprends la cascade et je calcule la spécificité sans hésiter
- [ ] Je choisis Flex ou Grid selon la direction du layout (1D vs 2D)
- [ ] J'utilise les Container Queries pour des composants responsive
- [ ] `prefers-color-scheme` + CSS variables = thème sombre automatique
