---
titre: Tamagui — design system cross-platform (web + React Native)
cours: 21-design-system
notions: [design system cross-platform, tamagui.config.ts, tokens partagés web+RN, createTokens, createFont, thèmes clair/sombre, styled et variants, primitives Stack/XStack/YStack, media queries et $platform, compilateur optimisant, Tamagui vs shadcn]
outcomes: [configurer un tamagui.config.ts comme source unique des tokens web et React Native, créer des composants stylés avec styled et des variants typés, choisir entre Tamagui et shadcn selon la cible]
prerequis: [08-accessibilite]
next: fin-du-parcours
libs: [{ name: react, version: "^19" }, { name: "@tamagui/core", version: "latest" }]
tribuzen: design system unique (tokens + composants core RoutineCard/FamilyDashboard/PrimaryButton/GazettePreview) partagé entre l'app web et l'app mobile TribuZen
last-reviewed: 2026-07
---

# Tamagui — design system cross-platform (web + React Native)

> **Outcomes — tu sauras FAIRE :** configurer un `tamagui.config.ts` comme source unique des tokens web ET React Native, créer des composants stylés avec `styled()` et des variants typés, choisir entre Tamagui et shadcn selon la cible.
> **Difficulté :** :star::star::star::star:

> Dernier module du cours **Design System & UI/UX**. C'est l'aboutissement : tout ce que tu as posé (tokens du module 05, composants du module 04, accessibilité du module 08) converge ici en **un seul système de design** qui alimente à la fois le web et le mobile de TribuZen.

## 1. Cas concret d'abord

TribuZen a deux surfaces : une **app web** (Next.js — admin famille, réglages, gazette imprimable) et une **app mobile** (React Native / Expo — le quotidien des familles). Tu as construit la carte de routine deux fois :

```tsx
// web/components/RoutineCard.tsx — Tailwind + shadcn
export function RoutineCard({ title, done }: Props) {
  return (
    <div className={`rounded-xl border p-4 ${done ? 'border-sauge-500 bg-sauge-50' : 'border-gray-200'}`}>
      <h3 className="font-heading text-lg">{title}</h3>
    </div>
  );
}
```

```tsx
// mobile/components/RoutineCard.tsx — StyleSheet React Native
export function RoutineCard({ title, done }: Props) {
  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 16 },
  cardDone: { borderColor: '#6B7E6B', backgroundColor: '#f0f3f0' },
  title: { fontFamily: 'Fraunces', fontSize: 18 },
});
```

**Trois problèmes immédiats :**
1. La couleur `sauge500` (`#6B7E6B`) est écrite en dur **aux deux endroits**. Le designer la change → tu modifies deux fichiers, dans deux langages de style différents (classes Tailwind vs objets `StyleSheet`).
2. Le composant existe en **deux exemplaires** à maintenir en parallèle. Un bug de padding se corrige deux fois.
3. Impossible de garantir que le web et le mobile restent visuellement synchronisés — ils dérivent.

Tamagui résout exactement ça : **un** fichier de config, **un** composant, qui compile en CSS atomique sur web et en `StyleSheet` natif sur React Native. Ce module te donne la source unique de vérité.

---

## 2. Théorie complète, concise

### 2.1 Le problème que Tamagui résout : un design system cross-platform

Tamagui est une bibliothèque de style + un kit d'UI pour **React et React Native**, avec un **compilateur optimisant**. Le même code composant tourne sur les deux plateformes :

| | Web (Next.js) | React Native (Expo) |
|---|---|---|
| Sortie du compilateur | CSS atomique statique | `StyleSheet` natif |
| Runtime overhead | quasi nul (styles extraits) | quasi nul |
| Tokens | mêmes `$tokens` | mêmes `$tokens` |
| Composant écrit | **une fois** | **une fois** |

L'idée-clé : tu n'écris **jamais** de valeur de style en dur. Tu références des **tokens** (`$primary`, `$4`, `$3`) définis une seule fois. Web et mobile lisent la même table.

### 2.2 `tamagui.config.ts` — le cœur du système

