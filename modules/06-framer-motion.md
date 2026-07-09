---
titre: Animations et motion en React avec Motion
cours: 21-design-system
notions: [composants motion, initial-animate-exit, variants, AnimatePresence, transition spring et tween, gestures whileHover et whileTap, layout animations, useReducedMotion, tokens de duree et easing]
outcomes: [animer un composant React avec les props initial-animate-exit, orchestrer montage et demontage avec AnimatePresence, respecter prefers-reduced-motion avec useReducedMotion, brancher les animations sur des tokens de duree et easing]
prerequis: [05-design-tokens]
next: 07-storybook
libs: [{ name: react, version: "^19" }, { name: motion, version: "latest" }]
tribuzen: micro-interactions du design system TribuZen (RoutineCard, modale d'invitation, PrimaryButton) animees avec Motion et respect de prefers-reduced-motion
last-reviewed: 2026-07
---

# Animations et motion en React avec Motion

> **Outcomes — tu sauras FAIRE :** animer un composant React avec `initial`/`animate`/`exit`, orchestrer montage et démontage avec `AnimatePresence`, respecter `prefers-reduced-motion` via `useReducedMotion`, brancher les animations sur des tokens de durée et d'easing.
> **Difficulté :** :star::star::star:

> **Note de nommage — 2026.** La librairie historiquement connue sous le nom **Framer Motion** a été rebrandée en **Motion**. Le package npm s'appelle désormais **`motion`** et l'import React se fait depuis **`motion/react`**. L'ancien package `framer-motion` (import `from "framer-motion"`) existe toujours et reste rétro-compatible, mais tout nouveau code doit utiliser `motion` / `motion/react`. Dans ce module on utilise le package actuel.

## 1. Cas concret d'abord

Tu construis le design system TribuZen. La `RoutineCard` (carte d'une routine familiale) apparaît quand une famille ajoute une routine. Aujourd'hui elle « pop » brutalement dans la liste : le DOM la monte sans transition, l'œil ne suit pas, et l'utilisateur ne comprend pas *qu'un élément vient d'apparaître*.

On te demande trois choses :
1. La `RoutineCard` doit **apparaître en fondu + léger glissement** (feedback : « un élément est arrivé »).
2. La **modale d'invitation** doit **entrer et sortir** proprement — le problème, c'est qu'à la fermeture React démonte le composant *avant* qu'une animation de sortie puisse jouer.
3. Rien de tout ça ne doit se déclencher pour un utilisateur qui a activé **« réduire les animations »** dans son OS (obligation d'accessibilité, RGAA / WCAG 2.3.3).

Le CSS seul ne sait pas animer un démontage (point 2). C'est exactement le trou que Motion comble. Voici la cible :

```tsx
import { motion, AnimatePresence } from "motion/react";

function RoutineCard({ title }: { title: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}   // état de départ
      animate={{ opacity: 1, y: 0 }}   // état visé au montage
      className="routine-card"
    >
      {title}
    </motion.article>
  );
}
```

Ce module te donne tout pour écrire ça correctement — y compris la partie accessibilité, qui n'est pas optionnelle.

---

## 2. Théorie complète, concise

### 2.1 Installation et import (package `motion`)

```bash
npm install motion
```

```tsx
// Import React — TOUJOURS depuis "motion/react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
```

- `motion` : la factory de composants animables (`motion.div`, `motion.button`, `motion.article`…).
- `AnimatePresence` : wrapper qui permet les animations de **sortie** (démontage).
- `useReducedMotion` : hook qui lit `prefers-reduced-motion`.

> Ancien monde : `npm install framer-motion` + `import { motion } from "framer-motion"`. L'API des composants est identique ; seul le nom de package et le chemin d'import changent.

### 2.2 Composants `motion.*`

`motion.<tag>` est une version « augmentée » d'un élément HTML/SVG : elle accepte toutes les props natives **plus** les props d'animation (`initial`, `animate`, `exit`, `transition`, `variants`, `whileHover`, `whileTap`, `layout`…).

```tsx
<motion.div />      // div animable
<motion.button />   // button animable
<motion.article />  // n'importe quel tag existe en version motion
```

Ce n'est pas un nouveau composant visuel : `motion.div` rend un vrai `<div>` dans le DOM. Il intercepte juste le cycle de vie pour piloter les propriétés animées.

### 2.3 `initial`, `animate`, `exit`

Trois props décrivent trois états :

| Prop | Quand | Rôle |
|---|---|---|
| `initial` | au montage, avant la 1re frame | état de départ |
| `animate` | après le montage | état visé (Motion interpole entre `initial` et `animate`) |
| `exit` | au démontage | état de sortie (nécessite `AnimatePresence`) |

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 8 }}
/>
```

Motion anime automatiquement toute propriété qui diffère entre `initial` et `animate` : `opacity`, `x`/`y` (translation), `scale`, `rotate`, couleurs, etc. Passer `initial={false}` désactive l'animation d'entrée (utile quand l'élément est déjà là au premier rendu).

### 2.4 `transition` — spring vs tween

`transition` décrit **comment** on va de l'état A à l'état B. Deux familles :

```tsx
// TWEEN — durée fixe, courbe d'easing définie mathématiquement
transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }} // cubic-bezier

