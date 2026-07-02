# Module 04 — shadcn/ui : composants que tu possèdes

| Difficulté | Durée estimée |
|------------|---------------|
| 2/5        | 90 min        |

> **Prérequis** : Module 02 (Tailwind CSS) + Module 03 (Radix UI). shadcn/ui est construit sur les deux.

## Objectifs

- Comprendre le modèle "copie dans ton codebase" (pas une dépendance)
- Initialiser shadcn/ui dans Next.js
- Utiliser et personnaliser les composants existants
- Créer un composant custom dans le même style
- Maîtriser `class-variance-authority` (cva) pour les variants
- Combiner shadcn/ui avec `react-hook-form` + `zod`

---

## shadcn/ui n'est pas une bibliothèque

```
Bibliothèque classique (MUI, Chakra) :
  npm install @mui/material
  → Dépendance dans node_modules
  → Mises à jour = breaking changes potentiels
  → Personnalisation limitée (override CSS = fragile)
  → Tu ne contrôles pas le code

shadcn/ui :
  npx shadcn-ui@latest add button
  → Copie src/components/ui/button.tsx dans TON projet
  → Pas de dépendance à mettre à jour
  → Tu possèdes le code, tu peux modifier n'importe quoi
  → Construit sur Radix UI (accessibilité) + Tailwind (style)
```

**La révolution** : shadcn/ui t'apporte des composants de qualité production *comme point de départ*, pas comme boîte noire. Si tu veux modifier le comportement interne → tu modifies le fichier directement.

---

## Installation

```bash
# Dans un projet Next.js existant
npx shadcn-ui@latest init
```

```
? Which style would you like to use? › Default
? Which color would you like to use as base color? › Slate
? Where is your global CSS file? › src/app/globals.css
? Would you like to use CSS variables for colors? › Yes
? Are you using a custom tailwind prefix? › No
? Where is your tailwind.config.js located? › tailwind.config.ts
? Configure the import alias for components? › @/components
? Configure the import alias for utils? › @/lib/utils
```

Cela crée :
- `src/lib/utils.ts` — la fonction `cn()` pour merger les classes Tailwind
- Met à jour `tailwind.config.ts` avec les tokens CSS
- Met à jour `globals.css` avec les variables CSS du thème

```typescript
// src/lib/utils.ts — généré automatiquement
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Usage : cn('px-4 py-2', condition && 'bg-red-500', 'hover:bg-blue-500')
// → résout les conflits Tailwind + conditionnel proprement
```

---

