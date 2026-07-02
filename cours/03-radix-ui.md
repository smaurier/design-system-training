# Module 03 — Radix UI : accessibilité headless

| Difficulté | Durée estimée |
|------------|---------------|
| 3/5        | 75 min        |

> **Prérequis** : Module 02 (Tailwind CSS). Radix UI est la couche comportement/accessibilité que Tailwind habille.

## Objectifs

- Comprendre le pattern headless (comportement sans style)
- Utiliser Dialog, DropdownMenu, Select, Tabs, Tooltip
- Styler les data-attributes Radix avec Tailwind
- Comprendre ce que Radix gère automatiquement (focus, ARIA, clavier)

---

## Pourquoi headless ?

```
Bibliothèque classique (ex: Bootstrap Modal) :
  → Comportement + style bundlés ensemble
  → Personnalisation = override CSS fragile
  → Souvent pas accessible out-of-the-box

Radix UI (headless) :
  → Comportement + accessibilité : oui
  → Style : rien — tu amènes Tailwind
  → Tu contrôles 100% du visuel
  → WCAG 2.1 AA certifié out-of-the-box

Ce que Radix gère automatiquement :
  ├── Focus trap (dans les Dialog, DropdownMenu)
  ├── Navigation clavier (Tab, Escape, Arrow keys)
  ├── ARIA attributes (role, aria-expanded, aria-modal...)
  ├── Portail DOM (modales rendues en dehors du flux normal)
  └── Gestion des stacking contexts et z-index
```

---

## Installation

```bash
# Installer uniquement ce dont on a besoin
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-tabs
npm install @radix-ui/react-tooltip
```

shadcn/ui installe Radix automatiquement quand tu ajoutes un composant :
```bash
npx shadcn-ui@latest add dialog  # → installe @radix-ui/react-dialog
```

---

## Dialog (modale)

```typescript
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

function ConfirmDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="btn-primary">Supprimer la routine</button>
      </Dialog.Trigger>

      {/* Portal : rendu en dehors du composant parent, dans le <body> */}
      <Dialog.Portal>
        {/* Overlay — Radix ajoute aria-hidden sur le reste du DOM */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out" />

        <Dialog.Content className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md rounded-xl bg-background p-6 shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'focus:outline-none'  // Radix gère le focus, pas besoin du ring ici
        )}>
          <Dialog.Title className="font-heading text-lg font-semibold">
            Supprimer la routine ?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Cette action est irréversible.
          </Dialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button className="btn-outline">Annuler</button>
            </Dialog.Close>
            <button onClick={onConfirm} className="btn-destructive">
              Supprimer
            </button>
          </div>

          {/* Bouton fermeture — accessible avec Escape automatiquement */}
          <Dialog.Close className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
            ✕
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

---

## DropdownMenu

```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

function FamilyActions({ familyId }: { familyId: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {/* aria-haspopup et aria-expanded gérés par Radix */}
        <button className="rounded-full p-2 hover:bg-accent" aria-label="Actions famille">
          ⋮
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] rounded-lg border bg-background p-1 shadow-md"
          sideOffset={4}
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm hover:bg-accent focus:outline-none focus:bg-accent"
            onSelect={() => console.log('invite')}
          >
            Inviter un membre
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
            onSelect={() => console.log('leave')}
          >
            Quitter la famille
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

---

## Styler les data-attributes

Radix expose l'état de ses composants via des `data-attributes` :

```
data-state="open" | "closed"
data-side="top" | "bottom" | "left" | "right"
data-highlighted   (item survolé dans un menu)
data-disabled
data-checked
```

```css
/* Animer avec les data-attributes */
[data-state="open"] {
  animation: fadeIn 150ms ease-out;
}
[data-state="closed"] {
  animation: fadeOut 100ms ease-in;
}

/* Avec Tailwind via le plugin tailwindcss-animate */
.content {
  @apply data-[state=open]:animate-in data-[state=closed]:animate-out
         data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
         data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95;
}
```

---

## Tabs

```typescript
import * as Tabs from '@radix-ui/react-tabs';

function RoutinesTabs() {
  return (
    <Tabs.Root defaultValue="today">
      <Tabs.List className="flex border-b border-border" aria-label="Routines">
        {['today', 'week', 'all'].map((tab) => (
          <Tabs.Trigger
            key={tab}
            value={tab}
            className={cn(
              'px-4 py-2 text-sm text-muted-foreground',
              'border-b-2 border-transparent',
              'data-[state=active]:border-primary data-[state=active]:text-foreground',
              'hover:text-foreground transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            {tab === 'today' ? "Aujourd'hui" : tab === 'week' ? 'Cette semaine' : 'Toutes'}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="today" className="pt-4">...</Tabs.Content>
      <Tabs.Content value="week" className="pt-4">...</Tabs.Content>
      <Tabs.Content value="all" className="pt-4">...</Tabs.Content>
    </Tabs.Root>
  );
}
```

---

## Ce que Radix gère pour toi (ne pas réimplémenter)

| Feature | Sans Radix | Avec Radix |
|---------|-----------|------------|
| Fermeture Escape | `addEventListener` manuel | Automatique |
| Focus trap dans modale | `focusTrap.js` externe | Intégré |
| Focus retour au trigger | Code complexe | Automatique |
| aria-expanded | Gérer l'état manuellement | Automatique |
| aria-modal | Oubli fréquent | Automatique |
| Navigation clavier ↑↓ dans menu | 50+ lignes | Intégré |
| Click outside to close | `useOnClickOutside` custom | Intégré |

---

## Checklist

- [ ] Je comprends pourquoi headless > bibliothèque avec styles
- [ ] Dialog, DropdownMenu, Tabs fonctionnent avec Tailwind
- [ ] Je stye les `data-state` avec Tailwind (`data-[state=open]:...`)
- [ ] Je ne réimplémente pas focus trap, Escape, ARIA — Radix le fait
- [ ] shadcn/ui ajoute automatiquement les styles Tailwind sur Radix
