// ProfilePage — CONSOMMATEUR n°2 de Text (ne pas modifier).
import { Text } from "../Text";

export function ProfilePage({ name, bio, families }: { name: string; bio?: string; families: string[] }) {
  return (
    <main>
      <h1>{name}</h1>
      {bio ? <Text id="bio">{bio}</Text> : <Text id="bio" tone="muted">Aucune biographie.</Text>}
      <ul aria-label="Familles">
        {families.map((f) => (
          <li key={f}>
            <Text as="span">{f}</Text>
          </li>
        ))}
      </ul>
    </main>
  );
}