## Ajouter des composants

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add sheet   # drawer latéral
npx shadcn-ui@latest add toast
```

Chaque commande copie le fichier dans `src/components/ui/`.

---

## Anatomie d'un composant shadcn : Button

```typescript
// src/components/ui/button.tsx (copie dans ton projet)
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// cva définit les variants du composant
const buttonVariants = cva(
  // Classes de base — toujours appliquées
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// VariantProps<typeof buttonVariants> → type inference automatique
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // asChild = Slot de Radix : rend l'enfant direct avec les props du Button
    // Usage : <Button asChild><Link href="/...">Go</Link></Button>
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

**Usage :**
```tsx
<Button variant="default" size="lg">Commencer</Button>
<Button variant="outline">Annuler</Button>
<Button variant="ghost" size="icon"><XIcon /></Button>

// asChild — le Button devient un Link Next.js
<Button asChild variant="default">
  <Link href="/routines">Voir mes routines</Link>
</Button>
```

---

## Personnaliser le thème TribuZen

```css
/* src/app/globals.css */
@layer base {
  :root {
    /* TribuZen palette */
    --background: 40 33% 97%;          /* #F8F5F0 blanc chaud */
    --foreground: 0 0% 17%;            /* #2C2C2C anthracite */

    --primary: 135 8% 45%;             /* #6B7E6B sauge profond */
    --primary-foreground: 40 33% 97%;  /* blanc chaud sur sauge */

    --secondary: 20 46% 55%;           /* #C4785A terracotta doux */
    --secondary-foreground: 40 33% 97%;

    --muted: 40 20% 92%;
    --muted-foreground: 0 0% 45%;

    --accent: 43 66% 45%;              /* #D4A017 ambre */
    --accent-foreground: 0 0% 17%;

    --destructive: 20 46% 55%;         /* Terracotta, jamais rouge */
    --destructive-foreground: 40 33% 97%;

    --border: 40 20% 85%;
    --input: 40 20% 85%;
    --ring: 135 8% 45%;                /* Sauge pour le focus ring */

    --radius: 0.75rem;                 /* Coins plus doux = chaleur */
  }
}
```

```typescript
// tailwind.config.ts — connecter les CSS variables
export default {
  theme: {
    extend: {
      fontFamily: {
        heading: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        // Laisser shadcn gérer via les CSS variables
        sauge: '#6B7E6B',
        terracotta: '#C4785A',
        ambre: '#D4A017',
      },
    },
  },
};
```

---

## Créer un composant TribuZen avec cva

```typescript
// src/components/ui/routine-card.tsx

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const routineCardVariants = cva(
  // Base : toujours présent
  'rounded-xl border p-4 transition-all duration-200',
  {
    variants: {
      status: {
        pending: 'border-border bg-background',
        inProgress: 'border-primary/30 bg-primary/5',
        completed: 'border-primary/50 bg-primary/10 opacity-80',
        skipped: 'border-muted bg-muted/30',
      },
      size: {
        default: 'p-4',
        compact: 'p-3',
        large: 'p-6',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'default',
    },
  }
);

interface RoutineCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof routineCardVariants> {
  title: string;
  time?: string;
  assignee?: string;
  onComplete?: () => void;
}

export function RoutineCard({
  title,
  time,
  assignee,
  status,
  size,
  onComplete,
  className,
  ...props
}: RoutineCardProps) {
  return (
    <div
      className={cn(routineCardVariants({ status, size }), className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-heading font-medium text-foreground">{title}</p>
          {time && (
            <p className="text-sm text-muted-foreground">{time}</p>
          )}
          {assignee && (
            <span className="mt-1 inline-block text-xs text-muted-foreground">
              {assignee}
            </span>
          )}
        </div>
        {status !== 'completed' && onComplete && (
          <button
            onClick={onComplete}
            className="rounded-full p-2 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Marquer "${title}" comme terminé`}
          >
            ✓
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Form avec react-hook-form + zod

```bash
npm install react-hook-form zod @hookform/resolvers
npx shadcn-ui@latest add form input label
```

```typescript
// src/features/routines/create-routine-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const routineSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(50),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  assignee: z.string().optional(),
});

type RoutineFormValues = z.infer<typeof routineSchema>;

export function CreateRoutineForm({ onSubmit }: { onSubmit: (values: RoutineFormValues) => void }) {
  const form = useForm<RoutineFormValues>({
    resolver: zodResolver(routineSchema),
    defaultValues: { name: '', time: '08:00' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la routine</FormLabel>
              <FormControl>
                <Input placeholder="Bain du soir" {...field} />
              </FormControl>
              <FormMessage /> {/* Affiche l'erreur zod automatiquement */}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heure</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Créer la routine
        </Button>
      </form>
    </Form>
  );
}
```

---

## Checklist

- [ ] Je comprends que shadcn/ui = copie dans le codebase, pas dépendance
- [ ] J'ai initialisé shadcn/ui avec `npx shadcn-ui@latest init`
- [ ] La fonction `cn()` est correctement configurée et je l'utilise
- [ ] J'ai personnalisé `globals.css` avec la palette TribuZen
- [ ] Je comprends `cva` et comment créer des variants typés
- [ ] J'ai créé un composant custom TribuZen (RoutineCard) avec variants
- [ ] Le composant Form + zod fonctionne avec validation en temps réel
- [ ] Le `asChild` pattern de Radix est compris (Button qui rend un Link)
