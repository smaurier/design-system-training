# Lab 07 — Storybook : cataloguer le design system TribuZen

> **Outcome :** à la fin, tu sais écrire des stories CSF3 (`Meta` + `StoryObj`) pour un composant, piloter ses variants via `args`/`argTypes` + controls, générer sa doc autodocs, et valider son contraste RGAA avec l'addon a11y.
> **Vrai outil :** Storybook 8 (`@storybook/react-vite`, `@storybook/addon-a11y`, `@storybook/test`). Aucun harnais simulé — Storybook EST le sujet et le livrable.
> **Feedback :** le coach valide le catalogue en session (rendu dans `localhost:6006` + onglet Accessibility), pas de test-runner auto-correcteur.

---

## Énoncé

Un projet React + Vite + TypeScript expose deux composants du design system TribuZen : `PrimaryButton` et `RoutineCard`. Ils ne sont visibles nulle part en isolation. Ta tâche : **installer Storybook et écrire leur catalogue**.

### Setup

```bash
# Depuis un projet Vite React-TS existant (ou npm create vite@latest ds-lab -- --template react-ts)
npx storybook@8 init               # ÉPINGLE SB8 : @latest résout SB9 en 2026 et casse ce lab
npm install -D @storybook/addon-a11y
npm run storybook                  # http://localhost:6006
```

> **Ce lab cible Storybook 8.** `npx storybook@latest init` installe désormais **SB9**, dont l'architecture diffère et rendrait ce corrigé faux. Les 3 écarts à connaître si tu passes en SB9 :
> - `@storybook/addon-essentials` et `@storybook/addon-interactions` sont **intégrés au cœur** — on ne les liste plus dans `addons` (garder `@storybook/addon-a11y` uniquement).
> - le paquet `@storybook/test` devient **`storybook/test`** (`import { fn, expect, userEvent, within } from "storybook/test"`).
> - les types `Meta`/`StoryObj` s'importent depuis **`@storybook/react-vite`**, plus depuis `@storybook/react`.

Active l'addon a11y dans `.storybook/main.ts` :

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: { name: '@storybook/react-vite', options: {} },
};

export default config;
```

### Composants fournis (starter)

```tsx
// src/components/ui/PrimaryButton/PrimaryButton.tsx
export interface PrimaryButtonProps {
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
      {loading ? '…' : children}
    </button>
  );
}
```

```tsx
// src/components/ui/RoutineCard/RoutineCard.tsx
export interface RoutineCardProps {
  title: string;
  time: string;
  assignee?: string;
  status: 'pending' | 'inProgress' | 'completed' | 'skipped';
  onComplete?: () => void;
}

export function RoutineCard({ title, time, assignee, status, onComplete }: RoutineCardProps) {
  return (
    <article className={`routine-card routine-card--${status}`}>
      <header>
        <h3>{title}</h3>
        <time>{time}</time>
      </header>
      <p>{assignee ? `Assigné à ${assignee}` : 'Non assigné'}</p>
      {status === 'pending' && (
        <button onClick={onComplete}>Terminer</button>
      )}
    </article>
  );
}
```

---

## Étapes (en friction)

1. **PrimaryButton — le Meta.** Crée `PrimaryButton.stories.tsx`. Écris le `meta` avec `title: 'Design System/PrimaryButton'`, `component`, `tags: ['autodocs']`, et un `argTypes` qui met `variant` en `select`, `size` en `radio`, `loading`/`disabled` en `boolean`. Utilise `satisfies Meta<typeof PrimaryButton>`.
2. **Les stories des variants.** Écris `Primary`, `Secondary`, `Danger` via `args`. Puis `Small`/`Large`/`Loading`/`Disabled` en réutilisant `...Primary.args` (interdit de dupliquer les args à la main).
3. **Vérif contraste.** Sur la story `Danger`, ajoute un `parameters.a11y` qui active la règle `color-contrast`. Ouvre l'onglet Accessibility : lis le ratio. Est-il ≥ 4.5:1 ?
4. **Controls.** Sans écrire de nouvelle story, produis à la souris un bouton `danger` + `lg` + `disabled`. Vérifie que les controls suffisent.
5. **RoutineCard.** Crée `RoutineCard.stories.tsx` : `argTypes.status` en `select` (4 options), stories `Pending`/`Completed`/`NoAssignee`, une story `Mobile` avec `parameters.viewport`, et une `play` sur `Pending` qui clique « Terminer » et vérifie `onComplete` (spy `fn()`).
6. **Autodocs.** Ouvre la page Docs des deux composants. Vérifie que la table des props reprend bien tes `description` d'`argTypes`.

---

## Corrigé complet commenté

```tsx
// src/components/ui/PrimaryButton/PrimaryButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test'; // spy pour tracer les callbacks
import { PrimaryButton } from './PrimaryButton';

