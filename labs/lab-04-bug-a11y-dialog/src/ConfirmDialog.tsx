// ConfirmDialog.tsx — L'EXISTANT, EN PRODUCTION. Un utilisateur de lecteur d'écran a
// rapporté un bug — lis FINDINGS.md, remplis-le, PUIS reviens ici. Ce fichier COMPILE et
// MARCHE déjà à la souris : la modale s'ouvre, se ferme, confirme. Le bug n'est visible
// qu'au clavier/lecteur d'écran ou par un scan automatisé (jest-axe).
import * as Dialog from "@radix-ui/react-dialog";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, onOpenChange, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="ds-dialog-overlay" />
        <Dialog.Content className="ds-dialog-content">
          {/* Un <h2> visuel, mais PAS Dialog.Title — rien ne le relie au dialogue pour un
              lecteur d'écran (pas d'aria-labelledby généré). */}
          <h2>Supprimer ce post ?</h2>
          <p>Cette action est irréversible.</p>
          <div>
            <button type="button" onClick={() => onOpenChange(false)}>
              Annuler
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              Confirmer
            </button>
          </div>
          <Dialog.Close asChild>
            {/* Un caractère visuel seul n'est pas un nom accessible. */}
            <button type="button">×</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