// SPRING — simulation physique, durée émergente, ressenti naturel
transition={{ type: "spring", stiffness: 300, damping: 25 }}
```

| | Tween | Spring |
|---|---|---|
| Contrôle | `duration` + `ease` | `stiffness`, `damping`, `mass` (ou `bounce`+`duration`) |
| Durée | fixe, prévisible | émergente de la physique |
| Bon pour | feedbacks courts, toasts (< 200 ms) | apparitions, interactions tactiles (ressenti naturel) |

Repères TribuZen : apparition de card → spring légère ; toast → tween rapide `easeOut` ; modale → tween `easeInOut`.

### 2.5 `variants` — états nommés et orchestration

Au lieu d'écrire les objets inline, on les nomme dans un objet `variants`. On référence ensuite le nom dans `initial`/`animate`/`exit`.

```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

<motion.article variants={cardVariants} initial="hidden" animate="visible" />;
```

Deux bénéfices majeurs :
1. **Lisibilité** — les états sont réutilisables et testables.
2. **Propagation + orchestration** — un parent en `variants` propage l'état nommé à ses enfants `motion.*`, et peut les échelonner avec `staggerChildren` :

```tsx
const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } }, // 50 ms entre enfants
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

<motion.ul variants={listVariants} initial="hidden" animate="visible">
  {routines.map((r) => (
    <motion.li key={r.id} variants={itemVariants} /> // hérite "hidden"/"visible"
  ))}
</motion.ul>;
```

### 2.6 `AnimatePresence` — animer le démontage

Problème fondamental : quand React retire un composant du rendu (`{isOpen && <Modal/>}` devient `false`), il le **démonte immédiatement**. Aucune animation de sortie ne peut jouer. `AnimatePresence` garde l'élément dans le DOM le temps que son `exit` se termine, puis le retire.

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}   // joué AVANT le démontage réel
    />
  )}
</AnimatePresence>
```

Règles clés :
- L'enfant conditionné doit avoir une **`key` stable** s'il peut être remplacé.
- `mode="wait"` : attend que l'élément sortant finisse avant de monter l'entrant (utile pour transitions de pages / d'onglets).
- `initial={false}` sur `AnimatePresence` : pas d'animation d'entrée au tout premier rendu.

### 2.7 Gestures — `whileHover`, `whileTap`

Props d'animation temporaires actives *pendant* un état d'interaction. Motion revient à `animate` quand l'interaction cesse.

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}   // feedback tactile immédiat
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
/>
```

`whileTap` est le plus utile en mobile-first : il confirme visuellement le contact du doigt avant même que l'action serveur ne réponde. On peut aussi référencer des noms de variants (`whileTap="tap"`).

### 2.8 Layout animations

Quand un élément change de **taille ou de position** à cause d'un changement de layout (réordonnancement de liste, ouverture d'un accordéon), la prop `layout` anime automatiquement la transition entre l'ancienne et la nouvelle géométrie (technique FLIP).

```tsx
<motion.li layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
  {title}