const meta = {
  title: 'Design System/PrimaryButton', // position dans l'arbre de gauche
  component: PrimaryButton,
  tags: ['autodocs'],                   // génère la page Docs auto
  args: {
    children: 'Valider',                // args par défaut hérités par toutes les stories
    onClick: fn(),                      // visible dans l'onglet Actions
  },
  argTypes: {
    variant: {
      control: 'select',                // menu déroulant dans Controls
      options: ['primary', 'secondary', 'danger'],
      description: 'Rôle visuel dans le design system TribuZen', // remonte dans autodocs
    },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: { layout: 'centered' },   // centre le composant dans le canvas
} satisfies Meta<typeof PrimaryButton>; // satisfies → StoryObj typera précisément les args

export default meta;
type Story = StoryObj<typeof meta>;

// ── Variants ──────────────────────────────────────────────
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Annuler' } };

export const Danger: Story = {
  args: { variant: 'danger', children: 'Supprimer la routine' },
  parameters: {
    // force axe à auditer le contraste du rouge danger — le garde-fou RGAA du token
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
};

// ── Tailles — spread des args, zéro duplication ───────────
export const Small: Story = { args: { ...Primary.args, size: 'sm' } };
export const Large: Story = { args: { ...Primary.args, size: 'lg' } };

// ── États ─────────────────────────────────────────────────
export const Loading: Story = { args: { ...Primary.args, loading: true } };
export const Disabled: Story = { args: { ...Primary.args, disabled: true } };
```

```tsx
// src/components/ui/RoutineCard/RoutineCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { RoutineCard } from './RoutineCard';

const meta = {
  title: 'Design System/RoutineCard',
  component: RoutineCard,
  tags: ['autodocs'],
  args: { onComplete: fn() },           // spy réutilisé par toutes les stories
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

// données de base partagées (spread dans les stories)
const base = { title: 'Bain du soir', time: '20:30', assignee: 'Maman' };

export const Pending: Story = { args: { ...base, status: 'pending' } };
export const Completed: Story = { args: { ...base, status: 'completed' } };

// cas famille monoparentale — assignee absent
export const NoAssignee: Story = {
  args: { title: 'Goûter', time: '16:00', status: 'pending' },
};

// le planning est surtout consulté au téléphone
export const Mobile: Story = {
  args: { ...base, status: 'pending' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

// interaction : cliquer "Terminer" doit appeler onComplete
export const ClicTerminer: Story = {
  args: { ...base, status: 'pending' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);          // scope les queries au canvas de la story
    await userEvent.click(canvas.getByRole('button', { name: /terminer/i }));
    await expect(args.onComplete).toHaveBeenCalledOnce();
  },
};
```

**Points de validation en session :**
- L'arbre de gauche montre `Design System/PrimaryButton` et `Design System/RoutineCard`, chacun avec une page **Docs** + ses stories.
- Sur `Danger`, l'onglet **Accessibility** affiche le résultat de la règle `color-contrast` (vert si ≥ 4.5:1, rouge sinon → token à corriger).
- Le panneau **Controls** permet de générer `danger`/`lg`/`disabled` sans nouvelle story.
- Sur `ClicTerminer`, l'onglet **Interactions** rejoue le clic pas à pas et l'assertion passe au vert.

---

## Variante J+30 (fading)

Reprends **de mémoire, en 25 min, sans relire le corrigé** : ajoute au design system un composant `StatusBadge` (props `status: 'active' | 'pending' | 'archived'`, `label: string`). Écris son fichier de stories avec :
- `argTypes.status` en `select`,
- une story par statut via spread,
- `tags: ['autodocs']`,
- une story avec vérif de contraste axe sur le statut `archived` (souvent gris clair → piège contraste).

Contrainte supplémentaire : **aucune duplication d'args** — une story de base + spreads uniquement.

---

## Application TribuZen

Porte ce catalogue dans le vrai produit `smaurier/tribuzen` :

```
tribuzen/
  .storybook/main.ts               # + @storybook/addon-a11y
  src/components/ui/
    PrimaryButton/PrimaryButton.stories.tsx
    RoutineCard/RoutineCard.stories.tsx
```

1. `npx storybook@8 init` sur le repo TribuZen (SB8, cohérent avec ce lab), ajoute `@storybook/addon-a11y`.
2. Écris les deux `.stories.tsx` colocalisés à côté des composants existants.
3. Passe l'addon a11y sur chaque variant du `PrimaryButton` : si un token de couleur (`--color-danger`, `--color-secondary`) tombe sous 4.5:1, **corrige le token à la source** — c'est le pont vers le module `08-accessibilite`.
4. Commit : `git commit -m "feat(ds): catalogue Storybook PrimaryButton + RoutineCard avec vérif a11y"`.
