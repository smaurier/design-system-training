---
titre: Radix UI — primitives headless et accessibles
cours: 21-design-system
notions: [primitives headless, comportement vs style, pattern asChild, composition Root/Trigger/Content, focus management et clavier, ARIA fourni par la lib, controlled vs uncontrolled, styliser via data-state avec Tailwind, package radix-ui unifié]
outcomes: [assembler un composant Radix par composition Root/Trigger/Content, styliser un primitive headless aux tokens TribuZen via les data-attributes, choisir controlled ou uncontrolled selon le besoin]
prerequis: [02-tailwind-css]
next: 04-shadcn-ui
libs: [{ name: react, version: "^19" }, { name: "@radix-ui/react-dialog", version: "latest" }]
tribuzen: modale d'invitation famille (Radix Dialog) et menu d'actions d'une RoutineCard (Radix DropdownMenu), stylés aux tokens TribuZen
last-reviewed: 2026-07
---

# Radix UI — primitives headless et accessibles

> **Outcomes — tu sauras FAIRE :** assembler un composant Radix par composition `Root`/`Trigger`/`Content`, styliser un primitive headless aux tokens TribuZen via ses `data-attributes`, choisir entre mode controlled et uncontrolled selon le besoin.
> **Difficulté :** :star::star::star:

## 1. Cas concret d'abord

TribuZen a besoin d'une modale « Inviter un membre de la famille ». Un collègue livre cette version « maison » :

```tsx
// InviteModal.tsx — modale artisanale, AVANT Radix
function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Inviter un membre</h2>
        <input placeholder="email@exemple.fr" />
        <button onClick={onClose}>Annuler</button>
        <button>Envoyer l'invitation</button>
      </div>
    </div>
  );
}
```

Ça « marche » à la souris. Mais un audit d'accessibilité la rejette :

1. **Escape ne ferme pas** — il faut brancher `keydown` à la main.
2. **Le focus n'est pas piégé** — au `Tab`, on sort de la modale et on tabule dans la page en arrière-plan, toujours cliquable.
3. **À la fermeture, le focus ne revient pas** sur le bouton qui a ouvert la modale — le lecteur d'écran se perd.
4. **Aucun ARIA** — pas de `role="dialog"`, pas de `aria-modal`, pas de lien `aria-labelledby` vers le titre. Un lecteur d'écran ne l'annonce pas comme une boîte de dialogue.
5. **Le reste du DOM reste lisible** par le lecteur d'écran alors qu'il devrait être masqué (`aria-hidden`).

Réimplémenter tout ça correctement, c'est 150+ lignes fragiles à maintenir sur *chaque* composant interactif (menu, popover, tooltip, select…). Radix UI fournit ce comportement + cette accessibilité, **sans imposer un seul pixel de style**. Tu gardes 100 % du visuel ; la lib gère la mécanique invisible. C'est exactement ce que doit faire la base d'un design system.

---

## 2. Théorie complète, concise

### 2.1 Ce qu'est un primitive « headless »

Un composant **headless** fournit le *comportement* et l'*accessibilité*, mais **aucun style**. Il ne rend presque aucun CSS : à toi d'amener Tailwind (ou autre).

```
Lib « classique » (Bootstrap, MUI par défaut) :
  comportement + accessibilité + STYLE opinioné  →  override CSS fragile

Radix UI (headless) :
  comportement + accessibilité  →  OUI
  style                         →  RIEN, tu possèdes 100 % du visuel
```

Pourquoi c'est la **fondation d'un design system** : ta marque vit dans *tes* tokens (couleurs, radius, espacements). Tu ne veux pas te battre contre le CSS d'une lib. Tu veux une brique qui garantit l'a11y (WCAG, WAI-ARIA APG) et te laisse peindre par-dessus. Radix = le squelette accessible ; toi = la peau.

### 2.2 Ce que Radix gère automatiquement (à ne PAS réimplémenter)

