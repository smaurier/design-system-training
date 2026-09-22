// ConfirmDialog.tsx — SOLUTION DE RÉFÉRENCE (commentée). Ne l'ouvre pas avant ton GREEN.
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
          {/* Dialog.Title pose aria-labelledby sur Dialog.Content automatiquement — c'est
              CE lien, pas le texte visuel lui-même, qui donne son nom au dialogue. */}
          <Dialog.Title>Supprimer ce post ?</Dialog.Title>
          <Dialog.Description>Cette action est irréversible.</Dialog.Description>
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
            <button type="button" aria-label="Fermer">
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
