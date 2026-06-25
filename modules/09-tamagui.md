# Module 09 — Tamagui : design system cross-platform (Web + React Native)

| Difficulté | Durée estimée |
|------------|---------------|
| 4/5        | 120 min       |

> **Prérequis** : Module 02 (Tailwind CSS) + Module 05 (Design Tokens). Avoir suivi le cours React Native (cours mobile) est un plus mais pas bloquant.

## Objectifs

- Comprendre pourquoi Tamagui résout le problème web/RN en un seul système
- Configurer Tamagui dans Next.js + Expo (setup monorepo simple)
- Maîtriser les primitives de layout : Stack, XStack, YStack
- Créer et thématiser des composants avec `styled()`
- Implémenter le thème TribuZen complet
- Gérer les différences plateforme avec `$platform-*`
- Comprendre l'intégration animations (Reanimated)

---

## Pourquoi Tamagui ?

```
Problème sans Tamagui :
  Web admin (Next.js) :
    → Tailwind + shadcn/ui + Radix UI
    → Framer Motion pour les animations
  App mobile (React Native Expo) :
    → NativeWind (Tailwind-like)
    → react-native-paper OU composants custom
    → Reanimated pour les animations

  Résultat : 2 systèmes, 2 configs, 2 fois le travail.
  Un changement de couleur = modifier 2 endroits.
  Un composant = 2 versions à maintenir.

Avec Tamagui :
  → Un seul package de composants
  → Un seul fichier de tokens (couleurs, spacing, typo)
  → Un seul thème (light/dark)
  → Fonctionne sur web (Next.js) ET React Native (Expo)
  → Compile en CSS sur web, StyleSheet natif sur RN
  → Performance native : zéro runtime overhead sur RN
```

---

## Architecture TribuZen avec Tamagui

```
tribuzen/
├── apps/
│   ├── web/          ← Next.js (admin, settings)
│   └── mobile/       ← Expo React Native (app principale)
└── packages/
    └── ui/           ← Composants Tamagui partagés
        ├── tamagui.config.ts
        ├── components/
        │   ├── RoutineCard.tsx
        │   ├── FamilyDashboard.tsx
        │   └── ...
        └── tokens/
            └── tribuzen.ts

Note V1 (sans monorepo) : un seul fichier tamagui.config.ts
copié dans web/ et mobile/ — migrer en monorepo quand ça scale.
```

---

## Installation

### Dans Next.js (web admin)

```bash
npm install tamagui @tamagui/core @tamagui/config
npm install --save-dev @tamagui/next-plugin
```

```ts
// next.config.ts
import { withTamagui } from '@tamagui/next-plugin'

export default withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui', '@tamagui/core'],
})
```

### Dans Expo (app mobile)

```bash
npx expo install tamagui @tamagui/core @tamagui/config
npx expo install @tamagui/babel-plugin
```

```json
// babel.config.js
{
  "presets": ["babel-preset-expo"],
  "plugins": [
    ["@tamagui/babel-plugin", {
      "config": "./tamagui.config.ts",
      "components": ["tamagui", "@tamagui/core"]
    }]
  ]
}
```

---

## Configuration — le cœur du système

