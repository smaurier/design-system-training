// Rend le matcher jest-axe visible au typage de vitest (toHaveNoViolations).
// Vitest ≥ 3 : on augmente `Matchers`, pas `Assertion`.
import "vitest";

declare module "vitest" {
  interface Matchers<T = unknown> {
    toHaveNoViolations(): void;
  }
}
