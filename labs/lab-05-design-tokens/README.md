# Lab 05 — Design tokens

> **Outcome :** à la fin, tu sais structurer un système de tokens TribuZen en trois niveaux (primitives → sémantiques → composant), l'exposer en CSS custom properties + `@theme` Tailwind v4, et brancher un thème clair/sombre par simple override.
> **Vrai outil :** Vite + Tailwind CSS v4 (dev server, changement de thème visible en direct dans le navigateur).
> **Feedback :** le coach valide visuellement en session — pas de test-runner auto-correcteur.

---

## Énoncé

Tu poses la **source unique de vérité** visuelle de TribuZen. Cahier des charges **exact** :

1. **`tokens.css`** — trois niveaux de tokens :
   - **Primitives** : la palette de marque nommée par la teinte (`--sage-*`, `--terracotta-*`, `--cream-*`, `--ink-*`).
   - **Sémantiques** : les rôles pointant vers les primitives (`--color-primary`, `--color-danger`, `--color-surface`, `--color-text`).
   - **Composant** : les tokens du bouton et de la carte (`--btn-bg`, `--btn-bg-hover`, `--card-radius`…).
2. **Thème sombre** — un sélecteur `[data-theme="dark"]` qui **override uniquement les sémantiques**.
3. **`@theme` Tailwind v4** — exposer `--color-primary`, `--color-surface`, `--radius-lg` pour générer `bg-primary`, `bg-surface`, `rounded-lg`.
4. **Un écran de démo** (`main.ts` + `index.html`) : un bouton `.btn`, une carte `.card`, et un bouton « Thème sombre » qui bascule l'attribut `data-theme` sur `<html>`.

**Contraintes :**
- Un composant (`.btn`, `.card`) ne lit **jamais** une primitive (`var(--sage-500)` interdit dans `.btn`) — uniquement des sémantiques ou tokens composant.
- **Jamais de rouge pur** : `--color-danger` pointe vers du terracotta (décision produit anti-anxiété TribuZen).
- Nommer par le **rôle**, pas par la valeur : pas de `--color-green`.
- **Pas de gap-fill** — tu écris chaque bloc complet depuis le starter.

### Starter minimal

```bash
pnpm create vite@latest tribuzen-tokens --template vanilla-ts
cd tribuzen-tokens
pnpm add -D tailwindcss @tailwindcss/vite
```

```
tribuzen-tokens/
  vite.config.ts     ← ajoute le plugin @tailwindcss/vite
  index.html         ← à écrire (bouton + carte + toggle thème)
  src/
    tokens.css       ← à écrire (3 niveaux + dark + @theme)
    main.ts          ← à écrire (bascule data-theme)
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ plugins: [tailwindcss()] });
```

Lance `pnpm dev` et valide dans le navigateur au fur et à mesure.

---

## Étapes (en friction)

1. **Écris les primitives** dans `src/tokens.css`, sous `:root` — palette sauge/terracotta/crème/anthracite, nommée par la teinte. Ne référence rien d'autre.
2. **Écris les sémantiques** — `--color-primary`, `--color-primary-hover`, `--color-danger`, `--color-surface`, `--color-text`, chacun en `var(--primitif)`.
3. **Écris les tokens composant** — `--btn-bg`, `--btn-bg-hover`, `--btn-text`, `--card-radius`, `--card-shadow`, en `var(--sémantique)`.
4. **Écris le thème sombre** — `[data-theme="dark"]` qui repointe **seulement** les sémantiques (surface sombre, texte clair, primaire plus clair). Ne touche aucune primitive.
5. **Écris le bloc `@theme`** — `@import "tailwindcss";` puis `@theme { --color-primary … --color-surface … --radius-lg … }` pour générer les utilitaires.
6. **Écris `.btn` et `.card`** — qui lisent uniquement des tokens composant/sémantiques. Vérifie : aucun `var(--sage-*)` dans ces règles.
7. **Écris `index.html` + `main.ts`** — un bouton, une carte, un toggle qui fait `document.documentElement.dataset.theme = ...`. Recharge : le clic bascule clair ↔ sombre sans qu'aucune règle de composant ne change.
8. **Vérifie les cas** : change `--sage-500` → le bouton, le focus et le texte primaire bougent ensemble ; bascule le thème → surface et texte s'inversent, les composants restent intacts.

---

## Corrigé complet commenté

