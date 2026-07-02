# Lab 03 — Radix UI : modale et menu d'actions accessibles

> **Outcome :** à la fin, tu sais assembler un composant Radix headless par composition, le styliser aux tokens TribuZen via ses `data-attributes`, et choisir entre mode controlled et uncontrolled.
> **Vrai outil :** React 19 + `@radix-ui/react-dialog` et `@radix-ui/react-dropdown-menu` dans un projet Vite/Tailwind réel (aucun harnais simulé).
> **Feedback :** le coach valide en session — pas de test-runner auto-correcteur.

## Énoncé

Tu construis deux briques du design system TribuZen, à la main, avec Radix.

Starter minimal (vrai projet) :

```bash
npm create vite@latest tz-radix -- --template react-ts
cd tz-radix
npm install
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install -D @tailwindcss/vite
# Tailwind v4 CSS-first (cohérent lab-02) : PAS de tailwind.config ni de directives @tailwind.
#   1) plugin @tailwindcss/vite dans vite.config.ts (voir ci-dessous)
#   2) une seule ligne dans src/index.css :  @import "tailwindcss";
npm run dev
```

Ajoute un helper `cn` (concat de classes) dans `src/lib/utils.ts` :

```ts
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
```

Le corrigé importe `cn` depuis `@/lib/utils` : l'alias `@` n'existe pas par défaut sur un template Vite, il faut le déclarer (sinon `Failed to resolve import "@/lib/utils"`). Configure Tailwind v4 **et** l'alias dans le même `vite.config.ts` :

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Tailwind v4 CSS-first (remplace la voie PostCSS v3)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // "@" → src, pour que `import { cn } from "@/lib/utils"` résolve
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

> Alternative sans alias : importe en relatif (`import { cn } from "../../lib/utils"`). Si tu utilises l'alias `@`, ajoute aussi `"baseUrl": "."` + `"paths": { "@/*": ["src/*"] }` dans `compilerOptions` de `tsconfig.json` pour que TypeScript le résolve.

Deux composants à produire :

1. **`InviteMemberDialog`** — une modale « Inviter un membre de la famille » avec Radix `Dialog`, en mode **controlled** (elle se ferme toute seule après un envoi simulé de 800 ms). Titre, description, champ email, boutons Annuler / Envoyer. Aucun `role`, `aria-*`, focus-trap ou listener Escape écrit à la main : Radix les fournit.
2. **`RoutineActionsMenu`** — un menu « ⋮ » avec Radix `DropdownMenu` en mode **uncontrolled**, exposant Modifier / Dupliquer / (séparateur) / Supprimer, avec l'item Supprimer en couleur danger.

Contraintes de style : **uniquement des classes Tailwind référençant des tokens TribuZen** (`bg-tz-primary`, `bg-tz-surface`, `text-tz-danger`, `rounded-tz`, `border-tz-border`…). Anime au minimum l'ouverture via `data-[state=open]:`.

## Étapes (en friction)

1. **Dialog, structure d'abord.** Écris l'arbre `Dialog.Root > Trigger(asChild) > Portal > Overlay + Content > Title + Description + form + Close(asChild)`. Fais-le fonctionner en **uncontrolled** (`defaultOpen`) pour vérifier la mécanique.
2. **Passe en controlled.** Ajoute `useState(false)`, branche `open` + `onOpenChange`. Vérifie que le bouton l'ouvre toujours.
3. **Envoi simulé.** Au submit : `preventDefault`, un `setPending(true)`, un `await new Promise(r => setTimeout(r, 800))`, puis `setOpen(false)`. Constate que fermer depuis le code n'est possible que grâce au mode controlled.
4. **Teste l'a11y au clavier** (aucune ligne à écrire) : ouvre, `Tab` reste piégé dans la modale, `Escape` ferme, le focus revient au bouton d'ouverture. Ouvre l'inspecteur : vérifie `role="dialog"`, `aria-modal`, `aria-labelledby` pointant vers le Title.
5. **DropdownMenu.** Écris `Root > Trigger(asChild, aria-label) > Portal > Content > Item×2 + Separator + Item(danger)`. Laisse-le uncontrolled.
6. **Style par data-attributes.** Sur les `Item`, stylise le survol/navigation clavier via `data-[highlighted]:bg-tz-accent`. Navigue au clavier (↑ ↓) pour le voir.
7. **Vérifie le Portal.** Mets un parent `overflow-hidden` autour du menu et confirme que le contenu n'est pas coupé (grâce au `Portal`).

