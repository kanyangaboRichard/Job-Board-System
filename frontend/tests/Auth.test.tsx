/**
 * @file __tests__/Auth.test.tsx
 * Tests for Login component UI and behavior.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Import your Login component
import Login from "../src/pages/Login";

// Mock the API module used by the Login page
jest.mock("../src/api/auth", () => ({
  login: jest.fn().mockResolvedValue({
    token: "fake-jwt-token",
    user: { email: "test@example.com" },
  }),
}));

import { login } from "../src/api/auth";

describe("Authentication UI", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form correctly", () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("calls login API when form is submitted", async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "123456");
    await userEvent.click(loginButton);

    expect(login).toHaveBeenCalledWith("test@example.com", "123456");
  });
});
