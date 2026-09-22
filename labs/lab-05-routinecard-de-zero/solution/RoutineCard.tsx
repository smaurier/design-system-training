// RoutineCard.tsx — SOLUTION DE RÉFÉRENCE (commentée). Ne l'ouvre pas avant ton GREEN.
import "./tokens.css";
import "./RoutineCard.css";

export interface RoutineTask {
  id: string;
  label: string;
  time: string;
}

export type RoutineCardProps =
  | { status: "loading" }
  | { status: "error"; message: string; onRetry: () => void }
  | { status: "success"; tasks: RoutineTask[] };

export function RoutineCard(props: RoutineCardProps) {
  if (props.status === "loading") {
    return (
      <div className="ds-routine-card ds-routine-card--loading" role="status">
        <span>Chargement des routines…</span>
        <div className="ds-routine-card__skeleton-row" aria-hidden="true" />
        <div className="ds-routine-card__skeleton-row" aria-hidden="true" />
        <div className="ds-routine-card__skeleton-row" aria-hidden="true" />
      </div>
    );
  }

  if (props.status === "error") {
    return (
      <div className="ds-routine-card ds-routine-card--error" role="alert">
        <p>{props.message}</p>
        <button type="button" onClick={props.onRetry}>
          Réessayer
        </button>
      </div>
    );
  }

  if (props.tasks.length === 0) {
    return (
      <div className="ds-routine-card ds-routine-card--empty">
        <p>Aucune routine pour l'instant.</p>
      </div>
    );
  }

  return (
    <ul className="ds-routine-card ds-routine-card--filled">
      {props.tasks.map((task) => (
        <li key={task.id}>
          {task.label} — {task.time}
        </li>
      ))}
    </ul>
  );
}
