# Module 07 — Storybook (notions)

| Difficulté | Durée estimée |
|------------|---------------|
| 2/5        | 45 min        |

> **Prérequis** : Modules 01-06 (Design System complet).

## Objectifs

- Comprendre ce qu'est Storybook et quand l'utiliser
- Écrire une story simple pour un composant TribuZen
- Connaître Chromatic pour les tests visuels régressifs
- Savoir argumenter en mission ESN (tu en verras beaucoup)

---

## Storybook : catalogue de composants

Storybook = environnement isolé pour développer et documenter des composants UI. Chaque "story" = un état d'un composant.

```
Sans Storybook :
  → Tester un composant = lancer l'app entière
  → Documenter = README ou rien
  → Tester les edge cases = navigation manuelle

Avec Storybook :
  → Chaque composant visible en isolation
  → Chaque état du composant (loading, error, empty...) = une story
  → Documentation auto-générée depuis les stories
  → Chromatic = snapshot des stories → détecte les régressions visuelles
```

---

## Quand utiliser Storybook ?

```
AVEC Storybook :
  ✓ Équipe 5+ devs sur le même design system
  ✓ Design system partagé entre plusieurs apps
  ✓ Designer + dev collaborent sur les composants
  ✓ Besoin de tests visuels régressifs en CI

SANS Storybook (cas TribuZen MVP) :
  → shadcn/ui docs = documentation composants de base
  → Tests jest-axe = tests accessibilité
  → Chromatic peut fonctionner sans Storybook (via tests Playwright)
  → Coût de maintenance Storybook > bénéfice sur projet solo
```

---

## Installation (si tu l'utilises)

```bash
npx storybook@latest init
# → Crée .storybook/main.ts + stories/

npm run storybook  # Lance sur http://localhost:6006
```

---

## Écrire une story

```typescript
// src/components/ui/routine-card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { RoutineCard } from './routine-card';

// Métadonnées du composant
const meta: Meta<typeof RoutineCard> = {
  title: 'TribuZen/RoutineCard',
  component: RoutineCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'], // Documentation auto-générée
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'inProgress', 'completed', 'skipped'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof RoutineCard>;

// Story 1 : état par défaut
export const Default: Story = {
  args: {
    title: 'Bain du soir',
    time: '20:30',
    assignee: 'Maman',
    status: 'pending',
  },
};

// Story 2 : en cours
export const InProgress: Story = {
  args: {
    ...Default.args,
    status: 'inProgress',
  },
};

// Story 3 : terminé
export const Completed: Story = {
  args: {
    ...Default.args,
    status: 'completed',
  },
};

// Story 4 : sans assigné (cas famille monoparentale)
export const NoAssignee: Story = {
  args: {
    title: 'Goûter',
    time: '16:00',
    status: 'pending',
  },
};
```

---

## Chromatic — tests visuels régressifs

```bash
npm install --save-dev chromatic

# En CI (GitHub Actions)
npx chromatic --project-token=<your-token>
```

```yaml
# .github/workflows/chromatic.yml
- name: Run Chromatic
  uses: chromaui/action@v1
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    exitOnceUploaded: true
```

Chromatic prend un snapshot de chaque story → compare avec la version précédente → signale les différences visuelles. Doit être approuvé manuellement ou automatiquement selon config.

---

## Alternative sans Storybook : tests visuels Playwright

```typescript
// src/components/ui/routine-card.spec.ts
import { test, expect } from '@playwright/test';

test('RoutineCard - all states', async ({ page }) => {
  await page.goto('/test/routine-card');

  // Screenshot de chaque état
  await expect(page.locator('[data-testid="card-pending"]')).toHaveScreenshot('card-pending.png');
  await expect(page.locator('[data-testid="card-completed"]')).toHaveScreenshot('card-completed.png');
});
```

---

## Checklist

- [ ] Je comprends ce que Storybook apporte (et quand ce n'est pas nécessaire)
- [ ] Je sais écrire une story avec `Meta` et `StoryObj`
- [ ] Je connais Chromatic et son rôle dans la CI
- [ ] Pour TribuZen MVP : je choisis jest-axe + Playwright plutôt que Storybook complet
- [ ] En mission ESN : je sais utiliser Storybook quand l'équipe l'a mis en place