Toute la configuration passe par `createTamagui()`, qui reçoit `tokens`, `themes`, `fonts`, `media`, `shorthands`, `animations`, `settings`. C'est **le** fichier source de vérité du design system.

```ts
import { createTamagui } from '@tamagui/core'

const config = createTamagui({
  tokens,   // valeurs brutes : couleurs, espacements, rayons…
  themes,   // mappings sémantiques : light / dark
  fonts,    // familles + échelles typographiques
  media,    // breakpoints responsives
})

export default config
```

### 2.3 `createTokens` — les valeurs brutes partagées

Les tokens sont les **primitives sans sémantique** : une palette, une échelle d'espacement, des rayons. On les référence ensuite avec le préfixe `$`.

```ts
import { createTokens } from '@tamagui/core'

export const tokens = createTokens({
  color: {
    sauge50:       '#f0f3f0',
    sauge100:      '#d6dfd6',
    sauge500:      '#6B7E6B',   // primaire TribuZen
    sauge700:      '#4a5a4a',
    terracotta500: '#C4785A',   // secondaire
    chaud100:      '#F8F5F0',   // fond
    anthracite:    '#2C2C2C',   // texte
    ambre500:      '#D4A017',   // alerte (jamais rouge, choix TribuZen)
    white:         '#FFFFFF',
  },
  space:  { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, true: 16 },
  size:   { 1: 36, 2: 44, 3: 56, true: 44 },   // 44 = touch target WCAG
  radius: { 1: 4, 2: 8, 3: 12, 4: 16, round: 1000, true: 8 },
  zIndex: { 1: 100, 2: 200, 3: 300 },
})
```

> **Convention :** dans les tokens, les clés numériques se référencent `$4`, `$2`… et `true` est la valeur par défaut d'une catégorie (`padding="$true"` ou implicite). `size.2 = 44` sert de cible tactile minimale (rappel accessibilité, module 08).

### 2.4 Thèmes clair / sombre — la couche sémantique

Les **thèmes** donnent un *sens* aux tokens : `background`, `color`, `primary`… Un composant ne référence jamais `sauge500` directement, il référence `$primary`. Changer de thème (light → dark) échange les valeurs **sans toucher les composants**.

```ts
const light = {
  background:      tokens.color.chaud100,
  backgroundHover: tokens.color.sauge50,
  color:           tokens.color.anthracite,
  borderColor:     '#e5e7eb',
  primary:         tokens.color.sauge500,
  primaryHover:    tokens.color.sauge700,
  secondary:       tokens.color.terracotta500,
  warning:         tokens.color.ambre500,
}

const dark = {
  background:      '#1a1f1a',
  backgroundHover: '#222722',
  color:           '#e8ece8',
  borderColor:     '#374137',
  primary:         tokens.color.sauge500,
  primaryHover:    tokens.color.sauge100,
  secondary:       tokens.color.terracotta500,
  warning:         tokens.color.ambre500,
}

export const themes = { light, dark }
```

> Certains noms de sous-tokens (`background`, `backgroundHover`, `backgroundPress`, `color`, `borderColor`…) sont **reconnus par convention** : les composants Tamagui les consomment automatiquement pour les états hover/press/focus.

### 2.5 `createFont` — l'échelle typographique

Les fonts se déclarent avec `createFont` : une famille + des échelles indexées (`size`, `lineHeight`, `weight`, `letterSpacing`) et, sur natif, une map `face` qui associe un poids à un fichier de police chargé.

```ts
import { createFont } from '@tamagui/core'

const headingFont = createFont({
  family: 'Fraunces, Georgia, serif',
  size:       { 3: 15, 4: 18, 5: 22, 6: 28, true: 18 },
  lineHeight: { 4: 24, 5: 28, 6: 34 },
  weight:     { 4: '400', 7: '700' },
  face: {                                  // natif : lie poids → fichier chargé
    400: { normal: 'Fraunces-Regular' },
    700: { normal: 'Fraunces-Bold' },
  },
})

const bodyFont = createFont({
  family: 'Inter, Helvetica, Arial, sans-serif',
  size:       { 2: 14, 3: 15, 4: 16, true: 16 },
  lineHeight: { 2: 20, 3: 22, 4: 24 },
  weight:     { 4: '400', 6: '600' },
})

export const fonts = { heading: headingFont, body: bodyFont }
```