</motion.li>
```

`layoutId` partagé entre deux éléments crée une transition « magic move » (un élément semble se déplacer d'un endroit à l'autre). Puissant mais à utiliser avec parcimonie — c'est du mouvement, donc soumis à `prefers-reduced-motion`.

### 2.9 `useReducedMotion` + tokens de durée/easing (a11y OBLIGATOIRE)

C'est le point non négociable. Le média `prefers-reduced-motion: reduce` traduit un besoin médical réel (troubles vestibulaires, migraines, vertiges). WCAG 2.3.3 et le RGAA imposent de le respecter. La règle d'or : **on ne supprime pas le feedback, on supprime le mouvement.** L'opacité reste ; les translations, scales et layout animations sont neutralisés.

```tsx
function RoutineCard({ title }: { title: string }) {
  const shouldReduceMotion = useReducedMotion(); // true si l'OS demande "reduce"

  return (
    <motion.article
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }} // pas de glissement
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
    >
      {title}
    </motion.article>
  );
}
```

Pour rester cohérent, on centralise durées et courbes dans des **tokens de motion** (prolongement du module 05 sur les design tokens) :

```ts
// tokens/motion.ts
export const motionTokens = {
  duration: { fast: 0.15, base: 0.2, slow: 0.3 },
  ease: {
    standard: [0.25, 0.1, 0.25, 1] as const, // cubic-bezier
    emphasized: "easeInOut" as const,
  },
  spring: { card: { type: "spring", stiffness: 300, damping: 25 } as const },
} as const;

// Helper qui applique le respect de reduced-motion en un seul endroit
export function withReducedMotion<T extends object>(
  reduce: boolean,
  full: T,
): T | { duration: number } {
  return reduce ? { duration: 0 } : full;
}
```

Ainsi chaque composant tire ses durées des tokens, et le respect de `prefers-reduced-motion` vit à un seul endroit au lieu d'être dupliqué (et oublié) partout.

---

## 3. Worked examples

### Exemple 1 — `RoutineCard` : apparition accessible via tokens

Objectif : la carte apparaît en fondu + glissement, sauf en reduced-motion où seul le fondu reste.

```tsx
// components/RoutineCard.tsx
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/tokens/motion";

interface RoutineCardProps {
  title: string;
  done: boolean;
}

export function RoutineCard({ title, done }: RoutineCardProps) {
  const reduce = useReducedMotion();

  // Variants dérivés de reduce : y=0 si l'utilisateur refuse le mouvement
  const variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.article
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: reduce ? 0 : motionTokens.duration.base, // 0.2 s ou instantané
        ease: motionTokens.ease.standard,
      }}
      className="routine-card"
      aria-label={`Routine ${title}${done ? ", terminée" : ""}`}
    >
      {title}
    </motion.article>
  );
}
```

Pas à pas :
1. `useReducedMotion()` lit la préférence système une fois par rendu.
2. `y` vaut `8` (glissement) en mode normal, `0` (fondu seul) en mode réduit.
3. `duration` tombe à `0` en mode réduit : Motion applique l'état final sans interpolation → aucun mouvement perçu, mais l'état visuel final est correct.
4. Les valeurs de durée/easing viennent des **tokens**, pas de nombres magiques inline.

### Exemple 2 — Modale d'invitation : entrée/sortie avec `AnimatePresence`

Objectif : la modale (inviter un membre dans la famille) doit s'animer à l'ouverture ET à la fermeture. Sans `AnimatePresence`, la fermeture serait instantanée.

```tsx
// components/InviteModal.tsx
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { motionTokens } from "@/tokens/motion";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
}

export function InviteModal({ open, onClose }: InviteModalProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay : fondu seul (jamais de mouvement) */}
          <motion.div
            key="overlay"
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : motionTokens.duration.fast }}
            onClick={onClose}
          />

          {/* Panneau : glissement + scale, neutralisés en reduced-motion */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Inviter un membre"
            className="modal-panel"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 12 }}
            transition={{
              duration: reduce ? 0 : motionTokens.duration.base,
              ease: motionTokens.ease.emphasized, // easeInOut = importance perçue
            }}
          >
            <h2>Inviter un membre</h2>
            {/* ...formulaire... */}
            <button onClick={onClose}>Fermer</button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

Pas à pas :
1. `AnimatePresence` entoure le contenu conditionné par `open`.
2. Chaque `motion.div` a une **`key` stable** (`overlay`, `panel`) : nécessaire pour qu'`AnimatePresence` sache qui entre/sort.
3. `exit` définit l'état de sortie ; il est joué AVANT que React ne démonte réellement l'élément.
4. En reduced-motion, `scale` et `y` sont figés à leur valeur finale → seule l'opacité anime. Le feedback « la modale s'ouvre/se ferme » reste présent sans mouvement vestibulaire.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Croire que le CSS peut animer un démontage