```ts
// tamagui.config.ts
import { createTamagui, createTokens } from '@tamagui/core'
import { config as defaultConfig } from '@tamagui/config/v4'

// 1. Design tokens TribuZen
const tokens = createTokens({
  color: {
    sauge50:       '#f0f3f0',
    sauge100:      '#d6dfd6',
    sauge500:      '#6B7E6B',  // primary
    sauge700:      '#4a5a4a',
    terracotta500: '#C4785A',  // secondary
    terracotta700: '#a05a3e',
    chaud50:       '#FDFCF9',
    chaud100:      '#F8F5F0',  // background
    anthracite:    '#2C2C2C',  // text
    ambre500:      '#D4A017',  // warning, JAMAIS rouge
    white:         '#FFFFFF',
    black:         '#000000',
  },
  space: {
    $0:  0,
    $1:  4,
    $2:  8,
    $3:  12,
    $4:  16,
    $5:  20,
    $6:  24,
    $8:  32,
    $10: 40,
    $12: 48,
    $16: 64,
  },
  size: {
    $1:  36,   // touch target minimum
    $2:  44,   // touch target confortable (WCAG)
    $3:  56,
    $4:  64,
    true: 44,  // défaut
  },
  radius: {
    $1: 4,
    $2: 8,
    $3: 12,
    $4: 16,
    $5: 24,
    $round: 1000,
    true: 8,
  },
  zIndex: {
    $1: 100,
    $2: 200,
    $3: 300,
    $4: 400,
    $5: 500,
  },
})

// 2. Thèmes light / dark
const lightTheme = {
  background:        tokens.color.chaud100,
  backgroundHover:   tokens.color.chaud50,
  backgroundFocus:   tokens.color.sauge50,
  color:             tokens.color.anthracite,
  colorHover:        tokens.color.sauge700,
  placeholderColor:  '#9ca3af',
  borderColor:       '#e5e7eb',
  borderColorHover:  tokens.color.sauge500,

  // Sémantique TribuZen
  primary:           tokens.color.sauge500,
  primaryHover:      tokens.color.sauge700,
  secondary:         tokens.color.terracotta500,
  secondaryHover:    tokens.color.terracotta700,
  warning:           tokens.color.ambre500,
  // Pas de 'danger' rouge — design TribuZen : ambre pour tout ce qui alerte
}

const darkTheme = {
  background:        '#1a1f1a',
  backgroundHover:   '#222722',
  backgroundFocus:   '#2a322a',
  color:             '#e8ece8',
  colorHover:        tokens.color.sauge100,
  placeholderColor:  '#6b7280',
  borderColor:       '#374137',
  borderColorHover:  tokens.color.sauge500,
  primary:           tokens.color.sauge500,
  primaryHover:      tokens.color.sauge100,
  secondary:         tokens.color.terracotta500,
  secondaryHover:    '#d9896b',
  warning:           tokens.color.ambre500,
}

// 3. Config finale
export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  tokens,
  themes: {
    light: lightTheme,
    dark:  darkTheme,
  },
  fonts: {
    heading: {
      family:   'Fraunces',
      size:     { ...defaultConfig.fonts.heading.size },
      weight:   { normal: '400', bold: '700' },
    },
    body: {
      family:   'Inter',
      size:     { ...defaultConfig.fonts.body.size },
      weight:   { normal: '400', medium: '500', bold: '700' },
    },
  },
  settings: {
    allowedStyleValues: 'somewhat-strict',
    autocompleteSpecificTokens: 'except-special',
  },
})

export type AppConfig = typeof tamaguiConfig
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig
```

---

## Provider — point d'entrée

```tsx
// apps/web/_app.tsx (Next.js)
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../tamagui.config'

export default function App({ Component, pageProps }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <Component {...pageProps} />
    </TamaguiProvider>
  )
}

// apps/mobile/app/_layout.tsx (Expo)
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../tamagui.config'
import { useColorScheme } from 'react-native'

export default function RootLayout({ children }) {
  const scheme = useColorScheme()
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={scheme ?? 'light'}>
      {children}
    </TamaguiProvider>
  )
}
```

---

## Primitives de layout

```tsx
// Stack = View flex avec flexDirection column (défaut)
// XStack = flexDirection row
// YStack = flexDirection column (identique à Stack)

import { Stack, XStack, YStack, Text } from 'tamagui'

// Équivalent React Native View + flexbox
function RoutineItem({ title, assignee }) {
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      padding="$4"
      backgroundColor="$background"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderColor"
      marginBottom="$2"
      // Hover sur web uniquement (ignoré sur RN)
      hoverStyle={{ backgroundColor: '$backgroundHover' }}
    >
      <YStack flex={1}>
        <Text fontFamily="$body" fontWeight="500" color="$color">
          {title}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$placeholderColor">
          {assignee}
        </Text>
      </YStack>

      <Stack
        width={24}
        height={24}
        borderRadius="$round"
        backgroundColor="$primary"
      />
    </XStack>
  )
}
```

---

## styled() — composants personnalisés

