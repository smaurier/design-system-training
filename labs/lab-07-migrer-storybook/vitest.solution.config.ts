// Même oracle, pointé sur solution/ : `npm run solution:07` doit être GREEN.
// Sert à prouver que l'oracle est juste, pas à apprendre. Ne l'ouvre pas avant ton GREEN.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const SOURCE = fileURLToPath(new URL("./solution/Badge.stories.tsx", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@lab": fileURLToPath(new URL("./solution", import.meta.url)) } },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
    env: { LAB_SOURCE_PATH: SOURCE },
    typecheck: { enabled: true, include: ["test/**/*.test-d.ts", "test/**/*.test-d.tsx"], tsconfig: "./tsconfig.solution.json" },
  },
});
