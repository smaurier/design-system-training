# Module 08 — Accessibilité appliquée RGAA

| Difficulté | Durée estimée |
|------------|---------------|
| 3/5        | 75 min        |

> **Prérequis** : Modules 02-04 (Tailwind, Radix, shadcn/ui). Radix UI gère beaucoup d'accessibilité automatiquement — ce module couvre ce qui reste à ta charge.

## Objectifs

- Appliquer les critères RGAA les plus impactants
- Configurer `jest-axe` pour les tests d'accessibilité
- Créer des empty states, error states et loading states inclusifs
- Comprendre les obligations légales (secteur public vs startup)

---

## Ce que Radix gère (ne pas réimplémenter)

- Focus trap dans Dialog et DropdownMenu
- `aria-expanded`, `aria-modal`, `aria-haspopup` automatiques
- Navigation clavier (Tab, Escape, Arrow keys)
- `role` sémantique sur tous les composants

---

## Ce qui reste à ta charge

### 1. Contraste couleur (RGAA 3.2)

```
Texte normal : ratio ≥ 4.5:1
Texte large (≥18px bold ou ≥24px) : ratio ≥ 3:1
Composants UI (bordures, icônes) : ≥ 3:1

Vérificateur en ligne : https://webaim.org/resources/contrastchecker/

TribuZen — vérifications :
  #2C2C2C sur #F8F5F0 → 12.4:1 ✅
  #6B7E6B sur #F8F5F0 → 4.6:1 ✅
  #6B7E6B sur #FFFFFF → 4.6:1 ✅
  ATTENTION : #D4A017 (ambre) sur blanc → 2.9:1 ❌ → utiliser #9B7510
```

### 2. Labels sur tous les boutons iconiques (RGAA 11.9)

```tsx
// ❌ Bouton sans label
<button onClick={onDelete}><TrashIcon /></button>

// ✅ aria-label
<button onClick={onDelete} aria-label="Supprimer la routine">
  <TrashIcon aria-hidden="true" /> {/* Cacher l'icône aux lecteurs d'écran */}
</button>

// ✅ Texte visible + icône (meilleur pour tout le monde)
<button onClick={onDelete}>
  <TrashIcon aria-hidden="true" />
  <span>Supprimer</span>
</button>
```

### 3. Focus ring visible (RGAA 10.7)

```css
/* Tailwind focus-visible — uniquement au clavier, pas à la souris */
.btn {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
}

/* NE PAS utiliser focus: (déclenché aussi par clic souris) */
/* Utiliser focus-visible: (uniquement navigation clavier) */
```

### 4. aria-live pour les mises à jour dynamiques (RGAA 13.1)

```tsx
// Notifications, toasts, résultats de formulaire
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {statusMessage}
</div>

// Pour les urgences (erreur critique)
<div aria-live="assertive" aria-atomic="true" className="sr-only">
  {errorMessage}
</div>

// Classe sr-only = visible pour lecteurs d'écran, invisible visuellement
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## jest-axe : tester l'accessibilité automatiquement

```bash
npm install --save-dev jest-axe @testing-library/react
```

```typescript
// src/components/ui/routine-card.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RoutineCard } from './routine-card';

expect.extend(toHaveNoViolations);

describe('RoutineCard accessibility', () => {
  it('should have no WCAG violations', async () => {
    const { container } = render(
      <RoutineCard
        title="Bain du soir"
        time="20:30"
        status="pending"
        onComplete={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('complete button should have accessible label', async () => {
    const { container } = render(
      <RoutineCard title="Bain" status="pending" onComplete={() => {}} />
    );
    const results = await axe(container, {
      rules: {
        'button-name': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
```

---

## Empty states chaleureux

```tsx
// ❌ État vide générique
<div>Aucun résultat</div>

// ✅ État vide contextualisé + action claire
function EmptyRoutines() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center" role="status">
      {/* Illustration douce, pas d'icône d'erreur */}
      <div className="rounded-full bg-primary/10 p-4 text-4xl" aria-hidden="true">🌱</div>
      <div>
        <p className="font-medium text-foreground">Votre journée est encore vierge</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Créez votre première routine pour commencer
        </p>
      </div>
      <Button>Créer une routine</Button>
    </div>
  );
}
```

---

## Error states sans jugement

```tsx
// ❌ Erreur qui blâme
<p className="text-red-500">❌ Erreur : données invalides</p>

// ✅ Erreur constructive + couleur neutre (terracotta, pas rouge)
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-xl border border-secondary/30 bg-secondary/5 p-4"
    >
      <p className="font-medium text-foreground">Quelque chose s'est passé</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        Réessayer
      </Button>
    </div>
  );
}
```

---

## Loading states non anxiogènes

```tsx
// ❌ Spinner animé agressif + "Chargement..."
// ❌ Skeleton qui clignote (vestibular issues)

// ✅ Skeleton avec animation douce et prefers-reduced-motion
function RoutineSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Chargement des routines"
      className="animate-pulse space-y-3 [prefers-reduced-motion:no-preference]"
    >
      <div className="h-20 rounded-xl bg-muted" />
      <div className="h-20 rounded-xl bg-muted" />
    </div>
  );
}
```

---

## Obligations légales RGAA

```
Loi du 11 février 2005 :
  → OBLIGATOIRE pour : services publics, collectivités, établissements publics
  → PAS obligatoire pour : startups privées (comme TribuZen)

MAIS :
  → Bonus RGPD : données santé enfants → DPIA → une DPIA mentionne l'accessibilité
  → Bonus partenariats : CAF, PMI, municipalités → exigent souvent RGAA
  → Bonus marché : 20% de la population avec handicap = utilisateurs perdus si inaccessible
  → Risque juridique : plainte discrimination possible même sans obligation stricte

Stratégie TribuZen :
  → Viser WCAG 2.1 AA (équivalent RGAA 4.1 niveau AA)
  → jest-axe sur tous les composants dès le début
  → Document d'accessibilité (déclaration RGAA) publié avant partenariats institutionnels
```

---

## Checklist

- [ ] jest-axe configuré et lancé sur tous les composants UI
- [ ] Tous les boutons iconiques ont un `aria-label`
- [ ] Focus ring visible (`focus-visible:ring-2`) sur tous les éléments interactifs
- [ ] Contrastes vérifiés (≥ 4.5:1) pour chaque paire couleur/fond
- [ ] `aria-live` sur toutes les zones mises à jour dynamiquement
- [ ] prefers-reduced-motion respecté sur toutes les animations
- [ ] Empty states et error states sans jugement et avec action claire