```tsx
import { styled, Stack, Text, XStack } from 'tamagui'

// Bouton TribuZen primaire
export const PrimaryButton = styled(Stack, {
  name: 'PrimaryButton',

  // Styles de base
  backgroundColor: '$primary',
  borderRadius:    '$3',
  paddingVertical:  '$3',
  paddingHorizontal:'$5',
  alignItems:      'center',
  justifyContent:  'center',
  minHeight:       '$2',  // 44px — touch target WCAG

  // États
  pressStyle:   { backgroundColor: '$primaryHover', scale: 0.98 },
  hoverStyle:   { backgroundColor: '$primaryHover' },
  focusStyle:   { outlineWidth: 2, outlineColor: '$primary', outlineStyle: 'solid' },
  disabledStyle:{ opacity: 0.5 },

  // Variants
  variants: {
    variant: {
      secondary: {
        backgroundColor: 'transparent',
        borderWidth:     1,
        borderColor:     '$primary',
        pressStyle:      { backgroundColor: '$backgroundFocus' },
      },
      ghost: {
        backgroundColor: 'transparent',
        pressStyle:      { backgroundColor: '$backgroundFocus' },
      },
    },
    size: {
      sm: { paddingVertical: '$2', paddingHorizontal: '$3', minHeight: '$1' },
      lg: { paddingVertical: '$4', paddingHorizontal: '$6', minHeight: '$3' },
    },
  } as const,
})

export const ButtonText = styled(Text, {
  fontFamily:  '$body',
  fontWeight:  '600',
  color:       '$background',  // blanc chaud sur fond sauge
  variants: {
    variant: {
      secondary: { color: '$primary' },
      ghost:     { color: '$primary' },
    },
  } as const,
})

// Utilisation
function CheckButton({ onPress, done }) {
  return (
    <PrimaryButton
      variant={done ? 'secondary' : undefined}
      onPress={onPress}
      // Accessibilité RN
      accessible
      accessibilityRole="button"
      accessibilityLabel={done ? 'Routine complétée' : 'Marquer comme complétée'}
    >
      <ButtonText variant={done ? 'secondary' : undefined}>
        {done ? '✓ Complétée' : 'Terminer'}
      </ButtonText>
    </PrimaryButton>
  )
}
```

---

## Différences plateforme avec $platform-*

```tsx
import { Stack } from 'tamagui'

// Styles spécifiques à une plateforme
const PlatformCard = styled(Stack, {
  padding:          '$4',
  backgroundColor:  '$background',
  borderRadius:     '$3',

  // Web uniquement
  $platform-web: {
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    cursor:    'pointer',
  },

  // iOS uniquement
  $platform-ios: {
    shadowColor:   '#000',
    shadowOpacity: 0.08,
    shadowRadius:  4,
    shadowOffset:  { width: 0, height: 1 },
  },

  // Android uniquement
  $platform-android: {
    elevation: 2,
  },
})
```

---

## Composant TribuZen — RoutineCard complète

