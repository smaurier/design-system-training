# Lab 06 — Animations et motion en React avec Motion

> **Outcome :** à la fin, tu sais animer un composant React avec **Motion** (`initial`/`animate`/`exit`), orchestrer un montage/démontage avec `AnimatePresence`, ajouter une micro-interaction `whileTap`, et respecter `prefers-reduced-motion` via `useReducedMotion` — le tout branché sur des tokens de motion.
> **Vrai outil :** Motion (package npm **`motion`**, import `motion/react`) + React 19 + Vite + TypeScript. Pas de harnais simulé.
> **Feedback :** le coach valide en session (pas de test-runner auto-correcteur). Tu observes le résultat à l'œil et tu bascules la préférence système « réduire les animations » pour vérifier l'accessibilité.

> ⚠️ **Nom de package.** On installe `motion`, PAS `framer-motion`. L'import React est `from "motion/react"`. L'ancien `framer-motion` marche encore mais est déprécié — n'installe pas les deux.

## Énoncé

Tu montes la couche micro-interactions du design system TribuZen. À partir d'un starter minimal, tu dois :

1. Créer les **tokens de motion** (`src/tokens/motion.ts`).
2. Animer l'apparition d'une **`RoutineCard`** (fondu + glissement, réduit en fondu seul si l'utilisateur refuse le mouvement).
3. Animer une **`InviteModal`** à l'ouverture ET à la fermeture avec `AnimatePresence`.
4. Ajouter une micro-interaction `whileTap` au **`PrimaryButton`**.
5. Faire respecter `prefers-reduced-motion` **partout** via `useReducedMotion`.

### Setup

```bash
npm create vite@latest lab-06-motion -- --template react-ts
cd lab-06-motion
npm install
npm install motion        # PAS framer-motion
npm run dev
```

### Starter minimal

```tsx
// src/App.tsx — starter (aucune animation encore)
import { useState } from "react";

interface Routine {
  id: string;
  title: string;
  done: boolean;
}

const ROUTINES: Routine[] = [
  { id: "r1", title: "Ranger la chambre", done: false },
  { id: "r2", title: "Devoirs", done: true },
  { id: "r3", title: "Sortir le chien", done: false },
];

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <main style={{ maxWidth: 420, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Routines de la famille</h1>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {ROUTINES.map((r) => (
          <li key={r.id} style={{ padding: 12, border: "1px solid #ddd", marginBottom: 8, borderRadius: 8 }}>
            {r.title} {r.done ? "✓" : ""}
          </li>
        ))}
      </ul>

      {/* TODO: remplacer par <PrimaryButton> avec whileTap */}
      <button onClick={() => setOpen(true)}>Inviter un membre</button>

      {/* TODO: <InviteModal open={open} onClose={() => setOpen(false)} /> */}
    </main>
  );
}
```

## Étapes (en friction)

1. **Tokens** — crée `src/tokens/motion.ts` avec `duration` (`fast`/`base`/`slow`), `ease` (`standard` cubic-bezier, `emphasized` easeInOut), et `spring.card`. Type-le avec `as const`.
2. **RoutineCard** — extrais un composant `motion.li`. Anime `initial`/`animate` (fondu + `y`). Lis `useReducedMotion` : si réduit, `y=0` et `duration=0`. Ajoute un `aria-label`.
3. **Liste en stagger** — transforme le `<ul>` en `motion.ul` avec `variants` parent (`staggerChildren`) et fais hériter les cards. En reduced-motion, désactive le stagger.
4. **PrimaryButton** — `motion.button` avec `whileTap={{ scale: 0.97 }}` et `whileHover` léger. Attention : le scale au tap est acceptable même en reduced-motion (transitoire, non déclenché automatiquement), mais tu peux le neutraliser pour être strict.
5. **InviteModal** — `AnimatePresence` autour du contenu conditionné par `open`. Overlay en fondu + panneau en scale/glissement. `key` stable sur chaque `motion.div`. `exit` défini. Neutralise scale/`y` en reduced-motion.
6. **Vérifie l'accessibilité** — bascule la préférence OS (voir plus bas) et confirme : plus aucun glissement/scale, seulement les fondus, et rien qui « bouge ».

> Comment activer reduced-motion pour tester :
> - Windows : Paramètres → Accessibilité → Effets visuels → « Effets d'animation » OFF.
> - macOS : Réglages → Accessibilité → Affichage → « Réduire les animations ».
> - DevTools Chrome : Rendering → « Emulate CSS media feature prefers-reduced-motion: reduce ».

## Corrigé complet commenté

```tsx
// ─── src/tokens/motion.ts ────────────────────────────────────────
// Tokens de motion : durées et courbes centralisées (prolonge le module 05).
export const motionTokens = {
  duration: { fast: 0.15, base: 0.2, slow: 0.3 },
  ease: {
    standard: [0.25, 0.1, 0.25, 1] as const, // cubic-bezier générique
    emphasized: "easeInOut" as const,         // pour les éléments importants (modale)
  },
  spring: {
    card: { type: "spring", stiffness: 300, damping: 25 } as const,
  },
} as const;
```

```tsx
// ─── src/components/RoutineCard.tsx ──────────────────────────────
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../tokens/motion";

interface RoutineCardProps {
  title: string;
  done: boolean;
}

export function RoutineCard({ title, done }: RoutineCardProps) {
  const reduce = useReducedMotion(); // true si l'OS demande "réduire les animations"

  // Variants enfant : le y (glissement) est neutralisé en reduced-motion,
  // mais le fondu d'opacité reste (feedback "un élément est arrivé").
  const itemVariants = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.li
      variants={itemVariants}
      // Pas de initial/animate ici : l'état est propagé par le parent motion.ul.
      transition={{
        duration: reduce ? 0 : motionTokens.duration.base, // 0 = instantané
        ease: motionTokens.ease.standard,
      }}
      style={{ padding: 12, border: "1px solid #ddd", marginBottom: 8, borderRadius: 8 }}
      aria-label={`Routine ${title}${done ? ", terminée" : ""}`}
    >
      {title} {done ? "✓" : ""}
    </motion.li>
  );
}
```

```tsx
// ─── src/components/RoutineList.tsx ──────────────────────────────
import { motion, useReducedMotion } from "motion/react";
import { RoutineCard } from "./RoutineCard";

interface Routine {
  id: string;
  title: string;
  done: boolean;
}

export function RoutineList({ routines }: { routines: Routine[] }) {
  const reduce = useReducedMotion();

  // Parent : orchestre le stagger. En reduced-motion, staggerChildren=0
  // => toutes les cards apparaissent ensemble, sans cascade de mouvement.
  const listVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : 0.05 }, // 50 ms entre enfants
    },
  };

  return (
    <motion.ul
      variants={listVariants}
      initial="hidden"
      animate="visible"
      style={{ listStyle: "none", padding: 0 }}
    >
      {routines.map((r) => (
        <RoutineCard key={r.id} title={r.title} done={r.done} />
      ))}
    </motion.ul>
  );
}
```

```tsx
// ─── src/components/PrimaryButton.tsx ────────────────────────────
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../tokens/motion";
import type { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export function PrimaryButton({ children, onClick }: PrimaryButtonProps) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      // whileTap = feedback tactile immédiat (mobile-first). Neutralisé si reduce.
      whileTap={reduce ? undefined : { scale: 0.97 }}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      transition={motionTokens.spring.card}
      style={{
        padding: "10px 16px",
        border: "none",
        borderRadius: 8,
        background: "#4f46e5",
        color: "white",
        cursor: "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}
```

```tsx
// ─── src/components/InviteModal.tsx ──────────────────────────────
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { motionTokens } from "../tokens/motion";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
}

export function InviteModal({ open, onClose }: InviteModalProps) {
  const reduce = useReducedMotion();

  return (
    // AnimatePresence garde les enfants dans le DOM le temps que "exit" joue,
    // PUIS les démonte. Sans lui, la fermeture serait instantanée (le CSS ne
    // peut pas animer un démontage React).
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay : fondu seul, jamais de mouvement */}
          <motion.div
            key="overlay" // key stable : AnimatePresence suit qui entre/sort
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : motionTokens.duration.fast }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)" }}
          />

          {/* Panneau : scale + glissement, figés en reduced-motion */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Inviter un membre"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 12 }}
            transition={{
              duration: reduce ? 0 : motionTokens.duration.base,
              ease: motionTokens.ease.emphasized,
            }}
            style={{
              position: "fixed",
              top: "30%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "white",
              padding: 24,
              borderRadius: 12,
              minWidth: 280,
            }}
          >
            <h2>Inviter un membre</h2>
            <p>Saisis l'email du membre à inviter…</p>
            <button onClick={onClose}>Fermer</button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

```tsx
// ─── src/App.tsx (assemblage final) ──────────────────────────────
import { useState } from "react";
import { RoutineList } from "./components/RoutineList";
import { PrimaryButton } from "./components/PrimaryButton";
import { InviteModal } from "./components/InviteModal";

const ROUTINES = [
  { id: "r1", title: "Ranger la chambre", done: false },
  { id: "r2", title: "Devoirs", done: true },
  { id: "r3", title: "Sortir le chien", done: false },
];

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <main style={{ maxWidth: 420, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Routines de la famille</h1>
      <RoutineList routines={ROUTINES} />
      <PrimaryButton onClick={() => setOpen(true)}>Inviter un membre</PrimaryButton>
      <InviteModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
```

**Vérifications à l'œil :**
- Au chargement, les 3 cards apparaissent en cascade (stagger) avec un léger glissement vers le haut.
- Le bouton « s'enfonce » (scale 0.97) au clic/tap.
- La modale entre (scale + fondu) et **sort** proprement à la fermeture (preuve qu'`AnimatePresence` fonctionne).
- **Reduced-motion activé :** plus de cascade, plus de glissement, plus de scale — uniquement des fondus. Aucun mouvement de translation ne subsiste. C'est le critère d'accessibilité du lab.

## Variante J+30 (fading)

Refais le lab **sans relire le corrigé**, avec deux contraintes ajoutées :
1. **Extrais un hook `useMotionTransition(kind)`** qui retourne directement l'objet `transition` correct (durée + ease depuis les tokens) en gérant `useReducedMotion` en interne — de sorte qu'aucun composant n'écrive plus `reduce ? 0 : …` à la main. Objectif : centraliser la logique reduced-motion à UN seul endroit.
2. **Ajoute une transition de liste avec `mode="wait"`** : quand on filtre les routines (toutes / à faire / faites), l'ancienne liste doit sortir avant que la nouvelle entre.

Chrono cible : 25 min. Si tu réécris `reduce ? … : …` dans plus d'un fichier, c'est que le hook de l'étape 1 n'est pas assez central.

## Application TribuZen

Porte ces composants dans le vrai dépôt `smaurier/tribuzen` :

```
tribuzen/src/
  tokens/motion.ts                     # tokens de durée/easing/spring
  components/
    ui/PrimaryButton.tsx               # whileTap
    routine/RoutineCard.tsx            # apparition fondu+glissement, stagger
    invite/InviteModal.tsx             # AnimatePresence entrée/sortie
```

- Installe `motion` dans le projet (`npm install motion`), pas `framer-motion`.
- Branche chaque composant sur les **vrais** tokens du design system (module 05), pas des nombres inline.
- Vérifie l'accessibilité en conditions réelles : active « réduire les animations » sur ton OS et re-teste chaque écran.
- Commit sur une branche dédiée : `git checkout -b feat/motion-microinteractions` puis `git commit -m "feat(ds): micro-interactions Motion + respect prefers-reduced-motion"`.
