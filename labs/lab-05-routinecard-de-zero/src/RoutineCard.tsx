// RoutineCard.tsx — PAGE BLANCHE. Un composant COMPOSÉ (pas un atome comme Text/Button) :
// sa complexité n'est pas dans les variants visuels, elle est dans ses ÉTATS. TribuZen
// affiche les routines d'une famille (brossage de dents, devoirs…) — la carte doit
// représenter honnêtement les trois états réels d'un appel réseau : en cours, en échec,
// terminé (vide ou rempli).
//
// Le contrat (ENDROIT 1) — une UNION DISCRIMINÉE par `status`, pas des props optionnelles en
// vrac. Le but : rendre les états impossibles IMPOSSIBLES à construire.
//
//   type RoutineTask = { id: string; label: string; time: string };
//
//   type RoutineCardProps =
//     | { status: "loading" }
//     | { status: "error"; message: string; onRetry: () => void }
//     | { status: "success"; tasks: RoutineTask[] };
//
// Le mapping (ENDROIT 2) — un rendu DIFFÉRENT par état, avec le bon rôle ARIA :
//
//   - "loading" → un conteneur `role="status"` (annonce POLIE, n'interrompt rien) contenant
//     3 lignes de squelette `aria-hidden="true"`, et un texte visible "Chargement des
//     routines…" (peut être visuellement discret mais doit rester dans le DOM pour un
//     lecteur d'écran).
//   - "error" → un conteneur `role="alert"` (annonce IMMÉDIATE — une erreur interrompt),
//     affiche `message`, un bouton "Réessayer" qui appelle `onRetry`.
//   - "success" avec `tasks` VIDE → un texte "Aucune routine pour l'instant."
//   - "success" avec `tasks` non vide → une `<ul>` d'items `{label} — {time}`.
//
// L'hygiène (ENDROIT 3) — `status` ne doit JAMAIS fuir comme attribut HTML.
//
// La story (ENDROIT 5) — `RoutineCard.stories.tsx`, CSF3, AU MOINS les stories `Default`
// (success, quelques tâches), `Vide` (success, tasks: []), `Chargement` (loading), `Erreur`
// (error). Une prop/état sans story n'existe pas.
export interface RoutineTask {
  id: string;
  label: string;
  time: string;
}

export type RoutineCardProps =
  | { status: "loading" }
  | { status: "error"; message: string; onRetry: () => void }
  | { status: "success"; tasks: RoutineTask[] };

export function RoutineCard(_props: RoutineCardProps) {
  throw new Error("RoutineCard n'est pas encore implémenté");
}
