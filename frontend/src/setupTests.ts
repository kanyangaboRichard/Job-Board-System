// src/setupTests.ts
import "@testing-library/jest-dom"; // for extended matchers like toBeInTheDocument()

// Optional: mock browser APIs if needed
import { vi } from "vitest";

// Example: mock fetch if your tests use it
global.fetch = vi.fn();

// Optional: silence console errors during tests
vi.spyOn(console, "error").mockImplementation(() => {});
