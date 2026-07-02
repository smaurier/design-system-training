# Lab 09 — Tamagui : le design system cross-platform TribuZen

> **Outcome :** à la fin, tu sais poser un `tamagui.config.ts` comme source unique des tokens (web + React Native), et construire des composants partagés avec `styled()` + variants, thème clair/sombre et accessibilité cross-platform.
> **Vrai outil :** Tamagui (`@tamagui/core` / `tamagui`) — config, `createTokens`, `createFont`, `styled()`. Pas de harnais simulé.
> **Feedback :** le coach valide en session (pas de test-runner auto-correcteur).

> Dernier lab du parcours **Design System & UI/UX**. Tu assembles tout : tokens (module 05), composants (module 04), accessibilité (module 08), en un seul système web + mobile.

## Énoncé

TribuZen doit partager son design entre l'app **web** (Next.js) et l'app **mobile** (Expo). Aujourd'hui les couleurs et composants sont dupliqués. Tu vas créer la source unique.

Starter minimal (un projet TS quelconque avec Tamagui installé) :

```bash
npm install tamagui @tamagui/core
```

Tu dois livrer trois fichiers :
1. `tamagui.config.ts` — tokens TribuZen (palette sauge/terracotta/ambre, spacing, radius), fonts Fraunces/Inter, thèmes `light`/`dark`, quelques shorthands.
2. `PrimaryButton.tsx` — bouton `styled(Stack)` avec états et un variant `tone` (`secondary` | `ghost`).
3. `RoutineCard.tsx` — carte `styled(Stack)` avec un variant booléen `done`, layout `XStack`/`YStack`, et accessibilité (`accessibilityRole`, `accessibilityLabel`).

**Contrainte forte :** aucune couleur ni taille en dur dans les composants — uniquement des tokens (`$primary`, `$4`, `$3`…).

## Étapes (en friction)

1. Écris `tamagui.config.ts` : `createTokens` (au moins `color`, `space`, `radius`, `size`), deux `createFont` (heading + body), les thèmes `light`/`dark` avec au minimum `background`, `color`, `borderColor`, `primary`, `primaryHover`. Passe le tout à `createTamagui`. Ajoute le `declare module` pour le typage.
2. Écris `PrimaryButton` avec `styled(Stack, {...})` : `backgroundColor: '$primary'`, `minHeight: '$2'` (44px WCAG), `hoverStyle`/`pressStyle`/`focusStyle`/`disabledStyle`, et `variants.tone` terminé par `as const`.
3. Écris `RoutineCard` : `styled(Stack)` avec `variants.done.true`, layout `XStack`/`YStack`/`Text`, pastille de complétion, et les props d'accessibilité. Zéro valeur en dur.
4. Vérifie mentalement (ou avec `tsc`) : les props `tone` et `done` sont-elles typées ? Si non → tu as oublié `as const`.

## Corrigé complet commenté

```ts
// tamagui.config.ts — la source unique de vérité
import { createFont, createTamagui, createTokens } from '@tamagui/core'

// 1) Tokens bruts : aucune sémantique, juste des valeurs indexées
const tokens = createTokens({
  color: {
    sauge50: '#f0f3f0', sauge100: '#d6dfd6', sauge500: '#6B7E6B', sauge700: '#4a5a4a',
    terracotta500: '#C4785A', chaud100: '#F8F5F0', anthracite: '#2C2C2C',
    ambre500: '#D4A017', white: '#FFFFFF',
  },
  space:  { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, true: 16 },
  size:   { 1: 36, 2: 44, 3: 56, true: 44 },   // 2 = 44px = cible tactile WCAG
  radius: { 1: 4, 2: 8, 3: 12, round: 1000, true: 8 },
})

// 2) Fonts : famille + échelle indexée (référencées $heading / $body, $4…)
const heading = createFont({
  family: 'Fraunces, Georgia, serif',
  size: { 3: 15, 4: 18, 5: 22, 6: 28, true: 18 },
  lineHeight: { 4: 24, 5: 28, 6: 34 },
  weight: { 4: '400', 7: '700' },
})
const body = createFont({
  family: 'Inter, Helvetica, Arial, sans-serif',
  size: { 2: 14, 3: 15, 4: 16, true: 16 },
  lineHeight: { 2: 20, 3: 22, 4: 24 },
  weight: { 4: '400', 6: '600' },
})

// 3) Thèmes : couche SÉMANTIQUE. Les composants ne lisent que ça ($primary…)
const light = {
  background: tokens.color.chaud100, backgroundHover: tokens.color.sauge50,
  color: tokens.color.anthracite, borderColor: '#e5e7eb',
  primary: tokens.color.sauge500, primaryHover: tokens.color.sauge700,
}
const dark = {
  background: '#1a1f1a', backgroundHover: '#222722',
  color: '#e8ece8', borderColor: '#374137',
  primary: tokens.color.sauge500, primaryHover: tokens.color.sauge100,
}

// 4) Assemblage
const config = createTamagui({
  tokens,
  fonts: { heading, body },
  themes: { light, dark },
  media: { sm: { maxWidth: 860 }, gtSm: { minWidth: 861 } },
  shorthands: {
    p: 'padding', px: 'paddingHorizontal', py: 'paddingVertical',
    br: 'borderRadius', bw: 'borderWidth', bc: 'borderColor',
    ai: 'alignItems', jc: 'justifyContent', f: 'flex', mb: 'marginBottom',
  } as const,
})

// 5) Typage global → autocomplétion des tokens dans tout le projet
type AppConfig = typeof config
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
```

