// FamilyFeed — CONSOMMATEUR n°1 de Text (ne pas modifier : c'est un écran en production).
import { Text } from "../Text";

export interface Post {
  id: string;
  author: string;
  body: string;
  publishedAt: string;
}

export function FamilyFeed({ posts }: { posts: Post[] }) {
  return (
    <section aria-label="Fil de la famille">
      {posts.map((p) => (
        <article key={p.id} data-testid={`post-${p.id}`}>
          <Text weight="bold">{p.author}</Text>
          <Text>{p.body}</Text>
          <Text as="span" size="sm" tone="muted">{p.publishedAt}</Text>
        </article>
      ))}
    </section>
  );
}
