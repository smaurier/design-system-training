# Lab 08 — Accessibilité du design system (RGAA / WCAG 2.2 AA)

> **Outcome :** à la fin, tu sais auditer les tokens de couleur d'un design system contre les seuils RGAA, corriger une `RoutineCard` et un formulaire d'invitation (contraste, focus, cible tactile, nom accessible, clavier, erreurs), et verrouiller la conformité avec de vrais tests **jest-axe**.
> **Vrai outil :** `jest-axe` (moteur axe-core de Deque) + `@testing-library/react` + `@testing-library/user-event`, exécutés par Vitest. Aucun harnais simulé.
> **Feedback :** le coach valide en session — les tests jest-axe rendent le verdict d'accessibilité, pas un auto-correcteur maison.

---

## Énoncé

Tu reçois deux composants du design system TribuZen qui « marchent à la souris » mais échouent l'audit RGAA. Ta mission :

1. **Auditer les tokens de couleur** contre les seuils RGAA (4.5:1 texte, 3:1 large/composant) et produire des tokens `-text` conformes.
2. **Corriger la `RoutineCard`** : `<button>` natifs, nom accessible, cibles ≥ 44px, `focus-visible`, tokens `-text`.
3. **Corriger l'`InviteForm`** : `<label htmlFor>`, `aria-invalid` + `aria-describedby`, `aria-live` sur le succès.
4. **Écrire de vrais tests jest-axe** qui passent au vert sur les deux composants (+ un test clavier et un test de nom accessible).

### Rappel des seuils (à ne pas deviner)

| Élément | Seuil AA | Réf |
|---|---|---|
| Texte normal | 4.5:1 | WCAG 1.4.3 / RGAA 3.2 |
| Texte large (≥ 24px, ou ≥ 18.66px gras) | 3:1 | WCAG 1.4.3 / RGAA 3.2 |
| Composant / focus ring / icône de sens | 3:1 | WCAG 1.4.11 / RGAA 3.3 |
| Cible tactile | 24×24px (confort 44) | WCAG 2.5.8 AA / 2.5.5 AAA |

### Palette TribuZen à auditer (valeurs de départ)

```text
--color-text        #2C2C2C   --background   #F8F5F0
--color-primary     #6B7E6B   --color-secondary #C4785A
--color-accent      #D4A017   --color-muted-fg  #737373
```

### Starter — setup projet