On les référence ensuite par `fontFamily="$heading"` / `"$body"` et `fontSize="$4"`.

### 2.6 Primitives de layout : `Stack`, `XStack`, `YStack`

Tamagui remplace `<div>` / `<View>` par des primitives flex **prêtes à recevoir des tokens** :

- `YStack` — colonne (`flexDirection: 'column'`), l'empilement vertical par défaut.
- `XStack` — ligne (`flexDirection: 'row'`).
- `Stack` — la primitive brute (colonne par défaut) ; `XStack`/`YStack` sont des `Stack` préconfigurés.

```tsx
import { XStack, YStack, Text } from 'tamagui'

function RoutineRow({ title, assignee }: { title: string; assignee: string }) {
  return (
    <XStack ai="center" jc="space-between" p="$4" br="$3" bw={1} bc="$borderColor" gap="$3">
      <YStack f={1}>
        <Text fontFamily="$body" fontWeight="600" color="$color">{title}</Text>
        <Text fontFamily="$body" fontSize="$2" color="$borderColor">{assignee}</Text>
      </YStack>
    </XStack>
  );
}
```

> `ai`, `jc`, `p`, `br`, `bw`, `bc`, `f` sont des **shorthands** (`alignItems`, `justifyContent`, `padding`, `borderRadius`, `borderWidth`, `borderColor`, `flex`) déclarés dans la config. Les valeurs `$4`, `$3` piochent dans les tokens.

### 2.7 `styled()` et variants — tes composants du design system

`styled(Base, {...})` crée un composant réutilisable avec des styles de base, des états (`hoverStyle`, `pressStyle`, `focusStyle`, `disabledStyle`) et des **variants** (props qui appliquent un bloc de styles). Le `as const` sur `variants` est **obligatoire** pour que TypeScript infère les props.

```tsx
import { styled, Stack, Text } from 'tamagui'

export const PrimaryButton = styled(Stack, {
  name: 'PrimaryButton',
  backgroundColor: '$primary',
  borderRadius:    '$3',
  paddingVertical: '$3',
  paddingHorizontal: '$5',
  ai: 'center',
  jc: 'center',
  minHeight: '$2',                 // 44px — cible tactile WCAG (module 08)

  hoverStyle:    { backgroundColor: '$primaryHover' },
  pressStyle:    { backgroundColor: '$primaryHover', scale: 0.98 },
  focusStyle:    { outlineWidth: 2, outlineColor: '$primary', outlineStyle: 'solid' },
  disabledStyle: { opacity: 0.5 },

  variants: {
    tone: {                        // variant "énumérée"
      secondary: { backgroundColor: 'transparent', bw: 1, bc: '$primary' },
      ghost:     { backgroundColor: 'transparent' },
    },
    block: {                       // variant "booléenne" → true:
      true: { alignSelf: 'stretch' },
    },
  } as const,
})
```

Usage : `<PrimaryButton tone="secondary" block>…</PrimaryButton>`. Les props `tone` et `block` sont **typées** automatiquement.

### 2.8 Différences plateforme : `$platform-*` et `media`

Un design system cross-platform doit gérer les écarts (ombres, hover, breakpoints). Deux outils :

- **`$platform-web` / `$platform-ios` / `$platform-android`** — styles conditionnels par plateforme. Comme prop JSX : `$platform-ios={{ ... }}`. Comme **clé** dans un objet `styled()`, il faut la **quoter** : `'$platform-web': { ... }`.
- **`media`** (breakpoints déclarés en config) — styles responsives : `$gtSm={{ ... }}`.

```tsx
const PlatformCard = styled(Stack, {
  p: '$4', br: '$3', backgroundColor: '$background',
  '$platform-web':     { boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'pointer' },
  '$platform-ios':     { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 },
  '$platform-android': { elevation: 2 },
})
```