```tsx
// PrimaryButton.tsx — composant du design system, styled() + variant tone
import { styled, Stack, Text } from 'tamagui'

export const PrimaryButton = styled(Stack, {
  name: 'PrimaryButton',
  backgroundColor: '$primary',
  br: '$3',
  py: '$3',
  px: '$5',
  ai: 'center',
  jc: 'center',
  minHeight: '$2',                     // 44px — cible tactile (module 08)

  // États — hover/press sur web, press sur natif ; focus visible clavier
  hoverStyle:    { backgroundColor: '$primaryHover' },
  pressStyle:    { backgroundColor: '$primaryHover', scale: 0.98 },
  focusStyle:    { outlineWidth: 2, outlineColor: '$primary', outlineStyle: 'solid' },
  disabledStyle: { opacity: 0.5 },

  variants: {
    tone: {
      // fond transparent + bord : bouton secondaire
      secondary: { backgroundColor: 'transparent', bw: 1, bc: '$primary' },
      // juste le texte : bouton fantôme
      ghost:     { backgroundColor: 'transparent' },
    },
  } as const,                          // ← SANS ça, `tone` n'est pas typé
})

// Texte associé — la couleur s'adapte au tone
export const ButtonText = styled(Text, {
  fontFamily: '$body',
  fontWeight: '600',
  color: '$background',                // texte clair sur fond sauge
  variants: {
    tone: {
      secondary: { color: '$primary' },
      ghost:     { color: '$primary' },
    },
  } as const,
})
```

```tsx
// RoutineCard.tsx — carte partagée web + mobile, variant booléen done
import { styled, Stack, XStack, YStack, Text } from 'tamagui'

interface RoutineCardProps {
  title: string;
  time: string;
  assignee: string;
  done: boolean;
  onToggle: () => void;
}

const CardFrame = styled(Stack, {
  name: 'RoutineCard',
  backgroundColor: '$background',
  br: '$3', p: '$4', bw: 1, bc: '$borderColor', mb: '$3',

  // Écarts de plateforme — clés QUOTÉES dans styled() (tiret)
  '$platform-web':     { boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer' },
  '$platform-ios':     { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3 },
  '$platform-android': { elevation: 1 },

  variants: {
    done: {
      true: { bc: '$primary', backgroundColor: '$backgroundHover' },
    },
  } as const,
})

export function RoutineCard({ title, time, assignee, done, onToggle }: RoutineCardProps) {
  return (
    <CardFrame
      done={done}
      onPress={onToggle}
      // A11y portée par le composant partagé → cohérente web ET mobile
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${done ? 'complétée' : 'à faire'}`}
      accessibilityHint="Appuyer pour basculer l'état de la routine"
    >
      <XStack ai="center" gap="$3">
        <YStack f={1}>
          <Text
            fontFamily="$heading"
            fontSize="$4"
            color={done ? '$primary' : '$color'}
            textDecorationLine={done ? 'line-through' : 'none'}
          >
            {title}
          </Text>
          <Text fontFamily="$body" fontSize="$2" color="$borderColor">
            {time} · {assignee}
          </Text>
        </YStack>

        {/* Pastille : tokens uniquement, aucune couleur en dur */}
        <Stack
          width={24} height={24} br="$round" bw={2}
          ai="center" jc="center"
          backgroundColor={done ? '$primary' : 'transparent'}
          bc={done ? '$primary' : '$borderColor'}
        >
          {done && <Text color="$background" fontSize={12}>✓</Text>}
        </Stack>
      </XStack>
    </CardFrame>
  );
}
```

**Point de vérification a11y (rappel module 08)** — un test `@testing-library/react-native` doit trouver le bouton par son rôle/label et déclencher `onToggle` :

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native'
import { TamaguiProvider } from 'tamagui'
import config from './tamagui.config'
import { RoutineCard } from './RoutineCard'

test('RoutineCard expose un rôle bouton et bascule au press', () => {
  const onToggle = jest.fn()
  render(
    <TamaguiProvider config={config} defaultTheme="light">
      <RoutineCard title="Vaisselle" time="19h" assignee="Tom" done={false} onToggle={onToggle} />
    </TamaguiProvider>
  )
  fireEvent.press(screen.getByRole('button', { name: /à faire/i }))
  expect(onToggle).toHaveBeenCalledTimes(1)
})
```

## Variante J+30 (fading)

Reprends **sans relire le corrigé**, en 25 minutes : ajoute au design system un composant **`FamilyDashboard`** (`styled(YStack)`) qui affiche un titre (`$heading`, `$6`) et une rangée `XStack` de trois stats (routines faites / à faire / membres). Contrainte : un variant `density` (`compact` | `comfortable`) qui change seulement le `padding` et le `gap` — via tokens. Vérifie que `density` est typé (donc `as const`).

## Application TribuZen

Porte ces fichiers dans `smaurier/tribuzen` sous `packages/ui/` : `tamagui.config.ts`, `PrimaryButton.tsx`, `RoutineCard.tsx`, `FamilyDashboard.tsx`, plus `GazettePreview.tsx`. Branche `TamaguiProvider` dans `apps/web` (Next.js) et `apps/mobile` (Expo) avec la **même** config. Ajoute `RoutineCard.test.tsx` (`@testing-library/react-native`). Commit sur `smaurier/tribuzen` :

```
feat(ui): design system Tamagui cross-platform — config tokens + composants core partagés
```

C'est la fin du parcours Design System : un seul système de design alimente désormais le web ET le mobile TribuZen.
