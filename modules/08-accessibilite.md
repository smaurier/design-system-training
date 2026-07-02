---
titre: Accessibilité du design system (RGAA / WCAG 2.2 AA)
cours: 21-design-system
notions: [référentiel RGAA et WCAG 2.2 AA, contraste des couleurs, audit des tokens de contraste, focus visible, cibles tactiles, navigation clavier, HTML natif avant ARIA, nom accessible, formulaires accessibles, messages de statut aria-live, tests automatisés jest-axe, limites du test automatique]
outcomes: [auditer les tokens de couleur d'un design system contre les seuils RGAA, rendre un composant conforme (contraste, focus, cible tactile, nom accessible, clavier), écrire des tests jest-axe réels sur les composants du design system]
prerequis: [07-storybook]
next: 09-tamagui
libs: [{ name: react, version: "^19" }, { name: "jest-axe", version: "latest" }]
tribuzen: audit RGAA des tokens de couleur TribuZen, mise en conformité de la RoutineCard et du formulaire d'invitation, jest-axe intégré aux tests du design system
last-reviewed: 2026-07
---

# Accessibilité du design system (RGAA / WCAG 2.2 AA)

> **Outcomes — tu sauras FAIRE :** auditer les tokens de couleur d'un design system contre les seuils RGAA, rendre un composant conforme (contraste, focus, cible tactile, nom accessible, clavier), écrire des tests jest-axe réels sur les composants du design system.
> **Difficulté :** :star::star::star:

## 1. Cas concret d'abord

Tu reprends la `RoutineCard` du design system TribuZen — la brique affichée des dizaines de fois sur l'écran principal. Elle « marche » à la souris. Un premier test `jest-axe` la fait pourtant échouer, et une passe manuelle au clavier confirme plusieurs problèmes RGAA :

```tsx
// RoutineCard.tsx — AVANT audit accessibilité
function RoutineCard({ title, time, onComplete, onDelete }: RoutineCardProps) {
  return (
    <div className="routine-card" onClick={onComplete}>
      {/* Titre en vert sauge sur fond crème */}
      <span style={{ color: '#6B7E6B' }}>{title}</span>
      <span style={{ color: '#6B7E6B' }}>{time}</span>

      {/* Bouton supprimer : icône seule, 20×20px, pas de nom accessible */}
      <div className="icon-btn" onClick={onDelete}>
        <TrashIcon />
      </div>
    </div>
  );
}
```

**Quatre non-conformités, toutes détectables et corrigeables :**
1. **Contraste** — `#6B7E6B` sur le fond crème `#F8F5F0` donne **4.00:1**, sous le seuil de **4.5:1** exigé pour le texte normal (WCAG 1.4.3 / RGAA 3.2). Le token « primary » du design system est donc non conforme en usage texte.
2. **Nom accessible** — le bouton supprimer est un `<div>` avec une icône : un lecteur d'écran annonce « (rien) », pas « Supprimer la routine » (WCAG 4.1.2).
3. **Clavier** — `<div onClick>` n'est ni focusable ni activable au clavier : impossible de compléter ou supprimer une routine sans souris (WCAG 2.1.1 / RGAA 7.3).
4. **Cible tactile** — la zone icône fait 20×20px, sous le minimum de **24×24px CSS** (WCAG 2.5.8, nouveau en WCAG 2.2 AA).

Ce module te donne la grille RGAA/WCAG pour repérer ces défauts, la méthode pour corriger le token fautif à la racine, et l'outil (`jest-axe`) pour verrouiller la conformité dans les tests du design system.

---

## 2. Théorie complète, concise

### 2.1 Le référentiel : RGAA, WCAG, niveaux

- **WCAG 2.2** (Web Content Accessibility Guidelines, W3C, décembre 2023) est la norme technique internationale. Elle organise ses critères (Success Criteria, « SC ») en trois niveaux : **A** (minimal), **AA** (cible légale usuelle), **AAA** (renforcé, rarement exigé en totalité).
- **RGAA 4.1** (Référentiel Général d'Amélioration de l'Accessibilité, France) est la déclinaison opérationnelle française. Il est **aligné sur WCAG 2.1 niveau AA** et organise les vérifications en **13 thématiques** (images, couleurs, scripts, formulaires, navigation, consultation…) et 106 critères.
- **WCAG 2.2 ajoute** des critères que RGAA 4.1 n'intègre pas encore formellement mais qu'un design system moderne doit viser : **2.4.11 Focus non masqué (AA)**, **2.5.8 Taille de cible minimale (AA, 24px)**, **3.3.8 Authentification accessible (AA)**. On travaille donc « RGAA 4.1 AA + surcouche WCAG 2.2 AA ».

> La conformité légale française (loi du 11 février 2005, décret 2019) impose le RGAA aux services publics, collectivités et grandes entreprises. Une startup privée comme TribuZen n'y est pas contrainte, mais la cible AA reste le standard de tout partenariat institutionnel (CAF, PMI) et le seuil de non-discrimination.

### 2.2 Contraste des couleurs — auditer les tokens

Deux critères distincts, deux seuils :

| Élément | Seuil AA | WCAG | RGAA |
|---|---|---|---|
| Texte normal (< 24px, ou < 18.66px gras) | **4.5:1** | 1.4.3 | 3.2 |
| Texte large (≥ 24px, ou ≥ 18.66px gras) | **3:1** | 1.4.3 | 3.2 |
| Composant d'interface / élément graphique (bordure d'input, icône porteuse de sens, focus ring) | **3:1** | 1.4.11 | 3.3 |

