// Oracle de NON-RÉGRESSION. Ne pas modifier. Doit rester VERT avant ET après ta correction :
// la modale s'ouvre, s'annule, confirme — au clic, comme un utilisateur souris le ferait.
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "@lab/ConfirmDialog";

afterEach(cleanup);

describe("ConfirmDialog — non-régression", () => {
  it("Annuler ferme sans confirmer", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(<ConfirmDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("Confirmer appelle onConfirm puis ferme", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(<ConfirmDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("rien ne s'affiche quand open est faux", () => {
    render(<ConfirmDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByText("Supprimer ce post ?")).not.toBeInTheDocument();
  });
});