### 2.9 Le compilateur optimisant

Sans compilateur, Tamagui fonctionne quand même (mode runtime). **Avec** le plugin de build (`@tamagui/next-plugin` sur web, `@tamagui/babel-plugin` sur Expo), il **extrait les styles à la compilation** :
- sur web → CSS atomique statique (pas de calcul de style au runtime) ;
- sur natif → objets `StyleSheet` figés.

Résultat : le confort d'un système à tokens **sans le coût runtime** d'un CSS-in-JS classique. C'est l'argument différenciant de Tamagui vs styled-components.

### 2.10 Provider — brancher la config

`TamaguiProvider` injecte la config et le thème actif à la racine de chaque app. **Même config**, deux entrées :

```tsx
// web — app/providers.tsx (Next.js)
import { TamaguiProvider } from 'tamagui'
import config from '../tamagui.config'

export function Providers({ children }: { children: React.ReactNode }) {
  return <TamaguiProvider config={config} defaultTheme="light">{children}</TamaguiProvider>
}
```

```tsx
// mobile — app/_layout.tsx (Expo)
import { TamaguiProvider } from 'tamagui'
import { useColorScheme } from 'react-native'
import config from '../tamagui.config'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme()
  return <TamaguiProvider config={config} defaultTheme={scheme ?? 'light'}>{children}</TamaguiProvider>
}
```

### 2.11 Tamagui vs shadcn — quand utiliser quoi

Tu as les deux dans ta boîte à outils. Ils ne se concurrencent pas, ils couvrent des cibles différentes :

| Besoin | Outil |
|---|---|
| Web admin uniquement (tables, formulaires riches, DataTable, Calendar) | **shadcn/ui** (modules 03-04) |
| Code qui ne sera **jamais** partagé avec le mobile | **shadcn/ui** |
| Tout ce qui est **partagé web + mobile** (produit) | **Tamagui** |
| Composants « produit » TribuZen : `RoutineCard`, `FamilyDashboard`, `PrimaryButton`, `GazettePreview` | **Tamagui** |
| Design tokens (source unique couleurs / spacing / typo) | **Tamagui** |

**Règle TribuZen :** `packages/ui` (composants produit partagés) = Tamagui uniquement ; `apps/web/components/admin` = shadcn OK pour les outils internes web-only.

---

## 3. Worked examples

### Exemple 1 — `tamagui.config.ts` complet (source unique TribuZen)

Assemblage de tout ce qui précède en **un** fichier. C'est celui qui sera copié (ou importé du package `ui`) par le web ET le mobile.

```ts
// tamagui.config.ts
import { createFont, createTamagui, createTokens } from '@tamagui/core'

// 1. Tokens — valeurs brutes sans sémantique
const tokens = createTokens({
  color: {
    sauge50: '#f0f3f0', sauge100: '#d6dfd6', sauge500: '#6B7E6B', sauge700: '#4a5a4a',
    terracotta500: '#C4785A', chaud100: '#F8F5F0', anthracite: '#2C2C2C',
    ambre500: '#D4A017', white: '#FFFFFF',
  },
  space:  { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, true: 16 },
  size:   { 1: 36, 2: 44, 3: 56, true: 44 },
  radius: { 1: 4, 2: 8, 3: 12, 4: 16, round: 1000, true: 8 },
  zIndex: { 1: 100, 2: 200, 3: 300 },
})

// 2. Fonts — échelle typographique
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

// 3. Thèmes — couche sémantique
const light = {
  background: tokens.color.chaud100, backgroundHover: tokens.color.sauge50,
  color: tokens.color.anthracite, borderColor: '#e5e7eb',
  primary: tokens.color.sauge500, primaryHover: tokens.color.sauge700,
  secondary: tokens.color.terracotta500, warning: tokens.color.ambre500,
}
const dark = {
  background: '#1a1f1a', backgroundHover: '#222722',
  color: '#e8ece8', borderColor: '#374137',
  primary: tokens.color.sauge500, primaryHover: tokens.color.sauge100,
  secondary: tokens.color.terracotta500, warning: tokens.color.ambre500,
}

// 4. Config finale
const config = createTamagui({
  tokens,
  fonts: { heading, body },
  themes: { light, dark },
  media: {
    sm:   { maxWidth: 860 },
    gtSm: { minWidth: 861 },
  },
  shorthands: {
    p: 'padding', px: 'paddingHorizontal', py: 'paddingVertical',
    br: 'borderRadius', bw: 'borderWidth', bc: 'borderColor',
    ai: 'alignItems', jc: 'justifyContent', f: 'flex',
  } as const,
})

// 5. Typage global — autocomplétion des tokens partout
type AppConfig = typeof config
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
```