| Feature | Sans Radix | Avec Radix |
|---|---|---|
| Fermeture `Escape` | `addEventListener('keydown')` manuel | intégré |
| Focus trap dans la modale | lib externe (`focus-trap`) | intégré |
| Retour du focus au trigger à la fermeture | code complexe | intégré |
| `aria-expanded` / `aria-haspopup` | état géré à la main | intégré |
| `role="dialog"` + `aria-modal` | oubli fréquent | intégré |
| Navigation clavier ↑ ↓ dans un menu | 50+ lignes | intégré |
| Click-outside pour fermer | hook custom | intégré |
| `aria-labelledby` / `aria-describedby` reliés au titre/description | câblage manuel | intégré via `Title`/`Description` |

### 2.3 Le pattern de composition : Root / Trigger / Content

Chaque primitive Radix s'assemble comme des pièces d'un même ensemble, importées depuis un même namespace. Le vocabulaire est régulier d'un composant à l'autre :

- `Root` — le conteneur d'état (ouvert/fermé, valeur sélectionnée…).
- `Trigger` — l'élément qui ouvre/déclenche.
- `Portal` — rend le contenu dans `document.body` (échappe à l'`overflow: hidden` et aux `z-index` du parent).
- `Content` — le panneau affiché.
- pièces spécifiques : `Overlay`, `Title`, `Description`, `Close`, `Item`, `Separator`…

```tsx
import * as Dialog from "@radix-ui/react-dialog";

<Dialog.Root>
  <Dialog.Trigger>Ouvrir</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Titre</Dialog.Title>
      <Dialog.Description>Sous-titre</Dialog.Description>
      <Dialog.Close>Fermer</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

Tu composes ; Radix relie l'a11y entre les pièces (le `Title` devient l'`aria-labelledby` du `Content`, etc.).

### 2.4 Le pattern `asChild` — fusionner au lieu d'empiler

Par défaut, `Dialog.Trigger` rend son *propre* `<button>`. Si tu veux utiliser **ton** bouton (avec tes classes, ou un `<Link>`), tu ne veux pas deux boutons imbriqués. `asChild` dit à Radix : « ne rends pas ton élément, **fusionne** tes props (onClick, aria-*, ref…) sur mon unique enfant ».

```tsx
// ❌ Sans asChild : Radix rend un <button>, et tu en imbriques un second → <button><button>
<Dialog.Trigger>
  <button className="btn-primary">Inviter</button>
</Dialog.Trigger>

// ✅ Avec asChild : Radix fusionne ses props sur TON bouton, un seul élément rendu
<Dialog.Trigger asChild>
  <button className="btn-primary">Inviter</button>
</Dialog.Trigger>
```

Règle : `asChild` attend **exactement un enfant** React, et cet enfant doit forwarder ses props/ref au DOM (les composants HTML natifs et ceux faits avec `React.forwardRef` le font). C'est le mécanisme clé pour intégrer Radix dans *ton* système de composants sans double markup.

### 2.5 Controlled vs uncontrolled

Comme les inputs React, un primitive Radix peut gérer son état lui-même (**uncontrolled**) ou te le déléguer (**controlled**).

```tsx
// Uncontrolled : Radix gère l'ouverture. defaultOpen = valeur initiale seulement.
<Dialog.Root defaultOpen={false}> … </Dialog.Root>

// Controlled : TU possèdes l'état. open + onOpenChange obligatoires ensemble.
const [open, setOpen] = useState(false);
<Dialog.Root open={open} onOpenChange={setOpen}> … </Dialog.Root>
```

- **Uncontrolled** (`defaultOpen`, `defaultValue`) : plus simple, à privilégier quand aucun autre code n'a besoin de connaître l'état.
- **Controlled** (`open` + `onOpenChange`, ou `value` + `onValueChange`) : nécessaire dès que tu dois ouvrir/fermer depuis l'extérieur (après un `fetch` réussi, fermer la modale par exemple) ou synchroniser avec une URL / un store.

### 2.6 Styliser via les `data-attributes` (`data-state`)

Radix n'a pas de style, mais il **expose son état par des `data-attributes`** que tu cibles en Tailwind avec la syntaxe `data-[…]:`.

```
data-state="open" | "closed"          (Dialog, Popover, DropdownMenu…)
data-state="active" | "inactive"      (Tabs.Trigger)
data-side="top|bottom|left|right"     (position calculée d'un Content flottant)
data-highlighted                      (item survolé/navigué au clavier dans un menu)
data-disabled                         (item désactivé)
```

```tsx
<Dialog.Content
  className={cn(
    "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    "rounded-tz-lg bg-tz-surface p-6 shadow-xl",
    // animation pilotée par l'état exposé par Radix :
    "data-[state=open]:animate-in data-[state=open]:fade-in-0",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
    "focus:outline-none" // Radix gère le focus, pas besoin d'un ring ici
  )}
>
```

C'est ce couplage — **Radix expose l'état, Tailwind le peint** — qui fait qu'un design system headless reste 100 % stylable sans jamais toucher au comportement.

### 2.7 Installation et le package `radix-ui` unifié

Historiquement, chaque primitive s'installait séparément : `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, etc.

```bash
# Approche par primitive (toujours valide et supportée)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

```tsx
import * as Dialog from "@radix-ui/react-dialog";
```

Radix a depuis publié un **package unique `radix-ui`** qui ré-exporte tous les primitives. Un seul install, des imports nommés, et un versionnage unifié :

```bash
# Approche package unifié (recommandée en projet neuf)
npm install radix-ui
```

```tsx
import { Dialog, DropdownMenu, Tooltip } from "radix-ui";
// puis <Dialog.Root>, <DropdownMenu.Root>, etc.
```

Les deux approches coexistent : l'API des composants est identique, seul l'import change. shadcn/ui (module suivant) s'appuie sur Radix et gère cette installation pour toi quand tu ajoutes un composant. Choisis l'unifié en greenfield ; garde les packages granulaires si tu veux limiter strictement ce que tu embarques.

> **Vérification de version :** Context7 était indisponible (quota mensuel dépassé) au moment de la relecture. L'existence du package `radix-ui` unifié et la persistance des packages `@radix-ui/react-*` sont confirmées par mémoire à jour (jan. 2026) mais **à revérifier** sur `radix-ui.com` avant un usage en production, notamment le statut « stable vs preview » de certains primitives.

---

## 3. Worked examples

### Exemple 1 — Modale d'invitation famille (Dialog controlled) — TribuZen

On reprend le cas concret, mais correct : a11y gérée par Radix, style aux tokens TribuZen, et mode **controlled** pour fermer la modale automatiquement après un envoi réussi.

```tsx
// components/family/InviteMemberDialog.tsx
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { sendInvite } from "@/lib/api/family";

export function InviteMemberDialog({ familyId }: { familyId: string }) {
  // Controlled : on veut fermer la modale nous-mêmes après l'appel réseau.
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await sendInvite(familyId, email);
    setPending(false);
    setOpen(false); // fermeture pilotée par notre état -> mode controlled indispensable
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* asChild : on réutilise NOTRE bouton stylé, pas celui de Radix */}
      <Dialog.Trigger asChild>
        <button className="rounded-tz bg-tz-primary px-4 py-2 text-tz-on-primary">
          Inviter un membre
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay : Radix pose aria-hidden sur le reste du DOM */}
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 bg-black/50",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
        />

        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-md rounded-tz-lg bg-tz-surface p-6 shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "focus:outline-none"
          )}
        >
          {/* Title -> devient aria-labelledby du dialog automatiquement */}
          <Dialog.Title className="font-tz-heading text-lg font-semibold text-tz-on-surface">
            Inviter un membre de la famille
          </Dialog.Title>
          {/* Description -> aria-describedby automatique */}
          <Dialog.Description className="mt-1 text-sm text-tz-muted">
            L'invité recevra un lien pour rejoindre votre espace TribuZen.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.fr"
              className="w-full rounded-tz border border-tz-border px-3 py-2"
            />

            <div className="flex justify-end gap-3">
              {/* Close asChild : NOTRE bouton, mais Radix branche la fermeture */}
              <Dialog.Close asChild>
                <button type="button" className="rounded-tz border border-tz-border px-4 py-2">
                  Annuler
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending}
                className="rounded-tz bg-tz-primary px-4 py-2 text-tz-on-primary disabled:opacity-50"
              >
                {pending ? "Envoi…" : "Envoyer l'invitation"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

Ce qu'on n'a **pas** eu à écrire : Escape, focus trap, retour du focus au bouton d'origine, `role="dialog"`, `aria-modal`, `aria-labelledby`/`aria-describedby`, `aria-hidden` sur le fond. Tout est fourni par la composition `Root/Trigger/Portal/Overlay/Content/Title/Description/Close`.

### Exemple 2 — Menu d'actions d'une RoutineCard (DropdownMenu uncontrolled) — TribuZen

Un menu « ⋮ » sur une carte de routine. Ici, aucun code externe n'a besoin de connaître l'état d'ouverture → **uncontrolled**, plus simple.

```tsx
// components/routine/RoutineActionsMenu.tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

interface Props {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function RoutineActionsMenu({ onEdit, onDuplicate, onDelete }: Props) {
  return (
    <DropdownMenu.Root>
      {/* aria-haspopup + aria-expanded gérés par Radix */}
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Actions de la routine"
          className="rounded-full p-2 text-tz-muted hover:bg-tz-accent"
        >
          ⋮
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={4}
          className={cn(
            "min-w-[180px] rounded-tz-lg border border-tz-border bg-tz-surface p-1 shadow-md",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[side=bottom]:slide-in-from-top-2"
          )}
        >
          {/* data-highlighted : item ciblé au clavier (↑↓) ou au survol */}
          <DropdownMenu.Item
            onSelect={onEdit}
            className="flex cursor-pointer items-center rounded-tz px-3 py-2 text-sm outline-none data-[highlighted]:bg-tz-accent"
          >
            Modifier
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={onDuplicate}
            className="flex cursor-pointer items-center rounded-tz px-3 py-2 text-sm outline-none data-[highlighted]:bg-tz-accent"
          >
            Dupliquer
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-tz-border" />

          <DropdownMenu.Item
            onSelect={onDelete}
            className="flex cursor-pointer items-center rounded-tz px-3 py-2 text-sm text-tz-danger outline-none data-[highlighted]:bg-tz-danger/10"
          >
            Supprimer
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

Navigation ↑ ↓, `Home`/`End`, tape-pour-chercher, fermeture `Escape` et click-outside, retour du focus au « ⋮ » : tout est intégré. On stylise seulement `data-[highlighted]` et `data-[state]`.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Croire que Radix apporte un style

Radix ne rend quasiment aucun CSS. Un `Dialog.Content` sans classes est invisible / non positionné, ce qui fait croire que « ça ne marche pas ». C'est *voulu* : le style est ton travail.

```tsx
// ❌ « La modale ne s'affiche pas » — non, elle n'a juste ni position ni fond
<Dialog.Content>…</Dialog.Content>

// ✅ Tu poses le positionnement et le fond toi-même
<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-tz-surface p-6 rounded-tz-lg">…</Dialog.Content>
```

### PIÈGE #2 — `asChild` avec plusieurs enfants (ou un enfant qui ne forwarde pas la ref)

`asChild` fusionne ses props sur **un unique** enfant qui doit accepter `ref` et les props DOM.

```tsx
// ❌ Deux enfants : Radix ne sait pas sur lequel fusionner → erreur runtime
<Dialog.Trigger asChild>
  <Icon />
  <span>Inviter</span>
</Dialog.Trigger>

// ❌ Enfant custom qui ne forwarde pas la ref → focus/aria cassés
const Btn = (props) => <button {...props} />; // pas de forwardRef

// ✅ Un seul enfant, natif ou fait avec forwardRef
<Dialog.Trigger asChild>
  <button><Icon /> Inviter</button>
</Dialog.Trigger>
```

### PIÈGE #3 — Mélanger controlled et uncontrolled

Passer `open` sans `onOpenChange` fige la modale (Radix ne peut plus la fermer). Passer les deux `defaultOpen` **et** `open` est contradictoire.

```tsx
// ❌ open sans onOpenChange : impossible de fermer (Escape, Close, outside sont ignorés)
<Dialog.Root open={open}> … </Dialog.Root>

// ❌ defaultOpen + open ensemble : controlled ET uncontrolled → warning React
<Dialog.Root defaultOpen open={open} onOpenChange={setOpen}> … </Dialog.Root>

// ✅ Controlled cohérent
<Dialog.Root open={open} onOpenChange={setOpen}> … </Dialog.Root>
// ✅ Uncontrolled cohérent
<Dialog.Root defaultOpen={false}> … </Dialog.Root>
```

### PIÈGE #4 — Oublier le `Portal` et se battre avec `overflow`/`z-index`

Sans `Portal`, le `Content` est rendu là où il est déclaré dans l'arbre : un parent en `overflow: hidden` le coupe, un `z-index` local le passe sous d'autres éléments.

```tsx
// ❌ Content rendu dans un parent scrollable clippé
<Dialog.Content>…</Dialog.Content>

// ✅ Portal : rendu dans document.body, hors du flux du parent
<Dialog.Portal>
  <Dialog.Overlay />
  <Dialog.Content>…</Dialog.Content>
</Dialog.Portal>
```

### PIÈGE #5 — Réimplémenter l'a11y « pour être sûr »

Ajouter à la main `role="dialog"`, un `onKeyDown` Escape ou un focus-trap maison **duplique** ce que Radix fait déjà et introduit des conflits (double gestion du focus, ARIA en double). Fais confiance au primitive ; ajoute seulement le style et la logique métier.

---

## 5. Ancrage TribuZen

Radix est la couche « comportement + a11y » de tout composant interactif du design system TribuZen. Le style vient des tokens (module 05) via Tailwind (module 02) ; shadcn/ui (module 04) empaquette ces mêmes primitives Radix avec les tokens déjà branchés.

| Composant TribuZen | Primitive Radix | Mode | Fichier cible `smaurier/tribuzen` |
|---|---|---|---|
| Modale d'invitation famille | `Dialog` | controlled (fermer après envoi) | `src/components/family/InviteMemberDialog.tsx` |
| Menu d'actions d'une RoutineCard | `DropdownMenu` | uncontrolled | `src/components/routine/RoutineActionsMenu.tsx` |
| Onglets « Aujourd'hui / Semaine / Toutes » | `Tabs` | uncontrolled (`defaultValue`) | `src/components/routine/RoutineTabs.tsx` |
| Aide contextuelle sur un champ | `Tooltip` | uncontrolled | `src/components/ui/InfoTooltip.tsx` |
| Sélecteur de fréquence de routine | `Popover` + contenu custom | controlled | `src/components/routine/FrequencyPicker.tsx` |

Le fil rouge : **Radix garantit l'accessibilité (obligation, cf. module 08 + certif RGAA), et TribuZen possède 100 % du visuel** via ses tokens. C'est cette séparation qui rend le design system à la fois conforme WCAG et fidèle à la marque.

```
tribuzen/src/components/
  family/   InviteMemberDialog.tsx     ← Dialog controlled
  routine/  RoutineActionsMenu.tsx     ← DropdownMenu uncontrolled
            RoutineTabs.tsx            ← Tabs
            FrequencyPicker.tsx        ← Popover controlled
  ui/       InfoTooltip.tsx            ← Tooltip
```

---

## 6. Points clés

1. Un primitive **headless** fournit comportement + accessibilité, **zéro style** — tu amènes Tailwind et tes tokens.
2. Radix gère automatiquement focus trap, retour du focus, `Escape`, click-outside, navigation clavier et tous les attributs ARIA — à ne **pas** réimplémenter.
3. On assemble par **composition** régulière : `Root` (état) / `Trigger` / `Portal` / `Content`, plus des pièces (`Overlay`, `Title`, `Description`, `Close`, `Item`, `Separator`).
4. **`asChild`** fusionne les props/ref de Radix sur ton unique enfant (natif ou `forwardRef`) au lieu de rendre un élément supplémentaire.
5. **Uncontrolled** (`defaultOpen`/`defaultValue`) par défaut ; **controlled** (`open` + `onOpenChange`) dès qu'un code externe doit piloter ou observer l'état.
6. Radix expose son état via des **`data-attributes`** (`data-state`, `data-side`, `data-highlighted`, `data-disabled`) que tu stylises en Tailwind avec `data-[…]:`.
7. Installation : soit par primitive (`@radix-ui/react-dialog`), soit via le **package unifié `radix-ui`** (`import { Dialog } from "radix-ui"`) — même API, versionnage unifié.

---

## 7. Seeds Anki

```
Que fournit un primitive « headless » comme Radix, et que ne fournit-il pas ?|Il fournit le comportement et l'accessibilité (focus, clavier, ARIA). Il ne fournit AUCUN style — c'est à toi d'amener Tailwind et tes tokens. C'est ce qui en fait la base d'un design system : la lib garantit l'a11y, tu possèdes 100 % du visuel.
Cite quatre choses que Radix gère automatiquement et qu'on ne doit pas réimplémenter.|Focus trap + retour du focus au trigger à la fermeture, fermeture par Escape, click-outside, navigation clavier (fleches) dans les menus, et les attributs ARIA (role=dialog, aria-modal, aria-expanded, aria-labelledby…).
À quoi sert le pattern asChild dans Radix ?|Il dit à Radix de NE PAS rendre son propre élément mais de fusionner ses props (onClick, aria-*, ref) sur son unique enfant. Ça évite le double markup (ex: bouton dans bouton) et permet d'utiliser tes propres composants stylés. L'enfant doit être unique et forwarder sa ref.
Quelle est la différence entre un Dialog controlled et uncontrolled dans Radix ?|Uncontrolled : Radix gère l'état, on ne passe que defaultOpen (valeur initiale). Controlled : on possède l'état avec open + onOpenChange ensemble — obligatoire dès qu'on veut ouvrir/fermer depuis l'extérieur (ex: fermer après un fetch réussi) ou synchroniser avec URL/store.
Comment stylise-t-on l'état d'un composant Radix avec Tailwind ?|Radix expose son état via des data-attributes (data-state=open|closed, data-side, data-highlighted, data-disabled). On les cible en Tailwind avec la syntaxe data-[…]: par ex. data-[state=open]:animate-in ou data-[highlighted]:bg-tz-accent.
Pourquoi entourer le Content d'un Dialog.Portal ?|Le Portal rend le contenu dans document.body, hors du flux du parent. Ça évite qu'un parent en overflow:hidden le coupe ou qu'un z-index local le fasse passer sous d'autres éléments.
Quelles sont les deux façons d'installer Radix aujourd'hui ?|Soit par primitive granulaire (npm i @radix-ui/react-dialog, import * as Dialog from "@radix-ui/react-dialog"), soit via le package unifié (npm i radix-ui, import { Dialog } from "radix-ui"). Même API composant, seul l'import et le versionnage changent.
```

---

## Pont vers le lab

> Lab associé : `21-design-system/labs/lab-03-radix-ui/README.md`. Construire la modale d'invitation famille avec Radix Dialog (a11y gérée, style aux tokens TribuZen), puis le menu d'actions d'une RoutineCard avec Radix DropdownMenu.