```bash
pnpm create vite@latest tribuzen-a11y-lab --template react-ts
cd tribuzen-a11y-lab
pnpm add -D vitest jsdom jest-axe @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.ts'] },
});
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

Composant **de départ** à corriger (copie tel quel, non conforme) :

```tsx
// src/components/RoutineCard.tsx — AVANT (non conforme)
export function RoutineCard({ title, time, onComplete, onDelete }: {
  title: string; time: string; onComplete: () => void; onDelete: () => void;
}) {
  return (
    <div className="routine-card" onClick={onComplete}>
      <span style={{ color: '#6B7E6B' }}>{title}</span>
      <span style={{ color: '#6B7E6B' }}>{time}</span>
      <div className="icon-btn" onClick={onDelete}>🗑️</div>
    </div>
  );
}
```

---

## Étapes (en friction)

1. **Audite les tokens.** Passe chaque paire (couleur / fond crème `#F8F5F0`, et texte blanc sur couleur pour les fonds de bouton) dans le WebAIM Contrast Checker. Note le ratio et le verdict vs 4.5:1. Tu dois trouver : `#6B7E6B` = 4.00:1 (❌ texte), `#D4A017` = 2.38:1 (❌), `#C4785A` = 3.12:1 (❌ texte), `#737373` = 4.36:1 (❌ limite).
2. **Dérive les tokens `-text` conformes** : trouve pour chaque couleur une version foncée qui atteint ≥ 4.5:1 (sur crème *et* avec texte blanc si c'est un fond de bouton). Vérifie chaque candidat dans le checker.
3. **Réécris `RoutineCard`** : `<article>` conteneur, un `<button>Terminer</button>`, un `<button aria-label>` pour supprimer avec icône `aria-hidden`. Applique les tokens `-text`, `min-height/min-width: 44px`, `:focus-visible`.
4. **Écris `InviteForm`** : `<label htmlFor>`, validation e-mail, `aria-invalid` + `aria-describedby` sur erreur, `<p aria-live="polite" class="sr-only">` pour le succès.
5. **Écris les tests jest-axe** : `expect(await axe(container)).toHaveNoViolations()` sur chaque composant, + `getByRole('button', { name })` (nom accessible), + un test `userEvent` clavier.
6. **Lance `pnpm vitest`** et rends tout vert. Un échec axe te donne la règle WCAG violée : lis-la, corrige à la source (souvent un token ou un attribut manquant).

---

## Corrigé complet commenté

```ts
// ─── src/styles/tokens.css (extrait) — tokens audités ────────────
// Ratios vérifiés (formule WCAG de luminance relative) :
//   --color-text        #2C2C2C sur crème = 12.84:1  ✅
//   --color-muted-text  #6E6E6E sur crème =  4.71:1  ✅ (était #737373 = 4.36 ❌)
//   --color-primary     #6B7E6B         = 4.00:1  → décor / focus ring seulement (≥3:1)
//   --color-primary-text#5A6B5A blanc   = 5.70:1  ✅ | sur crème 5.24:1 ✅
//   --color-accent-text #7E5E0A blanc   = 6.01:1  ✅ | sur crème 5.53:1 ✅
//   --color-error-text  #9E5236 blanc   = 5.65:1  ✅ | sur crème 5.20:1 ✅ (jamais rouge pur)
```

```tsx
// ─── src/components/RoutineCard.tsx — APRÈS (conforme) ───────────
interface RoutineCardProps {
  title: string;
  time: string;
  onComplete: () => void;
  onDelete: () => void;
}

export function RoutineCard({ title, time, onComplete, onDelete }: RoutineCardProps) {
  return (
    // Plus de onClick sur le conteneur : on expose de vrais boutons focusables.
    <article className="routine-card">
      <div className="routine-card__info">
        {/* --color-text (12.8:1) pour le titre, --color-muted-text (4.71:1) pour l'heure */}
        <span className="routine-card__title">{title}</span>
        <span className="routine-card__time">{time}</span>
      </div>

      {/* <button> natif : focus, Entrée/Espace, rôle gratuits */}
      <button type="button" className="btn" onClick={onComplete}>
        Terminer
      </button>

      {/* Icône seule → nom accessible via aria-label ; l'icône est masquée */}
      <button
        type="button"
        className="icon-btn"
        aria-label={`Supprimer la routine ${title}`}
        onClick={onDelete}
      >
        <span aria-hidden="true">🗑️</span>
      </button>
    </article>
  );
}
```

```css
/* ─── src/components/RoutineCard.css ─────────────────────────────── */
.routine-card__title { color: var(--color-text); }        /* #2C2C2C */
.routine-card__time  { color: var(--color-muted-text); }  /* #6E6E6E, 4.71:1 */

.btn { background: var(--color-primary-text); color: #fff; } /* #5A6B5A + blanc = 5.70:1 */

.btn, .icon-btn {
  min-width: 44px; min-height: 44px;   /* AA = 24 minimum, on vise 44 (confort mobile) */
  display: inline-flex; align-items: center; justify-content: center;
}

/* Anneau clavier uniquement (jamais outline:none nu), token ≥ 3:1 */
.btn:focus-visible, .icon-btn:focus-visible {
  outline: 2px solid var(--color-primary); /* #6B7E6B = 4.0:1 → OK composant */
  outline-offset: 2px;
}
```

```tsx
// ─── src/components/InviteForm.tsx — conforme RGAA 11 ────────────
import { useState } from 'react';

export function InviteForm({ onInvite }: { onInvite: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // noValidate : on gère l'erreur nous-mêmes pour la rendre accessible
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Saisis une adresse e-mail valide, par exemple prenom@exemple.fr.');
      setStatus('');
      return;
    }
    setError('');
    onInvite(email);
    setStatus(`Invitation envoyée à ${email}.`); // annoncé par aria-live
    setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Étiquette persistante liée par htmlFor/id — jamais un placeholder seul */}
      <label htmlFor="invite-email">E-mail de l'invité·e</label>
      <input
        id="invite-email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={error ? true : undefined}                    // état d'erreur exposé
        aria-describedby={error ? 'invite-email-error' : undefined} // lie l'erreur au champ
      />

      {/* Erreur en texte (jamais couleur seule), role=alert = annonce immédiate */}
      {error && (
        <p id="invite-email-error" className="field-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn">Envoyer l'invitation</button>

      {/* Succès annoncé sans voler le focus */}
      <p aria-live="polite" className="sr-only">{status}</p>
    </form>
  );
}
```

```css
/* Masque visuellement, garde pour lecteurs d'écran (pattern standard) */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.field-error { color: var(--color-error-text); } /* #9E5236 = 5.20:1 */
```

```tsx
// ─── src/components/RoutineCard.a11y.test.tsx ────────────────────
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { RoutineCard } from './RoutineCard';

const noop = () => {};

it('ne présente aucune violation WCAG (axe)', async () => {
  const { container } = render(
    <RoutineCard title="Bain du soir" time="20:30" onComplete={noop} onDelete={noop} />,
  );
  // axe = vrai moteur : échoue si un nom/aria/contraste inline manque
  expect(await axe(container)).toHaveNoViolations();
});

it('expose un nom accessible sur le bouton supprimer (WCAG 4.1.2)', () => {
  render(<RoutineCard title="Bain du soir" time="20:30" onComplete={noop} onDelete={noop} />);
  expect(
    screen.getByRole('button', { name: 'Supprimer la routine Bain du soir' }),
  ).toBeInTheDocument();
});

it('est activable au clavier (Tab + Entrée) — ce qu axe ne peut pas juger', async () => {
  const onComplete = vi.fn();
  const user = userEvent.setup();
  render(<RoutineCard title="Bain" time="20:30" onComplete={onComplete} onDelete={noop} />);
  await user.tab();                 // focus sur "Terminer"
  await user.keyboard('{Enter}');
  expect(onComplete).toHaveBeenCalledTimes(1);
});
```

```tsx
// ─── src/components/InviteForm.a11y.test.tsx ─────────────────────
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { InviteForm } from './InviteForm';

it('ne présente aucune violation WCAG', async () => {
  const { container } = render(<InviteForm onInvite={() => {}} />);
  expect(await axe(container)).toHaveNoViolations();
});

it('le champ est atteignable par son étiquette (RGAA 11.1)', () => {
  render(<InviteForm onInvite={() => {}} />);
  expect(screen.getByLabelText("E-mail de l'invité·e")).toBeInTheDocument();
});

it("relie l'erreur au champ via aria-describedby + aria-invalid", async () => {
  const user = userEvent.setup();
  render(<InviteForm onInvite={() => {}} />);
  await user.type(screen.getByLabelText("E-mail de l'invité·e"), 'pasunemail');
  await user.click(screen.getByRole('button', { name: "Envoyer l'invitation" }));
  const field = screen.getByLabelText("E-mail de l'invité·e");
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(field).toHaveAccessibleDescription(/adresse e-mail valide/);
});
```

**Pourquoi ce corrigé est correct :**
- Les tokens `-text` sont vérifiés au checker : la conformité vit dans le token, tous les composants qui le consomment en héritent.
- `RoutineCard` n'a plus de `<div onClick>` : `<button>` porte focus, clavier et rôle sans code clavier maison ; le nom accessible vient d'`aria-label`, l'emoji est `aria-hidden`.
- Les cibles sont dimensionnées à 44px (au-dessus du plancher AA de 24), le focus est géré par `:focus-visible` (jamais `outline:none` nu).
- Le formulaire relie erreur ↔ champ (`aria-describedby` + `aria-invalid`) et annonce le succès en `aria-live="polite"` sans voler le focus.
- Les tests jest-axe donnent le verdict d'accessibilité automatisable ; les tests `userEvent` couvrent le clavier, qu'axe ne sait pas juger — c'est la part « manuelle » qu'on automatise ici.

**Limite à garder en tête :** ces tests verts prouvent l'absence de violation *détectable* (~30 %), pas la conformité totale. Avant livraison institutionnelle : passe clavier complète + lecteur d'écran (NVDA/VoiceOver) + zoom 200 %.

---

## Variante J+30 (fading)

**Même objectif, contraintes ajoutées — de mémoire, sans rouvrir ce corrigé, en 30 min :**

1. Ajoute à `RoutineCard` un état `done: boolean`. Le statut « terminée / à faire » ne doit **pas** être porté par la couleur seule (WCAG 1.4.1) : double-le d'une icône `aria-hidden` **et** d'un texte.
2. Ajoute un `<fieldset>` + `<legend>` à `InviteForm` pour un groupe de rôles (`parent` / `enfant` / `aidant`) en boutons radio accessibles.
3. Ajoute un test qui échoue **volontairement** (retire un `aria-label`) et vérifie qu'axe le détecte — puis remets-le. Objectif : voir le vrai message d'axe.
4. **Critère de réussite :** `pnpm vitest` tout vert, le statut est compréhensible en niveaux de gris (capture d'écran désaturée), le champ radio est atteignable au clavier.

---

## Application TribuZen

Dans le repo `smaurier/tribuzen`, ce travail se pose ici :

```text
tribuzen/src/
  styles/tokens.css                     ← tokens -surface / -text audités (this lab)
  components/
    ui/RoutineCard/
      RoutineCard.tsx
      RoutineCard.css
      RoutineCard.a11y.test.tsx
    features/invite/
      InviteForm.tsx
      InviteForm.a11y.test.tsx
  test/setup.ts                         ← expect.extend(toHaveNoViolations)
```

**Différences avec le lab :**
- Les couleurs vivent en variables CSS (thème clair/sombre) ; l'audit se refait pour le token dark (fonds foncés → seuils inversés).
- La convention CI : tout composant `ui/` embarque un `*.a11y.test.tsx` avec au moins un `axe(container)`. Le pipeline échoue à la moindre régression d'accessibilité.
- L'audit manuel (clavier + NVDA + zoom) est consigné dans une **déclaration d'accessibilité RGAA** publiée avant tout partenariat CAF/PMI.

**Commits cibles :**
```text
fix(tokens): tokens -text conformes RGAA (contraste ≥ 4.5:1) — corrige sauge/ambre/muted
fix(ui): RoutineCard accessible — boutons natifs, nom accessible, focus-visible, cible 44px
feat(invite): InviteForm accessible — label lié, aria-invalid/describedby, aria-live
test(a11y): jest-axe sur RoutineCard et InviteForm dans le design system
```
