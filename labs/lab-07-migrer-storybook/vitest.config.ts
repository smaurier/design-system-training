// Oracle du lab : `@lab/*` -> TON code (src/). `LAB_SOURCE_PATH` pointe le même fichier
// pour la relecture statique. `npm run lab:07` depuis 21-design-system/labs.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const SOURCE = fileURLToPath(new URL("./src/Badge.stories.tsx", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@lab": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
    env: { LAB_SOURCE_PATH: SOURCE },
    typecheck: { enabled: true, include: ["test/**/*.test-d.ts", "test/**/*.test-d.tsx"], tsconfig: "./tsconfig.json" },
  },
});
