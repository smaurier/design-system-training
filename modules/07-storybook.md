---
titre: Storybook — documenter le design system en isolation
cours: 21-design-system
notions: [Storybook comme atelier de composants isolés, Component Story Format 3 (Meta + StoryObj), args et argTypes, controls, autodocs, addon a11y (axe), play function et addon interactions, addon viewport, catalogue vivant du design system, visual testing avec Chromatic (survol)]
outcomes: [écrire des stories CSF3 pour un composant avec args et argTypes, générer une doc autodocs et piloter les variants via controls, valider le contraste RGAA d'un composant avec l'addon a11y]
prerequis: [06-framer-motion]
next: 08-accessibilite
libs: [{ name: react, version: "^19" }, { name: storybook, version: "^8" }]
tribuzen: catalogue Storybook du design system TribuZen — stories du PrimaryButton et de la RoutineCard, addon a11y pour valider le contraste des tokens
last-reviewed: 2026-07
---

# Storybook — documenter le design system en isolation

> **Outcomes — tu sauras FAIRE :** écrire des stories CSF3 (Component Story Format) avec `args`/`argTypes`, générer une documentation autodocs pilotable via controls, valider le contraste RGAA d'un composant avec l'addon a11y.
> **Difficulté :** :star::star:

> **Note versions (vérifié Context7, Storybook 8.6) :** ce module cible **Storybook 8** (`Meta`/`StoryObj` importés de `@storybook/react`, utilitaires de test dans `@storybook/test`). Storybook 9 consolide les packages : les addons `a11y`, `interactions`, `viewport` intègrent le cœur et `@storybook/test` devient `storybook/test`. L'API CSF3 elle-même (Meta + StoryObj + args) est **identique** entre 8 et 9. Les évolutions v9 sont signalées en encadré au fil du module.

## 1. Cas concret d'abord

Le design system TribuZen a maintenant un `PrimaryButton` avec 3 variants (`primary`, `secondary`, `danger`), 3 tailles (`sm`, `md`, `lg`) et des états (`disabled`, `loading`). Soit **27+ combinaisons**. Aujourd'hui, pour voir le bouton `danger` en taille `lg` désactivé, tu dois :

1. Trouver une page de l'app qui l'utilise (ou en bricoler une),
2. Lancer tout le back + le front,
3. Reproduire l'état métier qui déclenche ce cas,
4. Espérer qu'aucune autre feature ne casse pendant que tu regardes.

Et quand la designeuse demande « montre-moi tous les états du bouton côte à côte pour valider les tokens de couleur », tu n'as… rien. Aucun catalogue. Chaque combinaison vit éparpillée dans l'app.

```tsx
// PrimaryButton.tsx — le composant existe, mais il n'est visible NULLE PART en isolation
interface PrimaryButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function PrimaryButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
}: PrimaryButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

**Storybook résout exactement ça** : un atelier qui rend chaque composant en isolation, une *story* par état, une doc auto-générée, des *controls* pour jouer les 27 combinaisons à la souris, et un addon qui passe axe sur chaque story pour valider le contraste RGAA. Ce module te donne CSF3 pour écrire ce catalogue.

---

## 2. Théorie complète, concise

### 2.1 Storybook = atelier de composants isolés

Storybook est un serveur de dev séparé (`localhost:6006`) qui monte **un seul composant à la fois**, hors de l'application. On l'installe sur un projet existant :

```bash
npx storybook@latest init
# détecte React/Vite, crée .storybook/main.ts + .storybook/preview.ts
# ajoute quelques *.stories.tsx d'exemple

npm run storybook   # ouvre http://localhost:6006
```

Le fichier `.storybook/main.ts` déclare où trouver les stories et quels addons charger :

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials', // controls + autodocs + viewport + actions
    '@storybook/addon-a11y',       // axe sur chaque story
    '@storybook/addon-interactions', // play functions
  ],
  framework: { name: '@storybook/react-vite', options: {} },
};

export default config;
```

> **Storybook 9 :** `addon-essentials` est démantelé — controls/actions/viewport/docs sont dans le cœur, plus besoin de les déclarer. On ne liste que les addons « extra » (`@storybook/addon-a11y`). Vérifie la version de ton projet avant de copier la config.

### 2.2 Component Story Format 3 (CSF3) — Meta + StoryObj

Une *story* décrit **un état d'un composant**. Le format CSF3 est déclaratif : un fichier `.stories.tsx` exporte un **`default` (le `Meta`)** qui décrit le composant, et **des exports nommés (les `StoryObj`)**, un par état.