Le ratio se calcule entre les **luminances relatives** des deux couleurs : `(L_clair + 0.05) / (L_sombre + 0.05)`. Il va de 1:1 (identiques) à 21:1 (noir/blanc).

**Le point clé design system : un token de contraste garantit la conformité.** Si le token `--color-text` est audité une fois à 4.5:1 sur `--color-surface`, alors *tous* les composants qui consomment ce token héritent de la conformité. Inversement, une seule paire token/fond non auditée contamine toute l'UI. L'audit se fait donc **sur les tokens, pas composant par composant**.

Audit réel de la palette TribuZen (valeurs recalculées, formule WCAG) :

```text
Paire token / fond                         ratio    verdict texte normal (4.5)
────────────────────────────────────────────────────────────────────────────
foreground #2C2C2C sur background #F8F5F0  12.84:1  ✅ (AA + AAA)
primary    #6B7E6B sur background #F8F5F0   4.00:1  ❌ (échoue 4.5 — OK 3:1 large/UI)
primary    #6B7E6B + texte blanc            4.36:1  ❌ (bouton primaire : label illisible AA)
secondary  #C4785A sur background           3.12:1  ❌ (échoue 4.5 — OK 3:1 large/UI)
accent     #D4A017 sur blanc                2.38:1  ❌ (échoue tout — jamais pour du texte)
muted-fg   #737373 sur background           4.36:1  ❌ (limite, échoue 4.5)
```

Diagnostic : le vert sauge `#6B7E6B` a longtemps été documenté « 4.6:1 » dans le design system — **c'était faux** (il est à 4.00). Il reste utilisable comme **couleur de composant** (focus ring, bordure : seuil 3:1) et pour du **texte large**, mais **pas pour du texte normal ni comme fond de bouton avec label blanc**. Correctifs conformes vérifiés :

```text
Usage                          token conforme     ratio
──────────────────────────────────────────────────────────
Texte / fond de bouton (sauge) #5A6B5A  (blanc)   5.70:1 ✅  | sur crème 5.24:1 ✅
Accent texte (ambre)           #7E5E0A  (blanc)   6.01:1 ✅  | sur crème 5.53:1 ✅
Terracotta texte/bouton        #9E5236  (blanc)   5.65:1 ✅  | sur crème 5.20:1 ✅
muted-foreground               #6E6E6E  sur crème  4.71:1 ✅
```

On introduit donc des tokens dérivés « -text » (versions foncées conformes) distincts des tokens « surface/décor » (versions claires). C'est la pratique standard : `--color-primary` (décor) ≠ `--color-primary-text` (texte).

### 2.3 Focus visible

