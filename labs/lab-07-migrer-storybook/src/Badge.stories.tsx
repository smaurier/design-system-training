// Badge.stories.tsx — L'EXISTANT, EN PRODUCTION, écrit en CSF2 (le format Storybook d'avant
// la version 7 — `Template.bind({})`, `.args` posé après coup sur la fonction bindée).
// Ticket : « migrer ce catalogue vers CSF3. »
//
// Piège : ce fichier s'affiche encore très bien dans l'UI Storybook 10.6, ET `composeStories`
// le compose et le rend correctement — la compatibilité descendante de Storybook masque le
// vrai problème. La vraie raison de migrer : `Template.bind({})` renvoie un type trop large
// (`.bind()` sur une fonction perd la précision de ses paramètres), donc `Success.args =
// {...}` n'est PLUS vérifié par TypeScript — une faute de frappe dans `tone` ne serait
// jamais signalée avant l'exécution. La CSF3 restaure cette vérification.
//
// Migration attendue (CSF2 → CSF3) :
//
//   - Le `default export` devient un objet `meta` : `{ title, component, args } satisfies
//     Meta<typeof Badge>`, exporté PUIS typé `type Story = StoryObj<typeof meta>`.
//   - Chaque `Template.bind({})` + `.args` devient un export nommé `: Story = { args: {...} }`
//     — un OBJET typé, plus une fonction ni d'assignation a posteriori.
//   - Les noms des stories NE CHANGENT PAS : `Success`, `Warning`, `Danger`.
//   - Le texte "Actif" du Template CSF2 devient `args: { children: "Actif" }` sur `meta`
//     (children est un arg comme un autre, partagé par toutes les stories).
import { Badge } from "../Badge";

export default {
  title: "TribuZen/Badge",
  component: Badge,
};

const Template = (args: { tone?: "success" | "warning" | "danger" }) => <Badge {...args}>Actif</Badge>;

export const Success = Template.bind({});
Success.args = { tone: "success" };

export const Warning = Template.bind({});
Warning.args = { tone: "warning" };

export const Danger = Template.bind({});
Danger.args = { tone: "danger" };