```css
/* ─── src/tokens.css ────────────────────────────────────────────── */

/* ============================================================
   NIVEAU 1 — PRIMITIVES : catalogue brut, nommé par la teinte.
   Ne référence rien. Aucun composant ne doit lire ces variables.
   ============================================================ */
:root {
  --sage-400:  #8A9A8A;
  --sage-500:  #6B7E6B;   /* sauge de marque — fond/bordure (4.00:1 sur crème, pas texte AA) */
  --sage-600:  #5A6F5A;
  --sage-700:  #5A6B5A;   /* sauge TEXTE — 5.24:1 sur crème (AA ok) ; voir module 08 */
  --terracotta-400: #D08E72;
  --terracotta-500: #C4785A;   /* terracotta de marque (remplace le rouge) — fond (3.12:1, pas texte AA) */
  --terracotta-600: #A5613F;
  --terracotta-700: #9E5236;   /* terracotta TEXTE — 5.20:1 sur crème (AA ok) ; voir module 08 */
  --cream-50:  #F8F5F0;   /* surface chaude */
  --ink-900:   #2C2C2C;   /* texte anthracite */
  --ink-100:   #F0EDE6;

  /* Échelles non colorées — aussi des primitives */
  --radius-lg: 0.75rem;
  --space-2:   0.5rem;
  --space-4:   1rem;
}

/* ============================================================
   NIVEAU 2 — SÉMANTIQUES : les rôles. Chacun POINTE vers un
   primitif. C'est la seule couche que le thème réécrit.
   ============================================================ */
:root {
  --color-primary:       var(--sage-500);        /* rôle FOND/bordure sauge */
  --color-primary-hover: var(--sage-600);
  --color-primary-text:  var(--sage-700);        /* rôle TEXTE sauge conforme AA (séparé du fond) */
  --color-danger:        var(--terracotta-500);  /* jamais de rouge pur — rôle FOND */
  --color-danger-text:   var(--terracotta-700);  /* rôle TEXTE danger conforme AA */
  --color-surface:       var(--cream-50);
  --color-text:          var(--ink-900);
}

/* ============================================================
   NIVEAU 3 — COMPOSANT : spécialisation locale. Pointe vers
   des sémantiques. C'est ce que les règles .btn / .card lisent.
   ============================================================ */
:root {
  /* Bouton plein à label crème : le FOND doit être assez foncé pour que
     le label passe AA. cream sur --color-primary (sage-500) = 4.36:1 (échec) ;
     sur --color-primary-text (sage-700) = 5.24:1 (ok). Voir module 08. */
  --btn-bg:       var(--color-primary-text);
  --btn-bg-hover: var(--color-primary-hover);
  --btn-text:     var(--cream-50);
  --btn-radius:   var(--radius-lg);
  --card-radius:  var(--radius-lg);
  --card-shadow:  0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* ============================================================
   THÈME SOMBRE — on REDÉFINIT uniquement les sémantiques.
   Les primitives et les tokens composant ne bougent pas :
   .btn/.card suivent automatiquement.
   ============================================================ */
[data-theme="dark"] {
  --color-primary:       var(--sage-400);   /* plus clair → contraste tenu */
  --color-primary-hover: var(--sage-500);
  --color-surface:       #1A1A1A;
  --color-text:          var(--ink-100);
}

/* ============================================================
   TAILWIND v4 — @theme génère les utilitaires depuis les tokens.
   On expose les sémantiques utiles côté classes (bg-primary…).
   ============================================================ */
@import "tailwindcss";

@theme {
  --color-primary: #6B7E6B;   /* → bg-primary, text-primary, border-primary */
  --color-surface: #F8F5F0;   /* → bg-surface, text-surface */
  --radius-lg:     0.75rem;    /* → rounded-lg */
}

/* ============================================================
   COMPOSANTS — lisent SEULEMENT des tokens composant/sémantiques.
   Aucun var(--sage-*) ici : sinon le thème ne les affecterait pas.
   ============================================================ */
body {
  background: var(--color-surface);
  color: var(--color-text);
  font-family: 'Inter', system-ui, sans-serif;
  transition: background 200ms ease, color 200ms ease;
}

.btn {
  background: var(--btn-bg);
  color: var(--btn-text);
  border: none;
  border-radius: var(--btn-radius);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
}
.btn:hover { background: var(--btn-bg-hover); }

.card {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid color-mix(in srgb, var(--color-text) 12%, transparent);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: var(--space-4);
}

.card__danger {
  /* Alerte douce : terracotta, jamais rouge. TEXTE → token texte conforme AA
     (--color-danger-text 5.20:1), pas --color-danger (fond, 3.12:1). Voir module 08. */
  color: var(--color-danger-text);
  font-weight: 600;
}
```