**WCAG 2.4.7 Focus Visible (AA) / RGAA 10.7 :** tout élément qui reçoit le focus doit l'indiquer visuellement. **WCAG 2.4.11 Focus non masqué (AA, 2.2) :** l'élément focalisé ne doit pas être caché par un header collant ou un tooltip.

Distinction critique `:focus` vs `:focus-visible` :
- `:focus` se déclenche aussi au **clic souris** → anneau affiché même à la souris, jugé « moche », d'où le réflexe fatal `outline: none` qui casse l'accessibilité clavier.
- `:focus-visible` ne se déclenche qu'en **navigation clavier** (heuristique du navigateur) → on garde l'anneau au clavier, on l'évite à la souris. C'est le bon outil.

```css
/* Ne jamais faire : supprime l'anneau pour tout le monde */
.btn { outline: none; }

/* Faire : anneau visible au clavier uniquement, avec un token conforme (≥ 3:1) */
.btn:focus-visible {
  outline: 2px solid var(--color-primary); /* #6B7E6B = 4.0:1 sur crème → OK composant */
  outline-offset: 2px;
}
```

### 2.4 Cibles tactiles

- **WCAG 2.5.8 Taille de cible (Minimum) (AA, 2.2) :** toute cible tactile fait au moins **24×24 px CSS** (ou dispose d'un espacement suffisant autour). C'est le plancher AA.
- **WCAG 2.5.5 Taille de cible (Amélioré) (AAA) :** **44×44 px** recommandé — la valeur confort mobile (aussi la reco Apple HIG / Material). On vise 44px quand la place le permet, 24px est l'exigence AA à ne jamais franchir vers le bas.

```tsx
// Zone cliquable dimensionnée par token, pas par la taille de l'icône
<button className="icon-btn" aria-label="Supprimer la routine">
  <TrashIcon aria-hidden="true" width={16} height={16} />
</button>
```
```css
.icon-btn {
  min-width: 44px;   /* confort mobile (AAA) */
  min-height: 44px;  /* jamais < 24px (AA) */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 2.5 Navigation clavier

**WCAG 2.1.1 Clavier (A) / RGAA 7.3 :** toute action possible à la souris doit l'être au clavier. Règles :
- Utiliser des éléments **nativement focusables et activables** (`<button>`, `<a href>`, `<input>`) : ils gèrent Tab, Entrée/Espace et l'ordre de focus gratuitement.
- **Ne pas** rendre un `<div>` interactif : il faudrait rajouter `role`, `tabIndex={0}` *et* un handler clavier — trois occasions d'erreur pour rien.
- **Ordre de focus logique** = ordre du DOM. Ne pas utiliser de `tabindex` positif (`tabindex="1"` casse l'ordre global).
- **Piège du focus** (focus trap) : légitime *seulement* dans une modale ouverte (le focus reste dedans, Échap ferme). Illégitime partout ailleurs.

### 2.6 HTML natif d'abord, ARIA en dernier recours

**Première règle d'ARIA (W3C) : « No ARIA is better than bad ARIA ».** Un élément HTML natif porte déjà son rôle, son état et son comportement clavier. ARIA ne fait qu'*ajouter de la sémantique* — il ne change jamais le comportement.

Les 5 règles d'usage d'ARIA (résumé) :
1. Si un élément HTML natif convient, l'utiliser (`<button>` plutôt que `<div role="button">`).
2. Ne pas changer la sémantique native (`<h2 role="button">` : non).
3. Tout contrôle ARIA doit être utilisable au clavier.
4. Ne pas mettre `role="presentation"` / `aria-hidden="true"` sur un élément focusable (il disparaît du lecteur d'écran mais reste tabbable → confusion totale).
5. Tout élément interactif doit avoir un **nom accessible**.

Le **nom accessible** (WCAG 4.1.2 Nom, rôle, valeur) se calcule dans l'ordre : contenu textuel > `aria-labelledby` > `aria-label`. Pour un bouton icône, l'icône décorative est masquée (`aria-hidden`) et le nom vient d'`aria-label` :

```tsx
// Icône seule : nom via aria-label, icône masquée au lecteur d'écran
<button aria-label="Supprimer la routine">
  <TrashIcon aria-hidden="true" />
</button>

// Encore mieux : texte visible (bénéficie à tout le monde, pas d'aria)
<button>
  <TrashIcon aria-hidden="true" />
  <span>Supprimer</span>
</button>
```

### 2.7 Formulaires accessibles

Thématique RGAA 11, socle WCAG :
- **Étiquette liée (3.3.2 / RGAA 11.1) :** chaque champ a un `<label htmlFor>` relié à l'`id` du champ. Le `placeholder` **n'est pas** une étiquette (il disparaît à la saisie, contraste souvent insuffisant).
- **Groupes :** un ensemble de radios/checkboxes est enveloppé d'un `<fieldset>` + `<legend>`.
- **Erreurs (3.3.1 Identification / RGAA 11.10 ; 3.3.3 Suggestion / RGAA 11.11) :** l'erreur est décrite en texte (pas seulement en couleur), reliée au champ par `aria-describedby`, et le champ porte `aria-invalid="true"`.
- **Champ requis :** `required` natif ; l'astérisque visuel est doublé d'un texte ou d'`aria-required`.

```tsx
<label htmlFor="invite-email">E-mail de l'invité·e</label>
<input
  id="invite-email"
  type="email"
  required
  aria-invalid={!!error}
  aria-describedby={error ? 'invite-email-error' : undefined}
/>
{error && (
  <p id="invite-email-error" className="field-error">{error}</p>
)}
```

### 2.8 Messages de statut (aria-live)

**WCAG 4.1.3 Messages de statut (AA) :** un message qui apparaît sans changement de focus (toast, « Invitation envoyée », résultat de validation) doit être annoncé par le lecteur d'écran via une **région live** :
- `aria-live="polite"` : annoncé quand l'utilisateur est disponible (succès, statut courant). Défaut recommandé.
- `aria-live="assertive"` (ou `role="alert"`) : interrompt — réservé aux erreurs critiques.

```tsx
{/* Région live persistante ; le texte qui y entre est annoncé */}
<div aria-live="polite" className="sr-only">{statusMessage}</div>
```

### 2.9 Tests automatisés et leurs limites

`jest-axe` embarque le moteur **axe-core** (Deque) et échoue le test si une règle WCAG est violée dans le DOM rendu.

```ts
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

it("n'a aucune violation d'accessibilité", async () => {
  const { container } = render(<RoutineCard title="Bain" time="20:30" onComplete={() => {}} onDelete={() => {}} />);
  expect(await axe(container)).toHaveNoViolations();
});
```

**Limite fondamentale : l'automatique ne couvre qu'une partie des critères — souvent estimée autour de 30 % (Deque annonce jusqu'à ~57 % en usage optimal).** axe détecte fiablement : contraste, `alt` manquant, `label` manquant, `aria-*` invalide, nom accessible absent. Il **ne peut pas** juger : la pertinence d'un `alt`, l'ordre de tabulation logique, le sens d'un texte de lien, l'usage de la couleur seule pour porter une info, le fonctionnement réel au clavier. **Le reste (~70 %) est un audit manuel** : navigation clavier complète, test lecteur d'écran (NVDA/VoiceOver), zoom 200 %, revue humaine. `jest-axe` est un garde-fou de non-régression, pas une preuve de conformité.

> **Côté React Native (module 09) :** `jest-axe` cible le DOM et ne s'applique pas. On teste alors avec **`@testing-library/react-native`** en asseyant les requêtes sur les props d'accessibilité (`accessibilityLabel`, `accessibilityRole`, `accessibilityState`), et l'audit manuel se fait avec TalkBack / VoiceOver.

---

## 3. Worked examples

### Exemple 1 — Auditer et corriger la RoutineCard, verrouiller par jest-axe

Reprise du cas concret, corrigé de bout en bout.

```tsx
// ─── RoutineCard.tsx — APRÈS audit ───────────────────────────────
interface RoutineCardProps {
  title: string;
  time: string;
  onComplete: () => void;
  onDelete: () => void;
}

function RoutineCard({ title, time, onComplete, onDelete }: RoutineCardProps) {
  return (
    // La carte n'est plus cliquable en bloc : on expose des boutons réels.
    <article className="routine-card">
      <div className="routine-card__info">
        {/* Token texte conforme (#5A6B5A = 5.24:1 sur crème), plus #6B7E6B */}
        <span className="routine-card__title">{title}</span>
        <span className="routine-card__time">{time}</span>
      </div>

      {/* <button> natif : focusable, activable Entrée/Espace, min 44px */}
      <button
        type="button"
        className="routine-card__complete"
        onClick={onComplete}
      >
        Terminer
      </button>

      {/* Icône seule : nom accessible via aria-label, icône masquée */}
      <button
        type="button"
        className="icon-btn"
        aria-label={`Supprimer la routine ${title}`}
        onClick={onDelete}
      >
        <TrashIcon aria-hidden="true" width={16} height={16} />
      </button>
    </article>
  );
}
```
```css
/* Tokens conformes appliqués */
.routine-card__title { color: var(--color-text); }          /* #2C2C2C, 12.8:1 */
.routine-card__time  { color: var(--color-muted-text); }    /* #6E6E6E, 4.71:1 */
.routine-card__complete,
.icon-btn {
  min-height: 44px; min-width: 44px;   /* AA=24, on vise 44 (confort) */
}
.routine-card__complete:focus-visible,
.icon-btn:focus-visible {
  outline: 2px solid var(--color-primary); /* 4.0:1 → OK composant (≥3:1) */
  outline-offset: 2px;
}
```

Test réel, dans le design system (vitest ou jest) :

```ts
// ─── RoutineCard.a11y.test.tsx ───────────────────────────────────
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';           // matcher toHaveNoViolations chargé via setup
import { RoutineCard } from './RoutineCard';

const noop = () => {};

it("ne présente aucune violation WCAG (axe)", async () => {
  const { container } = render(
    <RoutineCard title="Bain du soir" time="20:30" onComplete={noop} onDelete={noop} />,
  );
  // axe scanne le DOM rendu : contraste (si couleurs inline), noms, aria, labels
  expect(await axe(container)).toHaveNoViolations();
});

it("expose un nom accessible sur le bouton supprimer", () => {
  render(<RoutineCard title="Bain du soir" time="20:30" onComplete={noop} onDelete={noop} />);
  // getByRole échoue si le bouton n'a pas de nom accessible → couvre WCAG 4.1.2
  expect(
    screen.getByRole('button', { name: 'Supprimer la routine Bain du soir' }),
  ).toBeInTheDocument();
});

it("est activable au clavier (Tab + Entrée)", async () => {
  const onComplete = vi.fn();                 // ou jest.fn()
  const user = userEvent.setup();
  render(<RoutineCard title="Bain" time="20:30" onComplete={onComplete} onDelete={noop} />);
  await user.tab();                           // focus → bouton "Terminer"
  await user.keyboard('{Enter}');
  expect(onComplete).toHaveBeenCalledTimes(1);
});
```

Setup une fois pour tout le projet (charge le matcher) :

```ts
// ─── vitest.setup.ts (ou jest.setup.ts) ──────────────────────────
import { expect } from 'vitest';             // en Jest : ce import n'est pas nécessaire
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

**Ce que le test attrape / n'attrape pas :** `axe` confirme l'absence de violation *détectable* (nom manquant, aria invalide, contraste inline). Le test `userEvent` valide le clavier — qu'axe *ne peut pas* juger. Les deux ensemble couvrent l'auto + une part du manuel automatisable.

### Exemple 2 — Formulaire d'invitation accessible

Le formulaire d'ajout d'un membre à la tribu, conforme RGAA 11 + testé.

```tsx
// ─── InviteForm.tsx ──────────────────────────────────────────────
import { useState } from 'react';

export function InviteForm({ onInvite }: { onInvite: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Saisis une adresse e-mail valide, par exemple prenom@exemple.fr.');
      setStatus('');
      return;
    }
    setError('');
    onInvite(email);
    setStatus(`Invitation envoyée à ${email}.`);
    setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Étiquette liée par htmlFor/id — pas un placeholder */}
      <label htmlFor="invite-email">E-mail de l'invité·e</label>
      <input
        id="invite-email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'invite-email-error' : undefined}
      />

      {/* Erreur en texte, reliée au champ, jamais couleur seule */}
      {error && (
        <p id="invite-email-error" className="field-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit">Envoyer l'invitation</button>

      {/* Succès annoncé sans voler le focus */}
      <p aria-live="polite" className="sr-only">{status}</p>
    </form>
  );
}
```
```css
/* Utilitaire standard : masque visuellement, garde pour lecteurs d'écran */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.field-error { color: var(--color-error-text); } /* #9E5236 = 5.20:1, jamais rouge pur */
```
```ts
// ─── InviteForm.a11y.test.tsx ────────────────────────────────────
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { InviteForm } from './InviteForm';

it("ne présente aucune violation WCAG", async () => {
  const { container } = render(<InviteForm onInvite={() => {}} />);
  expect(await axe(container)).toHaveNoViolations();
});

it("le champ e-mail est atteignable par son étiquette", () => {
  render(<InviteForm onInvite={() => {}} />);
  // getByLabelText échoue si label/htmlFor absent → couvre RGAA 11.1
  expect(screen.getByLabelText("E-mail de l'invité·e")).toBeInTheDocument();
});

it("relie l'erreur au champ via aria-describedby", async () => {
  const user = userEvent.setup();
  render(<InviteForm onInvite={() => {}} />);
  await user.type(screen.getByLabelText("E-mail de l'invité·e"), 'pasunemail');
  await user.click(screen.getByRole('button', { name: "Envoyer l'invitation" }));
  const field = screen.getByLabelText("E-mail de l'invité·e");
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(field).toHaveAccessibleDescription(/adresse e-mail valide/);
});
```

---

## 4. Pièges & misconceptions

### PIÈGE #1 — `outline: none` pour « faire propre »

```css
/* ❌ Supprime l'anneau pour tout le monde → clavier inutilisable */
button:focus { outline: none; }

/* ✅ Enlève l'anneau souris, garde l'anneau clavier avec un style maîtrisé */
button:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
```
Supprimer l'`outline` sans le remplacer est la violation RGAA 10.7 la plus fréquente. Utiliser `:focus-visible`, jamais `:focus` nu.

### PIÈGE #2 — `<div onClick>` au lieu de `<button>`

```tsx
// ❌ Ni focusable, ni activable clavier, sans rôle bouton
<div onClick={onDelete}><TrashIcon /></div>

// ❌ "Rustine" verbeuse et fragile
<div role="button" tabIndex={0} onClick={onDelete}
     onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDelete()}>
  <TrashIcon />
</div>

// ✅ Le natif fait tout : focus, Entrée/Espace, rôle, désactivation
<button type="button" aria-label="Supprimer" onClick={onDelete}>
  <TrashIcon aria-hidden="true" />
</button>
```
**Règle :** une action = un `<button>` ; une navigation = un `<a href>`. On ne recrée jamais un bouton avec un `<div>`.

### PIÈGE #3 — Le contraste jugé « à l'œil » ou sur une valeur périmée

Le vert sauge TribuZen a été documenté « 4.6:1 » alors qu'il est à **4.00:1** — sous le seuil de 4.5. On **ne devine pas** un ratio : on le calcule (formule de luminance relative) ou on le mesure (WebAIM Contrast Checker, axe DevTools). Et on l'audite **sur le token**, pas sur chaque écran.

### PIÈGE #4 — Placeholder utilisé comme étiquette

```tsx
// ❌ Le placeholder disparaît à la saisie, contraste souvent < 4.5, pas lu comme label
<input type="email" placeholder="E-mail de l'invité·e" />

// ✅ Étiquette persistante liée ; placeholder = exemple optionnel en plus
<label htmlFor="invite-email">E-mail de l'invité·e</label>
<input id="invite-email" type="email" placeholder="prenom@exemple.fr" />
```

### PIÈGE #5 — Information portée par la couleur seule

```tsx
// ❌ Statut distinguable uniquement par la couleur (WCAG 1.4.1 échoue)
<span style={{ color: 'green' }}>●</span>   // fait / à faire indiscernables au daltonien

// ✅ Couleur + forme + texte
<span className="status status--done">
  <CheckIcon aria-hidden="true" /> Terminée
</span>
```
**WCAG 1.4.1 Utilisation de la couleur (A) / RGAA 3.1 :** la couleur ne doit jamais être le *seul* vecteur d'une information. On double toujours par un texte, une icône ou un motif.

### PIÈGE #6 — `aria-label` qui écrase un texte déjà correct, ou `aria-hidden` sur focusable

```tsx
// ❌ aria-label redondant qui masque le texte réel (et se désynchronise)
<button aria-label="Envoyer">Envoyer l'invitation</button> // lu "Envoyer", pas le vrai libellé

// ❌ aria-hidden sur un élément focusable → tabbable mais invisible au lecteur d'écran
<button aria-hidden="true" onClick={onDelete}>Supprimer</button>

// ✅ Pas d'aria quand le texte suffit ; aria-hidden réservé au décoratif non focusable
<button>Envoyer l'invitation</button>
<TrashIcon aria-hidden="true" />
```
On n'ajoute `aria-label` **que** quand il n'y a pas de texte visible (bouton icône). « No ARIA is better than bad ARIA. »

---

## 5. Ancrage TribuZen

L'accessibilité de TribuZen se joue **dans le design system**, pas écran par écran : corriger un token propage la conformité partout.

**Audit des tokens de couleur** (`src/styles/tokens.css`) — on scinde chaque couleur en `-surface` (décor, seuil 3:1) et `-text` (texte, seuil 4.5:1) :
```text
--color-text            #2C2C2C   texte principal (12.8:1)
--color-muted-text      #6E6E6E   texte secondaire (4.71:1)   ← était #737373 (4.36 ❌)
--color-primary         #6B7E6B   focus ring, bordures (≥3:1)
--color-primary-text    #5A6B5A   texte/bouton sauge (5.24:1) ← nouveau, corrige le 4.00 ❌
--color-accent-text     #7E5E0A   accent lisible (5.53:1)     ← corrige #D4A017 (2.38 ❌)
--color-error-text      #9E5236   erreurs, jamais rouge (5.20:1)
```

**`RoutineCard`** (`src/components/ui/RoutineCard/`) — passée en `<article>` + `<button>` réels, boutons ≥ 44px, `aria-label` sur l'action icône, `focus-visible`, tokens `-text`. Test `RoutineCard.a11y.test.tsx` avec `jest-axe` (Exemple 1).

**`InviteForm`** (`src/components/features/invite/`) — `<label htmlFor>`, `aria-invalid` + `aria-describedby` sur erreur, `aria-live="polite"` pour le succès, couleur d'erreur terracotta conforme (Exemple 2).

**Intégration jest-axe dans le design system :** setup global (`vitest.setup.ts`) qui charge `toHaveNoViolations`, et une convention « chaque composant du dossier `ui/` a un `*.a11y.test.tsx` avec au moins un `axe(container)` ». Ces tests tournent en CI comme garde-fou de non-régression — complétés par une passe manuelle clavier + lecteur d'écran avant chaque partenariat institutionnel.

Fichiers cibles dans `smaurier/tribuzen` :
```text
tribuzen/src/
  styles/tokens.css                       ← tokens -surface / -text audités
  components/
    ui/RoutineCard/
      RoutineCard.tsx
      RoutineCard.a11y.test.tsx
    features/invite/
      InviteForm.tsx
      InviteForm.a11y.test.tsx
  test/vitest.setup.ts                     ← expect.extend(toHaveNoViolations)
```

---

## 6. Points clés

1. RGAA 4.1 (aligné WCAG 2.1 AA) est la grille française ; on y ajoute la surcouche WCAG 2.2 AA (focus non masqué 2.4.11, taille de cible 2.5.8).
2. Contraste : **4.5:1** texte normal, **3:1** texte large et composants d'interface — on audite les **tokens**, une fois, et toute l'UI en hérite.
3. Un ratio se calcule ou se mesure, jamais à l'œil : le token « sauge » TribuZen était faux (4.00, pas 4.6) → il faut un token `-text` foncé conforme.
4. `:focus-visible` (clavier) et non `:focus` (souris) ni `outline: none` ; l'anneau doit rester visible (2.4.7 / RGAA 10.7).
5. Cible tactile : plancher **24×24px** (WCAG 2.5.8 AA), confort **44×44px** (2.5.5 AAA).
6. HTML natif d'abord (`<button>`, `<a>`, `<label>`) : focus, clavier et rôle gratuits ; ARIA seulement en dernier recours, jamais pour recréer le natif.
7. Tout interactif a un **nom accessible** (4.1.2) ; bouton icône = `aria-label` + icône `aria-hidden`.
8. Formulaire : `<label htmlFor>`, erreur en texte reliée par `aria-describedby` + `aria-invalid`, succès via `aria-live="polite"` ; la couleur seule ne porte jamais l'info (1.4.1).
9. `jest-axe`/axe-core détecte ~30 % des critères (contraste, noms, aria) : garde-fou de non-régression, **pas** une preuve — le reste (clavier, ordre, sens, lecteur d'écran) est un audit manuel.

---

## 7. Seeds Anki

```
Quels sont les deux seuils de contraste AA pour le texte, et lequel s'applique au texte large ?|4.5:1 pour le texte normal, 3:1 pour le texte large (≥ 24px, ou ≥ 18.66px gras). WCAG 1.4.3 / RGAA 3.2.
Quel seuil de contraste s'applique à un focus ring, une bordure d'input ou une icône porteuse de sens ?|3:1 (composants d'interface et éléments graphiques). WCAG 1.4.11 / RGAA 3.3 — distinct du 4.5:1 du texte.
Pourquoi auditer le contraste sur les tokens plutôt que composant par composant ?|Un token audité une fois (ex. --color-text sur --color-surface) propage sa conformité à tous les composants qui le consomment ; une seule paire token/fond non auditée contamine toute l'UI.
Différence entre :focus et :focus-visible en CSS ?|:focus se déclenche aussi au clic souris (anneau jugé indésirable → réflexe outline:none qui casse l'accessibilité). :focus-visible ne se déclenche qu'au clavier : on garde l'anneau au clavier, on l'évite à la souris.
Quelle est la taille de cible tactile minimale AA, et la valeur confort recommandée ?|Minimum 24×24px CSS (WCAG 2.5.8, AA, ajouté en WCAG 2.2). Confort recommandé 44×44px (WCAG 2.5.5, AAA).
Pourquoi préférer <button> à <div onClick> pour une action ?|<button> est nativement focusable et activable au clavier (Entrée/Espace), porte le rôle bouton et gère disabled. Un <div> exigerait role, tabIndex et un handler clavier — trois occasions d'erreur pour recréer le natif.
Comment donner un nom accessible à un bouton composé uniquement d'une icône ?|aria-label sur le <button> pour le nom, et aria-hidden="true" sur l'icône pour la masquer au lecteur d'écran. Encore mieux : ajouter un <span> texte visible (bénéficie à tout le monde, sans aria).
Comment relier un message d'erreur à son champ de formulaire, de façon accessible ?|Erreur en texte (jamais couleur seule) dans un élément avec id, référencé par aria-describedby sur le champ, plus aria-invalid="true" sur le champ. WCAG 3.3.1/3.3.3 / RGAA 11.10-11.11.
Quelle part des critères d'accessibilité un outil comme jest-axe/axe-core détecte-t-il, et que reste-t-il ?|Environ 30 % (jusqu'à ~57 % en usage optimal) : contraste, noms accessibles, aria invalide, labels. Le reste (~70 %) est manuel : navigation clavier, ordre de focus, sens des textes, couleur seule, test lecteur d'écran.
Pourquoi un placeholder ne remplace-t-il pas une étiquette <label> ?|Il disparaît dès la saisie, son contraste est souvent sous 4.5:1, et il n'est pas exposé comme étiquette du champ (WCAG 3.3.2 / RGAA 11.1). Utiliser <label htmlFor> lié à l'id du champ.
```

---

## Pont vers le lab

> Lab associé : `21-design-system/labs/lab-08-accessibilite/README.md`. Auditer les tokens de couleur TribuZen contre les seuils RGAA, corriger la `RoutineCard` et le formulaire d'invitation, et verrouiller la conformité avec de vrais tests `jest-axe`.
