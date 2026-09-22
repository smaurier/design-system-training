// RoutineCard — CONSOMMATEUR n°3 de Text (ne pas modifier). Note : il passe un className et un onClick à Text.
import { Text } from "../Text";

export function RoutineCard({ title, description, onOpen }: { title: string; description: string; onOpen: () => void }) {
  return (
    <div className="routine-card" role="group" aria-label={title}>
      <Text size="lg" weight="bold" className="routine-card__title">{title}</Text>
      <Text className="routine-card__description" onClick={onOpen}>{description}</Text>
    </div>
  );
}
