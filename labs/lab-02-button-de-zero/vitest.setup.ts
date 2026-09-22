// Matchers de l'oracle : jest-dom (toBeInTheDocument, toHaveClass…) + jest-axe (toHaveNoViolations).
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);
