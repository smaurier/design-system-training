# Module 06 — Animations & Motion avec Framer Motion

| Difficulté | Durée estimée |
|------------|---------------|
| 3/5        | 60 min        |

> **Prérequis** : React (cours 03) + Tailwind (module 02).

## Objectifs

- Comprendre quand animer (feedback) vs ne pas animer (distraction)
- Respecter `prefers-reduced-motion` systématiquement
- Maîtriser Framer Motion : motion, animate, transition, gesture
- Comprendre spring physics vs easing

---

## Règle d'or : animer avec intention

```
Animer pour : feedback utilisateur (action confirmée, état changé)
Ne pas animer pour : embellissement, attirer l'attention

Test : "Est-ce que l'animation réduit l'incertitude de l'utilisateur ?"
  Oui → animer
  Non → supprimer

Vestibular Disorders Association : 35% de la population adulte
a des troubles vestibulaires. Les animations de déplacement peuvent
causer nausées et désorientation. prefers-reduced-motion = obligation médicale.
```

---

## prefers-reduced-motion — toujours en premier

```typescript
// src/hooks/useReducedMotion.ts
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}
```

---

## Framer Motion — bases

```bash
npm install framer-motion
```

```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Composant animé de base
function RoutineCard({ title, isVisible }: { title: string; isVisible: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  // Si reduced motion → pas d'animation de déplacement, juste opacité
  const variants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 8, // Pas de déplacement si reduced motion
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{
            duration: prefersReducedMotion ? 0.001 : 0.2,
            ease: 'easeOut',
          }}
          className="routine-card"
        >
          {title}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Spring physics vs Easing curves

```typescript
// Easing curve = durée fixe, progression définie mathématiquement
transition={{ duration: 0.3, ease: 'easeOut' }}
transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }} // cubic-bezier

// Spring = simulation physique, durée variable, feel naturel
transition={{ type: 'spring', stiffness: 400, damping: 30 }}

// Pour TribuZen — recommandations :
// Apparition de cards → spring légère
transition={{ type: 'spring', stiffness: 300, damping: 25 }}

// Toast / notification → easeOut rapide (feedback immédiat)
transition={{ duration: 0.15, ease: 'easeOut' }}

// Modale → easeInOut (importance perçue)
transition={{ duration: 0.25, ease: 'easeInOut' }}
```

---

## Animations de liste avec stagger

```typescript
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05, // 50ms entre chaque enfant
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

function RoutineList({ routines }: { routines: Routine[] }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    // Pas d'animation stagger si reduced motion
    return <div>{routines.map(r => <RoutineCard key={r.id} {...r} />)}</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {routines.map((routine) => (
        <motion.div key={routine.id} variants={itemVariants}>
          <RoutineCard {...routine} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## Gestures : tap feedback

```typescript
// Feedback visuel immédiat sur les boutons tactiles
<motion.button
  whileTap={{ scale: 0.97 }}
  whileHover={{ scale: 1.01 }}
  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
  className="routine-complete-btn"
  onClick={onComplete}
>
  ✓ Marquer comme fait
</motion.button>
```

---

## Célébration : routine complétée

```typescript
// Animation de célébration — discrète, pas de confettis agressifs
function CompletionBadge({ show }: { show: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0.001 }
              : { type: 'spring', stiffness: 400, damping: 20 }
          }
          className="rounded-full bg-primary/10 p-2 text-primary"
          aria-live="polite"
          role="status"
        >
          ✓
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Checklist

- [ ] `useReducedMotion` hook créé et utilisé sur chaque animation
- [ ] prefers-reduced-motion : désactive les déplacements, garde l'opacité si nécessaire
- [ ] Spring physics pour les interactions tactiles (feel naturel)
- [ ] Easing curves pour les feedbacks rapides (< 200ms)
- [ ] Stagger sur les listes de routines
- [ ] Aucune animation non fonctionnelle (chaque animation répond à "pourquoi ?")
