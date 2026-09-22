// Oracle du lab : `@lab/*` → TON code (src/). `npm run lab:NN` depuis 21-design-system/labs.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@lab": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
    typecheck: { enabled: true, include: ["test/**/*.test-d.ts", "test/**/*.test-d.tsx"], tsconfig: "./tsconfig.json" },
  },
});