```html
<!-- ─── index.html ──────────────────────────────────────────── -->
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TribuZen — Tokens</title>
  </head>
  <body>
    <main style="max-width: 420px; margin: 3rem auto; display: grid; gap: 1rem;">
      <button id="theme-toggle" class="btn">Basculer le thème</button>

      <!-- Carte stylée par les tokens composant -->
      <div class="card">
        <h2>Routine du soir</h2>
        <p>Trois étapes pour un coucher serein.</p>
        <p class="card__danger">Attention : une étape est en retard.</p>
        <!-- Bouton stylé par utilitaires Tailwind générés depuis @theme -->
        <button class="btn">Valider</button>
        <button class="bg-primary text-surface rounded-lg" style="padding:.5rem 1rem;border:none;">
          Via Tailwind
        </button>
      </div>
    </main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```ts
// ─── src/main.ts ──────────────────────────────────────────────
import './tokens.css';

const root = document.documentElement; // <html>
const toggle = document.getElementById('theme-toggle')!;

// La bascule ne touche QUE l'attribut data-theme.
// Aucune règle de composant n'est modifiée : les sémantiques
// redéfinis dans [data-theme="dark"] font tout le travail.
toggle.addEventListener('click', () => {
  const isDark = root.dataset.theme === 'dark';
  root.dataset.theme = isDark ? 'light' : 'dark';
});
```

**Pourquoi ce corrigé est correct :**
- `.btn`, `.card` ne lisent que `--btn-*`, `--card-*`, `--color-*` — jamais `--sage-500`. Changer une primitive ou basculer le thème les met à jour sans les toucher.
- Le thème sombre override **uniquement** les sémantiques ; le catalogue de primitives et les tokens composant restent stables — la règle d'or du module.
- `--color-danger` pointe vers du terracotta : la contrainte anti-rouge de TribuZen est portée par un token, pas par une valeur en dur répétée.
- `@theme` fait de `--color-primary` la source des utilitaires `bg-primary` — le CSS custom property runtime et l'utilitaire Tailwind partagent la même décision.
- **Token TEXTE séparé du token FOND** (la leçon de contraste, voir module 08) : sur crème, `--color-primary` (sauge, 4.00:1) et `--color-danger` (terracotta, 3.12:1) ne servent qu'aux **fonds/bordures** ; tout **texte** lit `--color-primary-text` (#5A6B5A, 5.24:1) / `--color-danger-text` (#9E5236, 5.20:1). Un bouton plein garde un label crème parce que son `--btn-bg` pointe sur le token foncé — jamais sur le sauge de fond (cream/sauge = 4.36:1, échec AA).

---

## Variante J+30 (fading)

**Même objectif, contraintes ajoutées — reproduire de mémoire en 25 minutes :**

1. Ajoute un **troisième thème de marque** `[data-brand="ecole"]` qui repointe `--color-primary` vers une teinte bleu-ardoise (`--slate-500: #5B7089`, à ajouter aux primitives) — sans dupliquer une seule règle de composant.
2. Ajoute une catégorie **typographie** : `--font-size-base` (1rem), `--font-size-lg`, et applique-les à `body` / `h2` via des tokens sémantiques.
3. Exprime **la palette primaire en JSON W3C** dans un fichier `tokens.json` (avec `$type`/`$value` et une référence `{color.sage.500}` pour `primary`) — juste le fichier source, sans lancer Style Dictionary.
4. **Sans rouvrir ce corrigé** ni le module 05.

**Critère de réussite :** trois apparences (clair, sombre, marque école) obtenues en changeant un seul attribut sur `<html>`, aucune règle `.btn`/`.card` modifiée entre les trois, et un `tokens.json` valide où `primary` référence `sage.500`.

---

## Application TribuZen

Dans le repo `smaurier/tribuzen`, les tokens sont la couche fondatrice du design system, partagée web + mobile :

```
tribuzen/
  tokens/
    primitives.tokens.json     # niveau 1 — catalogue de marque (JSON W3C)
    semantic.tokens.json       # niveau 2 — rôles + variantes de thème
    component.tokens.json      # niveau 3 — tokens par composant
  style-dictionary.config.js   # source → cibles
  build/
    tokens.css                 # généré → app web (Next.js + Tailwind @theme)
    tokens.ts                  # généré → Tamagui (Expo, module 09)
```

**Différences par rapport au lab :**
- La source n'est **pas** du CSS écrit à la main mais des fichiers `.tokens.json` (format W3C) ; `tokens.css` et `tokens.ts` sont **générés** par `style-dictionary build`.
- Le thème sombre et la marque école deviennent des jeux de tokens sémantiques dans `semantic.tokens.json`, transformés en `[data-theme]` / `[data-brand]`.
- Les mêmes tokens alimentent Tamagui côté Expo (`tokens.ts`) — web et mobile ne peuvent pas diverger.

**Commit cible :**
```
feat(tokens): système 3 niveaux TribuZen (primitives → sémantiques → composant)
feat(tokens): thème clair/sombre par override sémantique + @theme Tailwind v4
```