```tsx
import { styled, Stack, XStack, YStack, Text } from 'tamagui'
import { Pressable } from 'react-native'

interface RoutineCardProps {
  title:     string
  emoji:     string
  time:      string
  assignee:  string
  done:      boolean
  onToggle:  () => void
}

const Card = styled(Stack, {
  backgroundColor: '$background',
  borderRadius:    '$3',
  padding:         '$4',
  borderWidth:     1,
  borderColor:     '$borderColor',
  marginBottom:    '$3',

  $platform-web: {
    boxShadow:  '0 1px 3px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s ease',
    hoverStyle: { boxShadow: '0 3px 8px rgba(0,0,0,0.10)' },
  },

  $platform-ios: {
    shadowColor:   '#000',
    shadowOpacity: 0.06,
    shadowRadius:  3,
    shadowOffset:  { width: 0, height: 1 },
  },

  $platform-android: { elevation: 1 },

  variants: {
    done: {
      true: {
        borderColor:     '$primary',
        backgroundColor: '$backgroundFocus',
      },
    },
  } as const,
})

export function RoutineCard({ title, emoji, time, assignee, done, onToggle }: RoutineCardProps) {
  return (
    <Card
      done={done}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${done ? 'complétée' : 'à faire'}`}
      accessibilityHint="Appuyer pour basculer l'état de la routine"
      onPress={onToggle}
    >
      <XStack alignItems="center" gap="$3">
        <Text fontSize="$6">{emoji}</Text>

        <YStack flex={1}>
          <Text
            fontFamily="$heading"
            fontSize="$4"
            color={done ? '$primary' : '$color'}
            textDecorationLine={done ? 'line-through' : 'none'}
          >
            {title}
          </Text>
          <Text fontFamily="$body" fontSize="$2" color="$placeholderColor">
            {time} · {assignee}
          </Text>
        </YStack>

        {/* Indicateur complétion */}
        <Stack
          width={24}
          height={24}
          borderRadius="$round"
          backgroundColor={done ? '$primary' : 'transparent'}
          borderWidth={2}
          borderColor={done ? '$primary' : '$borderColor'}
          alignItems="center"
          justifyContent="center"
        >
          {done && <Text color="white" fontSize={12}>✓</Text>}
        </Stack>
      </XStack>
    </Card>
  )
}
```

---

## Dark mode

```tsx
import { useTheme, Stack, Text } from 'tamagui'
import { useColorScheme } from 'react-native'  // ou next-themes sur web

// Via ThemeProvider (recommandé)
// Le thème 'dark' est géré par TamaguiProvider defaultTheme
// Les tokens $background, $color, etc. changent automatiquement

// Accès programmatique au thème courant
function ThemeAwareComponent() {
  const theme = useTheme()

  return (
    <Stack backgroundColor="$background" padding="$4">
      <Text color="$color">
        Couleur primaire : {theme.primary?.val}
      </Text>
    </Stack>
  )
}
```

---

## Animations avec Reanimated

```tsx
import { Stack } from 'tamagui'
import { createAnimations } from '@tamagui/animations-reanimated'

// Dans tamagui.config.ts
const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 15,
    mass: 0.8,
    stiffness: 250,
  },
  gentle: {
    type: 'spring',
    damping: 20,
    stiffness: 160,
  },
  fast: {
    type: 'timing',
    duration: 200,
  },
})

// Utilisation
function AnimatedCard() {
  const [visible, setVisible] = useState(false)

  return (
    <Stack
      animation="bouncy"        // référence une animation de la config
      opacity={visible ? 1 : 0}
      scale={visible ? 1 : 0.95}
      y={visible ? 0 : 8}
      // prefers-reduced-motion : Tamagui le respecte automatiquement sur web
    >
      {/* contenu */}
    </Stack>
  )
}
```

---

## shadcn/ui vs Tamagui — quand utiliser quoi

```
shadcn/ui (modules 03+04) → GARDER pour :
  → Web admin Next.js exclusivement (table admin, formulaires complexes)
  → Composants très riches non disponibles dans Tamagui (DataTable, Calendar)
  → Contexte où le code web ne sera jamais partagé avec RN

Tamagui → UTILISER pour :
  → Tout ce qui est partagé web + mobile
  → Composants TribuZen "produit" : RoutineCard, DashboardHeader, etc.
  → Design tokens (couleurs, spacing, typo) → source unique de vérité

Règle TribuZen :
  → packages/ui (composants produit) = Tamagui UNIQUEMENT
  → apps/web/components/admin = shadcn/ui OK pour les outils internes
```

---

## Checklist

- [ ] `tamagui.config.ts` avec les tokens TribuZen (palette complète, spacing, radius)
- [ ] Provider configuré dans Next.js ET Expo
- [ ] Primitives Stack/XStack/YStack maîtrisées
- [ ] `styled()` utilisé pour au moins 3 composants custom
- [ ] `$platform-web` / `$platform-ios` / `$platform-android` testés
- [ ] Dark mode fonctionnel (thèmes light/dark dans la config)
- [ ] Animations Reanimated intégrées (au moins 1 composant animé)
- [ ] RoutineCard TribuZen implémentée avec accessibilité RN
- [ ] Comprendre quand utiliser shadcn/ui vs Tamagui dans TribuZen