## Corrigé complet commenté

```tsx
// src/components/family/InviteMemberDialog.tsx
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

// Envoi simulé — remplacé par un vrai appel API dans TribuZen.
async function sendInvite(_familyId: string, _email: string) {
  await new Promise((r) => setTimeout(r, 800));
}

export function InviteMemberDialog({ familyId }: { familyId: string }) {
  // CONTROLLED : on possède l'état pour pouvoir fermer après l'envoi.
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await sendInvite(familyId, email); // 800 ms simulés
    setPending(false);
    setOpen(false); // possible UNIQUEMENT parce qu'on est en controlled
  }

  return (
    // open + onOpenChange ensemble = mode controlled cohérent
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* asChild : Radix fusionne ses props sur NOTRE bouton (un seul <button> rendu) */}
      <Dialog.Trigger asChild>
        <button className="rounded-tz bg-tz-primary px-4 py-2 text-tz-on-primary">
          Inviter un membre
        </button>
      </Dialog.Trigger>

      {/* Portal : rendu dans <body>, échappe overflow/z-index du parent */}
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
            "focus:outline-none" // Radix gère le focus : pas de ring ici
          )}
        >
          {/* Title -> aria-labelledby automatique ; Description -> aria-describedby */}
          <Dialog.Title className="text-lg font-semibold text-tz-on-surface">
            Inviter un membre de la famille
          </Dialog.Title>
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
              {/* Close asChild : notre bouton, Radix branche la fermeture */}
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

```tsx
// src/components/routine/RoutineActionsMenu.tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

interface Props {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function RoutineActionsMenu({ onEdit, onDuplicate, onDelete }: Props) {
  // UNCONTROLLED : personne d'externe n'a besoin de l'état d'ouverture.
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
            "data-[state=open]:animate-in data-[state=open]:fade-in-0"
          )}
        >
          {/* data-highlighted = item ciblé au clavier (fleches) OU au survol */}
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

Points de contrôle à vérifier en session (aucune ligne d'a11y écrite par toi) :
- `Escape` ferme la modale, `Tab` y reste piégé, le focus revient au trigger à la fermeture.
- Inspecteur : `role="dialog"`, `aria-modal="true"`, `aria-labelledby` lié au `Title`.
- Menu : ↑ ↓ déplacent le `data-[highlighted]`, `Enter` déclenche `onSelect`, click-outside ferme.

## Variante J+30 (fading)

Reprends **de mémoire, en 25 min**, sans relire le corrigé, en ajoutant **une contrainte** : migre les imports vers le **package unifié `radix-ui`** (`npm i radix-ui` puis `import { Dialog, DropdownMenu } from "radix-ui"`) au lieu des packages `@radix-ui/react-*`. Vérifie que l'API des composants est identique (seul l'import change). Bonus : ajoute un troisième composant `RoutineTabs` avec Radix `Tabs` en uncontrolled (`defaultValue="today"`), stylé via `data-[state=active]:`.

## Application TribuZen

Porte les deux composants dans le vrai dépôt :

- `smaurier/tribuzen` → `src/components/family/InviteMemberDialog.tsx` (Dialog controlled, branché sur le vrai `sendInvite` de l'API famille).
- `smaurier/tribuzen` → `src/components/routine/RoutineActionsMenu.tsx` (DropdownMenu uncontrolled, `onEdit`/`onDuplicate`/`onDelete` câblés sur les mutations réelles).

Remplace toutes les classes `tz-*` par les vrais tokens du thème (module 05). Vérifie que la modale passe l'audit a11y (module 08 / RGAA). Commit :

```
feat(design-system): Dialog d'invitation et menu d'actions RoutineCard (Radix headless, tokens TZ)
```