```tsx
// PrimaryButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PrimaryButton } from './PrimaryButton';

// Meta = métadonnées du composant, partagées par toutes ses stories
const meta = {
  title: 'Design System/PrimaryButton', // chemin dans l'arbre de gauche
  component: PrimaryButton,
} satisfies Meta<typeof PrimaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Chaque export nommé = une story = un état rendu
export const Primary: Story = {
  args: { variant: 'primary', children: 'Valider' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Supprimer' },
};
```

Deux points de syntaxe :
- **`satisfies Meta<typeof PrimaryButton>`** au lieu de `: Meta<...>` : garde le type littéral du `meta` pour que `StoryObj<typeof meta>` connaisse les `args` autorisés. C'est le pattern CSF3 recommandé (typage strict des args par story).
- Le nom de l'export **est** le nom affiché de la story (`Primary`, `Danger`). Convention PascalCase.

> **CSF2 → CSF3 (discrimination) :** en CSF2, une story était une **fonction** `const Primary = (args) => <Button {...args} />`. En CSF3 c'est un **objet** `{ args }` — Storybook rend le composant pour toi. Plus court, moins de boilerplate. Tu croiseras encore du CSF2 en mission ; sache le lire.

### 2.3 args — les props de la story

`args` = les props passées au composant pour cette story. C'est le cœur de CSF3 : au lieu d'écrire du JSX, tu décris les entrées.

```tsx
export const Primary: Story = {
  args: { variant: 'primary', size: 'md', children: 'Valider' },
};

// Réutiliser les args d'une autre story par spread — pas de duplication
export const PrimaryLoading: Story = {
  args: { ...Primary.args, loading: true },
};

export const PrimaryDisabled: Story = {
  args: { ...Primary.args, disabled: true },
};
```

Les `args` sont **live-editables** dans le panneau Controls (voir 2.5). Changer un arg re-render la story instantanément, sans recharger.

### 2.4 argTypes — décrire et contraindre les args

`argTypes` documente chaque prop et **choisit son control** dans l'UI. Sans lui, Storybook infère un control basique ; avec lui, tu forces un `select`, un `radio`, un `color`, etc.

```tsx
const meta = {
  title: 'Design System/PrimaryButton',
  component: PrimaryButton,
  argTypes: {
    variant: {
      control: 'select', // menu déroulant
      options: ['primary', 'secondary', 'danger'],
      description: 'Rôle visuel du bouton dans le design system',
    },
    size: {
      control: 'radio', // boutons radio
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    onClick: { action: 'clicked' }, // logge les clics dans l'onglet Actions
  },
} satisfies Meta<typeof PrimaryButton>;
```

`argTypes` sert deux buts d'un coup : il **pilote les controls** (interaction) et il **remplit la table de props d'autodocs** (documentation). Une seule source de vérité.

### 2.5 controls — jouer les combinaisons à la souris

L'addon Controls (inclus dans essentials) transforme les `args` en formulaire interactif sous la story. La designeuse ouvre `PrimaryButton`, choisit `variant: danger`, `size: lg`, coche `disabled` — et voit le rendu exact, sans toucher au code. C'est **la fin des 27 stories manuelles** : tu écris quelques stories représentatives, et les controls couvrent le reste de l'espace d'états.

### 2.6 autodocs — la doc auto-générée