```tsx
// ❌ La transition CSS ne joue jamais : React démonte instantanément
{isOpen && <div className="modal fade-css" />}
```

Une transition CSS a besoin que l'élément reste dans le DOM pour interpoler. Au démontage, React le retire d'un coup — la classe de sortie n'a pas le temps d'agir. **Correct :** entourer d'`AnimatePresence` et déclarer `exit`. C'est la raison d'être n°1 de Motion.

### PIÈGE #2 — Oublier la `key` dans `AnimatePresence`

```tsx
// ❌ Enfants remplacés sans key stable : exit ne joue pas / glitch
<AnimatePresence>
  {items.map((i) => (
    <motion.li exit={{ opacity: 0 }} />
  ))}
</AnimatePresence>

// ✅ key stable et unique
<AnimatePresence>
  {items.map((i) => (
    <motion.li key={i.id} exit={{ opacity: 0 }} />
  ))}
</AnimatePresence>
```

`AnimatePresence` identifie les entrants/sortants par leur `key`. Sans key stable, il ne peut pas suivre qui disparaît et l'animation de sortie est sautée.

### PIÈGE #3 — Supprimer le feedback au lieu du mouvement en reduced-motion

```tsx
// ❌ En reduced-motion, on désactive TOUTE l'animation, même l'opacité
if (reduce) return <div className="static" />; // l'utilisateur ne voit rien "arriver"

// ✅ On garde le fondu, on retire seulement translation/scale/durée
<motion.article
  initial={{ opacity: 0, y: reduce ? 0 : 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: reduce ? 0 : 0.2 }}
/>
```