**Ce que ce fichier garantit :** changer `sauge500` ici met à jour `$primary` sur web ET sur mobile, en un endroit. Fin du problème du cas concret.

### Exemple 2 — `RoutineCard` partagée, écrite une seule fois

Le composant produit qui existait en double (web + RN) devient **un** fichier consommé par les deux apps.

```tsx
// packages/ui/RoutineCard.tsx
import { styled, Stack, XStack, YStack, Text } from 'tamagui'

interface RoutineCardProps {
  title: string;
  time: string;
  assignee: string;
  done: boolean;
  onToggle: () => void;
}

// Frame stylé avec un variant booléen "done"
const CardFrame = styled(Stack, {
  name: 'RoutineCard',
  backgroundColor: '$background',
  br: '$3', p: '$4', bw: 1, bc: '$borderColor', mb: '$3',

  // Ombre par plateforme — clés quotées dans styled()
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
      // Accessibilité cross-platform (module 08) : rôle + label explicites
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

        {/* Pastille de complétion — tokens, jamais de couleur en dur */}
        <Stack
          width={24} height={24} br="$round"
          ai="center" jc="center" bw={2}
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

**Ce que ce composant apporte :**
- `onPress` marche sur les deux plateformes (sur web, Tamagui le mappe vers un clic).
- `$primary`, `$background`, `$3`… lisent la config → cohérence web/mobile automatique.
- Le variant `done` remplace le `done && styles.cardDone` dupliqué du cas concret.
- L'accessibilité (`accessibilityRole`, `accessibilityLabel`) est portée par le composant partagé — plus de divergence a11y entre web et mobile.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Oublier `as const` sur `variants`

```tsx
// ❌ Sans as const — TS n'infère pas les props, `tone` n'est pas typé
export const Button = styled(Stack, {
  variants: { tone: { secondary: { bc: '$primary' } } },
});
// <Button tone="secondary" /> → pas d'autocomplétion, pas d'erreur si faute de frappe

// ✅ Avec as const — `tone: 'secondary'` est typé et vérifié
export const Button = styled(Stack, {
  variants: { tone: { secondary: { bc: '$primary' } } } as const,
});
```

**Règle :** un bloc `variants` **finit toujours** par `} as const`. Sans lui, tu perds tout l'intérêt du typage.

### PIÈGE #2 — `$platform-web` non quoté comme clé d'objet

```tsx
// ❌ Erreur de syntaxe TypeScript — le tiret casse l'identifiant
const Card = styled(Stack, {
  $platform-web: { boxShadow: '...' },   // SyntaxError
});

// ✅ En clé d'objet styled() → quoter
const Card = styled(Stack, {
  '$platform-web': { boxShadow: '...' },
});
```

```tsx
// ✅ En prop JSX → pas besoin de quoter (le JSX l'accepte)
<Stack $platform-ios={{ shadowRadius: 4 }} />
```

**Discrimination :** clé d'objet = quotée ; prop JSX = non quotée. Deux contextes, deux règles.

### PIÈGE #3 — Confondre token et thème (mettre `sauge500` en dur dans un composant)

```tsx
// ❌ Couleur brute dans le composant — casse le dark mode
<Stack backgroundColor={tokens.color.sauge500} />   // ne change pas au thème sombre