Le tag `autodocs` génère une page de documentation par composant : description, table des props (types, valeurs par défaut, descriptions issues d'`argTypes`), et un rendu de chaque story.

```tsx
const meta = {
  title: 'Design System/PrimaryButton',
  component: PrimaryButton,
  tags: ['autodocs'], // active la page Docs pour ce composant
} satisfies Meta<typeof PrimaryButton>;
```

On peut activer autodocs globalement dans `.storybook/preview.ts` (`tags: ['autodocs']`) ou par composant via le tag. La page Docs est ce qu'on partage aux designers et aux nouveaux devs : **un catalogue vivant**, toujours synchrone avec le code (elle EST le code).

### 2.7 addon a11y — axe sur chaque story

`@storybook/addon-a11y` fait tourner **axe-core** (le moteur d'audit accessibilité) sur la story rendue et affiche un onglet Accessibility : violations, avertissements, tests passés. Pour un design system, l'usage phare est **valider le contraste** des tokens de couleur (critère RGAA 3.2 / WCAG 1.4.3).

```tsx
// on peut configurer/désactiver des règles axe par story via parameters
export const Danger: Story = {
  args: { variant: 'danger', children: 'Supprimer' },
  parameters: {
    a11y: {
      // config axe ciblée ; ici on force la vérif du contraste
      config: { rules: [{ id: 'color-contrast', enabled: true }] },
    },
  },
};
```

Si le rouge `danger` sur fond blanc tombe sous 4.5:1, l'onglet a11y le signale en rouge **avant** que ça parte en prod. Le token est corrigé à la source.

> **Storybook 9 :** l'addon a11y peut faire échouer les tests (`test: 'error'`) et s'intègre au test runner. Le principe axe reste identique.

### 2.8 play function + addon interactions

Une `play` function s'exécute **après le rendu** de la story et simule des interactions utilisateur (clic, saisie) avec assertions. L'addon interactions les rejoue pas à pas, avec un débogueur visuel.

```tsx
import { expect, fn, userEvent, within } from '@storybook/test';

const meta = {
  title: 'Design System/PrimaryButton',
  component: PrimaryButton,
  args: { onClick: fn() }, // fn() = spy, on vérifie qu'il est appelé
} satisfies Meta<typeof PrimaryButton>;

export const ClicRepond: Story = {
  args: { children: 'Valider' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /valider/i }));
    await expect(args.onClick).toHaveBeenCalled();
  },
};
```

Attention : ce n'est **pas** un remplacement des tests unitaires métier. La `play` vérifie le comportement *du composant en isolation* (le bouton émet bien un clic, le champ se remplit). C'est du test d'interaction UI, colocalisé avec la story.

> **Storybook 9 :** importe depuis `storybook/test` (sans le `@`). L'API `userEvent`/`expect`/`fn`/`within` est la même.

### 2.9 addon viewport — tester les breakpoints

`viewport` (dans essentials) permet de rendre la story dans une taille d'écran donnée — utile pour un design system responsive.

```tsx
export const MobileFullWidth: Story = {
  args: { variant: 'primary', size: 'lg', children: 'Commencer' },
  parameters: {
    viewport: { defaultViewport: 'mobile1' }, // ~320px
  },
};
```

### 2.10 Chromatic — visual testing (survol)

Storybook rend chaque story de façon déterministe → chaque story est un **cas de test visuel** gratuit. **Chromatic** (édité par l'équipe Storybook) prend un snapshot cloud de chaque story, le compare au baseline, et signale toute différence de pixels en CI.

```bash
npx chromatic --project-token=<token>
# upload le Storybook, snapshot chaque story, diff vs baseline, review manuelle
```

Tu n'as **rien à écrire** : tes stories existantes sont les cas. C'est le gros ROI d'un design system storybooké — la régression visuelle (« le padding du bouton a bougé de 2px sur toute l'app ») est attrapée automatiquement. Détail approfondi hors périmètre ici ; retenir le principe : *stories = tests visuels*.

---

## 3. Worked examples

### Exemple 1 — Catalogue complet du PrimaryButton (TribuZen)

Objectif : couvrir variants, tailles, états en un fichier, avec controls, autodocs et vérif contraste.

```tsx
// src/components/ui/PrimaryButton/PrimaryButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { PrimaryButton } from './PrimaryButton';

const meta = {
  title: 'Design System/PrimaryButton',
  component: PrimaryButton,
  tags: ['autodocs'], // page Docs auto-générée
  args: {
    // args par défaut hérités par toutes les stories
    children: 'Valider',
    onClick: fn(), // spy — visible dans l'onglet Actions
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
      description: 'Rôle visuel dans le design system TribuZen',
    },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PrimaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Variants ──────────────────────────────────────────────
export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Annuler' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Supprimer la routine' },
  parameters: {
    // on force axe à vérifier le contraste du rouge danger sur fond blanc
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
};

// ── Tailles (spread des args de Primary, pas de duplication) ──
export const Small: Story = { args: { ...Primary.args, size: 'sm' } };
export const Large: Story = { args: { ...Primary.args, size: 'lg' } };

// ── États ─────────────────────────────────────────────────
export const Loading: Story = { args: { ...Primary.args, loading: true } };
export const Disabled: Story = { args: { ...Primary.args, disabled: true } };
```

Résultat dans Storybook : sous `Design System/PrimaryButton`, une page **Docs** (table des props + tous les états), puis 7 stories navigables. La designeuse ouvre `Danger`, l'onglet Accessibility affiche le ratio de contraste ; s'il est < 4.5:1, le token `--color-danger` est ajusté. Les controls laissent explorer les 27 combos sans écrire 27 stories.

### Exemple 2 — RoutineCard : args, argTypes select, viewport et play

La `RoutineCard` (carte d'une routine familiale) a un `status` à 4 valeurs et un bouton « Terminer ».

```tsx
// src/components/ui/RoutineCard/RoutineCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { RoutineCard } from './RoutineCard';

const meta = {
  title: 'Design System/RoutineCard',
  component: RoutineCard,
  tags: ['autodocs'],
  args: { onComplete: fn() },
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'inProgress', 'completed', 'skipped'],
      description: 'État de la routine dans le planning familial',
    },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof RoutineCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const base = {
  title: 'Bain du soir',
  time: '20:30',
  assignee: 'Maman',
};

export const Pending: Story = {
  args: { ...base, status: 'pending' },
};

export const Completed: Story = {
  args: { ...base, status: 'completed' },
};

// Cas famille monoparentale — pas d'assigné
export const NoAssignee: Story = {
  args: { title: 'Goûter', time: '16:00', status: 'pending' },
};

// Rendu mobile (le planning est surtout consulté au téléphone)
export const Mobile: Story = {
  args: { ...base, status: 'pending' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

// Interaction : cliquer "Terminer" appelle onComplete
export const ClicTerminer: Story = {
  args: { ...base, status: 'pending' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /terminer/i }));
    await expect(args.onComplete).toHaveBeenCalledOnce();
  },
};
```

Ici `argTypes.status` fait deux choses : un `select` dans les controls (jouer les 4 états à la souris) **et** documente les valeurs autorisées dans autodocs. La story `ClicTerminer` vérifie le contrat d'interaction de la carte, isolée du reste de l'app.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Croire que CSF3 story = fonction (confusion CSF2/CSF3)

```tsx
// ❌ Réflexe CSF2 : la story est une fonction render
export const Primary = (args) => <PrimaryButton {...args} />;

// ✅ CSF3 : la story est un OBJET, Storybook rend pour toi
export const Primary: Story = { args: { variant: 'primary', children: 'OK' } };
```

En CSF3 tu décris **des données** (`args`), pas du rendu. Storybook monte le `component` du meta avec ces args. Tu ne fournis un `render:` custom que dans les cas rares (composition de plusieurs composants dans une story).

### PIÈGE #2 — Confondre `args` et `argTypes`

```tsx
// ❌ Mettre les valeurs dans argTypes
argTypes: { variant: 'primary' }   // faux : variant n'est pas un control défini

// ✅ args = LES VALEURS ; argTypes = LA DESCRIPTION/LE CONTROL
args:     { variant: 'primary' },                                   // valeur rendue
argTypes: { variant: { control: 'select', options: ['primary','danger'] } }, // comment l'éditer
```

`args` répond à « avec quelles props je rends ? ». `argTypes` répond à « quel widget de control et quelle doc pour cette prop ? ». Deux rôles distincts.

### PIÈGE #3 — Prendre la `play` function pour un test unitaire métier

La `play` teste le composant **en isolation UI** (le bouton émet un clic, le champ accepte la saisie). Elle ne remplace **pas** les tests Vitest de la logique métier (calcul de streak, règles de récurrence). Signal d'alarme : une `play` qui mocke une API ou vérifie un calcul de dates → ce test appartient à Vitest, pas à une story.

### PIÈGE #4 — Story sans `title` cohérent → arbre illisible

```tsx
// ❌ titles incohérents → arborescence en vrac
title: 'Button'              // dans un fichier
title: 'components/btn'      // dans un autre

// ✅ convention stricte "Catégorie/Composant"
title: 'Design System/PrimaryButton'
title: 'Design System/RoutineCard'
```

Le `title` définit la position dans l'arbre de gauche. Sans convention, un design system de 40 composants devient inutilisable. Fixe la nomenclature (`Design System/…`, `Features/…`) dès la première story.

### PIÈGE #5 — Ignorer l'onglet a11y « parce que ça compile »

Un bouton qui **rend** parfaitement peut échouer axe (contraste insuffisant, `aria-label` manquant sur une icône seule). Storybook compile et affiche le bouton ; l'onglet Accessibility, lui, échoue en rouge. Sur un design system, un token de couleur non conforme se propage à **toute l'app** — d'où l'intérêt de le valider une fois, à la source, dans la story.

---

## 5. Ancrage TribuZen

Le design system TribuZen est catalogué dans Storybook — c'est la référence partagée entre Sylvain (dev) et la designeuse. Chaque composant `ui/` a son fichier `.stories.tsx` colocalisé.

**`PrimaryButton`** (`src/components/ui/PrimaryButton/PrimaryButton.stories.tsx`) — variants (`primary`/`secondary`/`danger`), tailles (`sm`/`md`/`lg`) et états (`loading`/`disabled`) pilotés par `args` + `argTypes`. La story `Danger` active la vérif de contraste axe : c'est là qu'on garantit que le rouge d'action destructive respecte le **RGAA 3.2 (contraste 4.5:1)** avant que le token parte dans toute l'app. Lien direct avec le module suivant, `08-accessibilite`.

**`RoutineCard`** (`src/components/ui/RoutineCard/RoutineCard.stories.tsx`) — les 4 `status` du planning familial via un `argTypes.status` en `select`, plus une story `Mobile` (viewport) car le planning est surtout consulté au téléphone, et une `play` qui vérifie le clic « Terminer ».

**Addon a11y = garde-fou des tokens** — sur un design system, valider le contraste story par story évite qu'un mauvais token contamine chaque écran. C'est le pont vers l'accessibilité (module 08).

Fichiers cibles dans `smaurier/tribuzen` :
```
tribuzen/
  .storybook/
    main.ts
    preview.ts
  src/components/ui/
    PrimaryButton/
      PrimaryButton.tsx
      PrimaryButton.stories.tsx
    RoutineCard/
      RoutineCard.tsx
      RoutineCard.stories.tsx
```

---

## 6. Points clés

1. Storybook est un atelier qui rend chaque composant **en isolation** (`localhost:6006`) — plus besoin de lancer toute l'app pour voir un état.
2. CSF3 : un fichier `.stories.tsx` exporte un `default` (le **`Meta`**) et des exports nommés (les **`StoryObj`**), un par état. Chaque story est un **objet** `{ args }`, pas une fonction.
3. `args` = les props rendues ; `argTypes` = la description + le choix du control (select, radio, boolean, color). Deux rôles distincts, une seule source de vérité pour controls + autodocs.
4. Le tag `autodocs` génère une **page de doc vivante** (table des props + rendu des stories), toujours synchrone avec le code.
5. Les **controls** couvrent l'espace des combinaisons à la souris — on écrit quelques stories représentatives, pas 27.
6. L'addon **a11y** passe axe sur chaque story ; usage phare pour un design system : valider le **contraste RGAA** des tokens à la source.
7. La **`play` function** teste l'interaction UI du composant isolé (clic, saisie) — pas la logique métier (ça reste dans Vitest).
8. Chaque story est un **cas de test visuel** gratuit ; **Chromatic** snapshot et diff les stories en CI, sans code de test à écrire.

---

## 7. Seeds Anki

```
En CSF3, qu'exporte un fichier .stories.tsx ?|Un export default (le Meta = métadonnées du composant : title, component, tags, argTypes) et des exports nommés (les StoryObj), un par état du composant.
En CSF3, une story est-elle une fonction ou un objet ?|Un objet : export const Primary: Story = { args: {...} }. Storybook monte le component du Meta avec ces args. (En CSF2 c'était une fonction render — à savoir lire, pas à écrire.)
Quelle est la différence entre args et argTypes ?|args = les valeurs de props rendues pour la story. argTypes = la description de chaque prop et le choix de son control (select, radio, boolean, color) ; alimente aussi la table de props autodocs.
À quoi sert le tag autodocs dans le Meta ?|tags: ['autodocs'] génère une page de documentation auto : table des props (types, defaults, descriptions issues d'argTypes) + rendu de chaque story. Un catalogue vivant toujours synchrone avec le code.
Que fait l'addon-a11y de Storybook et quel est son usage clé pour un design system ?|Il exécute axe-core sur chaque story rendue et affiche les violations d'accessibilité. Usage phare : valider le contraste des tokens de couleur (RGAA 3.2 / WCAG 1.4.3) à la source, avant propagation à toute l'app.
À quoi sert une play function, et que ne doit-elle PAS tester ?|Elle s'exécute après le rendu et simule des interactions (userEvent.click) avec assertions (expect) sur le composant isolé. Elle ne teste PAS la logique métier (calculs, règles) — ça reste dans Vitest.
En quoi les stories permettent-elles le visual testing avec Chromatic ?|Chaque story rend un état déterministe = un cas de test visuel gratuit. Chromatic snapshot chaque story en cloud, la compare au baseline et signale les diffs de pixels en CI — aucun code de test à écrire.
Pourquoi préférer satisfies Meta<typeof Button> plutôt que : Meta<typeof Button> ?|satisfies conserve le type littéral du meta, ce qui permet à StoryObj<typeof meta> de connaître et typer précisément les args autorisés dans chaque story. C'est le pattern CSF3 recommandé.
```

---

## Pont vers le lab

> Lab associé : `21-design-system/labs/lab-07-storybook/README.md`. Écrire le catalogue Storybook du `PrimaryButton` et de la `RoutineCard` TribuZen — stories CSF3, args/argTypes, autodocs, et vérif contraste via l'addon a11y.