`prefers-reduced-motion` veut dire « moins de **mouvement** », pas « aucun changement d'état ». Un fondu d'opacité est acceptable et utile (il signale l'apparition). Ce sont les translations, scales, rotations et layout animations qui posent problème.

### PIÈGE #4 — Confondre `spring` et `tween` (et régler l'un avec les params de l'autre)

```tsx
// ❌ duration + stiffness mélangés : stiffness ignoré, on croit avoir un spring
transition={{ duration: 0.3, stiffness: 400 }}

// ✅ Spring : PAS de duration classique, on règle la physique
transition={{ type: "spring", stiffness: 400, damping: 30 }}
// ✅ Tween : duration + ease
transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
```

Un `spring` dérive sa durée de `stiffness`/`damping`/`mass`. Mettre `duration` sur un spring (sauf la forme `{ type: "spring", duration, bounce }`) ne fait pas ce qu'on croit. Choisir la famille d'abord, puis les bons paramètres.

### PIÈGE #5 — Utiliser l'ancien package `framer-motion` par réflexe

```tsx
// ⚠️ Ancien (marche encore, mais déprécié pour les nouveaux projets)
import { motion } from "framer-motion";

// ✅ Actuel
import { motion } from "motion/react";
```

Le rebrand Framer Motion → Motion a changé le nom du package (`motion`) et le chemin d'import (`motion/react`). Beaucoup de tutos et de réponses d'IA datent d'avant : vérifier le package installé avant de copier du code.

---

## 5. Ancrage TribuZen

Motion alimente la couche **micro-interactions** du design system TribuZen. Trois usages canoniques, tous branchés sur les tokens de motion et tous conditionnés par `useReducedMotion` :

**`RoutineCard`** (`src/components/routine/RoutineCard.tsx`) — apparition en fondu + glissement quand une routine est ajoutée à la liste familiale. En stagger via un parent `variants` quand la liste se charge. Cas concret du module, écrit complet en Exemple 1.

**`InviteModal`** (`src/components/invite/InviteModal.tsx`) — transition d'entrée/sortie via `AnimatePresence` (overlay en fondu, panneau en scale + glissement). C'est le composant qui justifie `AnimatePresence` : sans lui, la fermeture serait sèche. Écrit complet en Exemple 2.

**`PrimaryButton`** (`src/components/ui/PrimaryButton.tsx`) — <code v-pre>whileTap={{ scale: 0.97 }}</code> pour le feedback tactile immédiat (mobile-first), `whileHover` léger sur desktop. Confirme le contact avant même la réponse serveur.

**Tokens de motion** (`src/tokens/motion.ts`) — `duration` (fast/base/slow), `ease` (standard/emphasized), `spring.card`. Le respect de `prefers-reduced-motion` est centralisé ici + `useReducedMotion` dans chaque composant animé.

Fichiers cibles dans `smaurier/tribuzen` :
```
tribuzen/src/
  tokens/
    motion.ts
  components/
    ui/
      PrimaryButton.tsx
    routine/
      RoutineCard.tsx
    invite/
      InviteModal.tsx
```

---

## 6. Points clés

1. La librairie **Framer Motion** est devenue **Motion** : package `motion`, import `motion/react`. L'ancien `framer-motion` reste rétro-compatible mais déprécié pour le neuf.
2. `motion.<tag>` rend un vrai élément DOM augmenté des props d'animation (`initial`/`animate`/`exit`/`transition`/`variants`…).
3. `initial` = état de départ, `animate` = état visé, `exit` = état de sortie ; Motion interpole automatiquement les propriétés qui diffèrent.
4. Seul `AnimatePresence` permet d'animer un **démontage** : il retient l'élément dans le DOM le temps que `exit` se termine (le CSS ne peut pas faire ça).
5. `transition` choisit le **comment** : `spring` (physique, ressenti naturel) vs `tween` (durée fixe + easing) — ne pas mélanger leurs paramètres.
6. Les `variants` nomment les états, propagent l'état aux enfants et permettent l'orchestration (`staggerChildren`).
7. `whileHover`/`whileTap` = animations temporaires d'interaction ; `whileTap` donne le feedback tactile immédiat.
8. `layout` anime les changements de taille/position (FLIP) ; `layoutId` fait des transitions « magic move ».
9. `useReducedMotion` + tokens de durée/easing : en `prefers-reduced-motion`, on retire le **mouvement** (translation/scale/durée) mais on garde le **feedback** (opacité). Obligation RGAA / WCAG 2.3.3.

---

## 7. Seeds Anki

```
Quel est le nom actuel du package npm et le chemin d'import React de l'ex-Framer Motion ?|Package : motion. Import React : import { motion } from "motion/react". L'ancien framer-motion (import from "framer-motion") reste rétro-compatible mais est déprécié pour les nouveaux projets.
À quoi servent les props initial, animate et exit d'un composant motion ?|initial = état au montage avant la 1re frame ; animate = état visé après montage (Motion interpole entre les deux) ; exit = état de sortie au démontage (nécessite AnimatePresence).
Pourquoi le CSS seul ne peut-il pas animer la fermeture d'une modale, et que faut-il utiliser ?|Au démontage, React retire l'élément du DOM instantanément, donc une transition CSS n'a pas le temps de jouer. Il faut AnimatePresence, qui garde l'élément le temps que son exit se termine avant de le démonter.
Quelle est la différence entre une transition spring et une transition tween ?|Tween : durée fixe + courbe d'easing (duration + ease), prévisible, bon pour feedbacks courts. Spring : simulation physique (stiffness, damping, mass), durée émergente, ressenti naturel, bon pour apparitions et interactions tactiles.
À quoi servent les variants dans Motion ?|Nommer des états d'animation (hidden, visible) réutilisables, les référencer dans initial/animate/exit, propager l'état aux enfants motion et orchestrer (staggerChildren pour échelonner les enfants).
Que faut-il faire dans un composant animé quand prefers-reduced-motion est activé ?|Retirer le mouvement (translation, scale, rotation, layout) et mettre la durée à 0, mais garder le feedback d'opacité. On lit la préférence avec useReducedMotion(). Obligation d'accessibilité RGAA / WCAG 2.3.3.
Pourquoi une key stable est-elle nécessaire dans AnimatePresence ?|AnimatePresence identifie les éléments entrants et sortants par leur key. Sans key stable et unique, il ne peut pas suivre qui disparaît et l'animation de sortie (exit) est sautée.
Que fait la prop layout sur un composant motion ?|Elle anime automatiquement les changements de taille et de position dus au layout (réordonnancement, accordéon) via la technique FLIP. layoutId partagé crée une transition "magic move" entre deux éléments.
```

---

## Pont vers le lab

> Lab associé : `21-design-system/labs/lab-06-framer-motion/README.md`. Construire les tokens de motion, animer la `RoutineCard`, la `InviteModal` (`AnimatePresence`) et le `PrimaryButton` (`whileTap`), le tout avec respect strict de `prefers-reduced-motion`.