// ✅ Référence sémantique — suit le thème actif
<Stack backgroundColor="$primary" />
```

**Pourquoi c'est faux :** un token brut (`sauge500`) a une valeur fixe. `$primary` est résolu **par le thème courant** — light ou dark. Un composant ne référence jamais un token brut, il référence la couche sémantique du thème.

### PIÈGE #4 — Croire que Tamagui remplace shadcn partout

```
❌ « Puisque Tamagui fait le web, je jette shadcn. »
   → Tu perds DataTable, Calendar, formulaires riches déjà accessibles,
     pour du web admin qui ne sera jamais partagé avec le mobile.

✅ shadcn = web admin riche & web-only.  Tamagui = tout le partagé web+mobile.
   Les deux cohabitent : packages/ui (Tamagui) + apps/web/admin (shadcn).
```

**Signal de décision :** « ce composant tournera-t-il un jour sur mobile ? » Oui → Tamagui. Non, et il est riche/web-only → shadcn.

### PIÈGE #5 — Attendre l'optimisation sans installer le plugin de build

Tamagui **fonctionne** sans compilateur (mode runtime), donc on croit que « c'est déjà optimisé ». Faux : l'extraction CSS atomique / `StyleSheet` figé n'a lieu qu'avec `@tamagui/next-plugin` (web) ou `@tamagui/babel-plugin` (Expo) configurés. Sans eux, tu paies un coût runtime évitable.

---

## 5. Ancrage TribuZen

Ce module est **l'aboutissement du cours** : un seul design system pour l'app web ET l'app mobile TribuZen.

**`tamagui.config.ts`** (`packages/ui/tamagui.config.ts`) — **la** source unique des tokens TribuZen. Palette sauge/terracotta/ambre du module 05, échelle d'espacement, rayons, thèmes clair/sombre, fonts Fraunces (titres) + Inter (corps). Web et mobile importent ce fichier. Changer une couleur = un seul endroit, propagé partout.

**Composants core partagés** (`packages/ui/`) écrits une fois, consommés par `apps/web` et `apps/mobile` :
- **`RoutineCard`** — la carte du cas concret et de l'Exemple 2 : routine du jour, état `done`, pastille de complétion.
- **`FamilyDashboard`** — le tableau de bord famille (`YStack` de sections, `XStack` de stats), même layout sur les deux surfaces.
- **`PrimaryButton`** — le bouton d'action TribuZen (`styled()` + variants `tone`/`block`), cible tactile 44px héritée du module 08.
- **`GazettePreview`** — l'aperçu de la gazette familiale, partagé entre l'app mobile (consultation) et le web (mise en page imprimable).

**Accessibilité (rappel module 08)** — les composants partagés portent `accessibilityRole` / `accessibilityLabel`, et on les teste avec **`@testing-library/react-native`** : on monte le composant, on requête par rôle/label, on vérifie que l'état (`done`) est correctement exposé. Le test vit à côté du composant dans `packages/ui`.

```tsx
// packages/ui/RoutineCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native'
import { TamaguiProvider } from 'tamagui'
import config from './tamagui.config'
import { RoutineCard } from './RoutineCard'

const renderWithTheme = (ui: React.ReactElement) =>
  render(<TamaguiProvider config={config} defaultTheme="light">{ui}</TamaguiProvider>)

