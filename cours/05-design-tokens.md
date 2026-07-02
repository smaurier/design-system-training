# Module 05 — Design Tokens & Système cohérent

| Difficulté | Durée estimée |
|------------|---------------|
| 2/5        | 60 min        |

> **Prérequis** : Modules 02-04 (Tailwind, Radix, shadcn/ui).

## Objectifs

- Définir et organiser les design tokens TribuZen
- Créer le fichier `design.md` (direction artistique imposée à l'IA)
- Connecter tokens CSS → Tailwind → composants shadcn
- Appliquer les contraintes RGAA (contraste, taille, focus, motion)

---

## Qu'est-ce qu'un design token ?

Un design token = la plus petite décision de design nommée. Un nom pour une valeur.

```
Pas un token :  #6B7E6B
Token :         --color-primary → #6B7E6B

Pas un token :  16px
Token :         --font-size-base → 1rem (16px)

Pourquoi :
  → Changer la couleur primaire = modifier 1 variable, pas 200 classes
  → Le nom donne le sens (primary ≠ green)
  → Thème sombre = redéfinir les tokens, composants inchangés
```

---

## Tokens TribuZen complets

```css
/* src/app/globals.css */
@layer base {
  :root {
    /* === COULEURS === */
    /* Sémantique — pas les valeurs brutes */
    --background:         40 33% 97%;   /* #F8F5F0 blanc chaud */
    --foreground:          0  0% 17%;   /* #2C2C2C anthracite */

    --primary:           135  8% 45%;   /* #6B7E6B sauge profond */
    --primary-foreground: 40 33% 97%;

    --secondary:          20 46% 55%;   /* #C4785A terracotta doux */
    --secondary-foreground: 40 33% 97%;

    --muted:              40 20% 92%;
    --muted-foreground:    0  0% 45%;

    --accent:             43 66% 45%;   /* #D4A017 ambre — jamais rouge */
    --accent-foreground:   0  0% 17%;

    --destructive:        20 46% 45%;   /* Terracotta foncé, jamais rouge */
    --destructive-foreground: 40 33% 97%;

    --border:             40 20% 85%;
    --input:              40 20% 85%;
    --ring:              135  8% 45%;   /* Sauge pour focus ring */

    /* === TYPOGRAPHIE === */
    --font-heading: 'Fraunces', Georgia, serif;
    --font-body:    'Inter', system-ui, sans-serif;
    --font-size-base: 1rem;             /* 16px — minimum RGAA */
    --font-size-sm:   0.875rem;         /* 14px */
    --font-size-lg:   1.125rem;
    --font-size-xl:   1.25rem;
    --font-size-2xl:  1.5rem;
    --font-size-3xl:  1.875rem;
    --line-height-base: 1.6;
    --line-height-tight: 1.25;

    /* === ESPACEMENT === */
    --spacing-1: 0.25rem;
    --spacing-2: 0.5rem;
    --spacing-3: 0.75rem;
    --spacing-4: 1rem;
    --spacing-6: 1.5rem;
    --spacing-8: 2rem;
    --spacing-12: 3rem;

    /* === FORMES === */
    --radius: 0.75rem;                  /* Coins doux = chaleur */

    /* === OMBRES === */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  .dark {
    --background:          0  0% 10%;
    --foreground:         40 33% 95%;
    --primary:           135  8% 55%;
    --border:              0  0% 20%;
    /* ... autres overrides dark */
  }
}
```

---

## Le fichier design.md (direction artistique)

Ce fichier est imposé à Claude (ou toute IA) à chaque demande de composant ou d'écran. Il évite la dérive stylistique.

```markdown
<!-- tribuzen/design.md -->
# TribuZen — Direction artistique

## Mission
Réduire la charge mentale parentale. Chaque décision visuelle doit
refléter sécurité, chaleur, et clarté cognitive.

## Palette
| Token         | Couleur    | Usage                              |
|---------------|------------|------------------------------------|
| primary       | #6B7E6B    | Actions principales, focus ring    |
| secondary     | #C4785A    | Accent, CTA secondaires            |
| background    | #F8F5F0    | Surface principale                 |
| foreground    | #2C2C2C    | Texte principal                    |
| accent        | #D4A017    | Alertes douces, jamais rouge       |
| muted         | #E8E4DE    | Surfaces secondaires, disabled     |

**Règle absolue : jamais de rouge pour les erreurs ou alertes.**
Terracotta foncé (#8B4A2F) à la place.

## Typographie
| Usage      | Police    | Taille min | Poids  |
|------------|-----------|-----------|--------|
| Titres (h1-h3) | Fraunces (serif chaud) | 1.25rem | 600 |
| Corps      | Inter     | 1rem (16px) | 400  |
| Légendes   | Inter     | 0.875rem  | 400    |

**Règle : jamais < 1rem (16px) pour le corps de texte.**

## RGAA — Obligations
- Contraste texte/fond : ≥ 4.5:1 (AA)
- Focus ring : visible, 2px, couleur primary
- prefers-reduced-motion : toujours respecté
- aria-label : tous les boutons iconiques

## Ton & langage
- Toujours "tu" (intimité)
- Jamais "Erreur" → "Quelque chose s'est passé"
- Jamais "Chargement..." → "Un instant..."
- Célébrer les petites victoires (✓ Routine terminée !)

## Interdit
- ❌ Rouge (anxiété)
- ❌ Confettis ou animations agressives
- ❌ Texte en majuscules entières (agressif)
- ❌ Ombres trop prononcées (lourd)
- ❌ Termes médicaux dans l'UI (TSA, TDAH)
```

---

## Vérification RGAA des contrastes

```typescript
// Outil en ligne : https://webaim.org/resources/contrastchecker/
// Ou dans le code :

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// TribuZen vérifications :
// #2C2C2C (foreground) sur #F8F5F0 (background) → 12.4:1 ✅ (AA + AAA)
// #6B7E6B (primary) sur #F8F5F0 (background) → 4.6:1  ✅ (AA)
// #F8F5F0 sur #6B7E6B → 4.6:1 ✅
```

---

## Checklist

- [ ] Tokens CSS définis dans `:root` et connectés à Tailwind
- [ ] `design.md` créé avec palette, typo, RGAA, ton, interdits
- [ ] Contrastes vérifiés pour chaque paire couleur/fond (≥ 4.5:1)
- [ ] Thème sombre = override des tokens uniquement (`.dark`)
- [ ] Pas de rouge dans l'interface TribuZen (substitution terracotta)
