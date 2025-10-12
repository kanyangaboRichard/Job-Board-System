// tests/Auth.test.tsx
import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";

// 🧩 Partial mock: mock only the login thunk, keep the rest real
vi.mock("../src/features/auth/authSlice", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/features/auth/authSlice")>();
  return {
    ...actual,
    login: vi.fn(() => ({
      type: "auth/login/fulfilled",
      payload: { user: { email: "test@example.com", role: "user" } },
    })),
  };
});

import * as authSlice from "../src/features/auth/authSlice";
import authReducer from "../src/features/auth/authSlice";
import Login from "../src/pages/Login";

// ✅ Helper: Render component with Redux store + Router
function renderWithProviders(ui: React.ReactNode) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { token: null, user: null, loading: false, error: null },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/login"]}>{ui}</MemoryRouter>
    </Provider>
  );
}

describe("Authentication UI (partial mock)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form correctly", () => {
    renderWithProviders(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("dispatches login thunk with correct payload when form is submitted", async () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "123456");
    await userEvent.click(loginButton);

    expect(authSlice.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "123456",
    });
  });
});