test('expose le bon label a11y et déclenche onToggle', () => {
  const onToggle = jest.fn()
  renderWithTheme(
    <RoutineCard title="Ranger la chambre" time="18h" assignee="Léa" done={false} onToggle={onToggle} />
  )
  const btn = screen.getByRole('button', { name: /à faire/i })
  fireEvent.press(btn)
  expect(onToggle).toHaveBeenCalledTimes(1)
})
```

Arborescence cible dans `smaurier/tribuzen` :
```
tribuzen/
├── packages/
│   └── ui/                       ← design system Tamagui (partagé)
│       ├── tamagui.config.ts     ← source unique des tokens
│       ├── RoutineCard.tsx
│       ├── RoutineCard.test.tsx  ← @testing-library/react-native
│       ├── FamilyDashboard.tsx
│       ├── PrimaryButton.tsx
│       └── GazettePreview.tsx
└── apps/
    ├── web/                      ← Next.js  (importe packages/ui + shadcn pour l'admin)
    └── mobile/                   ← Expo RN  (importe packages/ui)
```

---

## 6. Points clés

1. Tamagui = un design system **cross-platform** : le même composant compile en CSS atomique sur web et en `StyleSheet` natif sur React Native.
2. `tamagui.config.ts` (via `createTamagui`) est la **source unique** : `tokens`, `themes`, `fonts`, `media`, `shorthands`.
3. `createTokens` définit les valeurs **brutes** (référencées `$4`, `$primary`) ; les **thèmes** leur donnent un sens sémantique et gèrent light/dark.
4. Un composant référence toujours la couche sémantique (`$primary`, `$background`) — **jamais** un token brut en dur, sinon le dark mode casse.
5. `styled(Base, { …, variants: {…} as const })` crée les composants du système ; `as const` est obligatoire pour le typage des variants.
6. `Stack` / `XStack` / `YStack` sont les primitives flex ; les shorthands (`p`, `br`, `ai`…) et les `$platform-*` / `media` gèrent style et écarts de plateforme.
7. Le **compilateur** (`next-plugin` / `babel-plugin`) extrait les styles au build → coût runtime quasi nul ; sans lui, mode runtime seulement.
8. **Tamagui pour le partagé web+mobile** (produit, tokens) ; **shadcn pour le web admin riche & web-only**. Les deux cohabitent.

---

## 7. Seeds Anki

```
Quel problème central Tamagui résout-il pour TribuZen ?|Écrire les composants et les tokens UNE fois pour web ET React Native. Le même code compile en CSS atomique sur web et en StyleSheet natif sur RN — plus de composant/couleur dupliqué entre les deux apps.
À quoi sert tamagui.config.ts ?|C'est la source unique de vérité du design system, passée à createTamagui : tokens (valeurs brutes), themes (light/dark sémantiques), fonts (createFont), media (breakpoints), shorthands. Web et mobile l'importent tous les deux.
Différence entre un token brut et un token de thème dans Tamagui ?|Un token brut (createTokens, ex. sauge500) a une valeur fixe. Un token de thème (ex. $primary) est résolu par le thème courant (light/dark). Un composant référence toujours $primary, jamais sauge500 en dur — sinon le dark mode ne change rien.
Pourquoi faut-il `as const` après un bloc variants dans styled() ?|Sans as const, TypeScript n'infère pas les valeurs littérales des variants : les props (ex. tone, size) ne sont ni typées ni autocomplétées. Avec as const, elles sont vérifiées à la compilation.
Comment écrire un style spécifique à une plateforme, en clé d'objet vs en prop JSX ?|En clé d'objet styled() il faut la quoter à cause du tiret : '$platform-web': { ... }. En prop JSX, pas besoin : $platform-ios={{ ... }}.
Quelles sont les primitives de layout Tamagui et leur direction ?|Stack = primitive flex (colonne par défaut) ; YStack = colonne ; XStack = ligne (flexDirection row). On les style avec des tokens et shorthands (p, br, ai, gap…).
Quand choisir Tamagui plutôt que shadcn dans TribuZen ?|Tamagui pour tout ce qui est partagé web + mobile (composants produit RoutineCard/FamilyDashboard/PrimaryButton/GazettePreview, tokens). shadcn pour le web admin riche et web-only (DataTable, Calendar, formulaires). Les deux cohabitent.
Qu'apporte le compilateur Tamagui et que se passe-t-il sans lui ?|Avec @tamagui/next-plugin (web) ou @tamagui/babel-plugin (Expo), il extrait les styles au build → CSS atomique / StyleSheet figé, coût runtime quasi nul. Sans plugin, Tamagui marche mais en mode runtime, moins optimisé.
```

---

## Pont vers le lab

> Lab associé : `21-design-system/labs/lab-09-tamagui/README.md`. Construire le `tamagui.config.ts` source unique de TribuZen, puis les composants core partagés (`PrimaryButton`, `RoutineCard`) avec `styled()` + variants, thème clair/sombre et accessibilité cross-platform. C'est le dernier lab du parcours — le design system complet, web + mobile.
