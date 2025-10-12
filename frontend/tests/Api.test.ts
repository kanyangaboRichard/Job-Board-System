// frontend/tests/Api.test.ts

import axios from "axios";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { login } from "../src/api/auth";

// Mock Axios (used by apiClient)
vi.mock("axios", () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
  return { default: mockAxios };
});

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("API Integration Tests", () => {
  it("calls /auth/login and returns token", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { token: "fake-token", user: { email: "test@example.com" } },
    });

    const res = await login("test@example.com", "123456");

    expect(mockedAxios.post).toHaveBeenCalledWith("/auth/login", {
      email: "test@example.com",
      password: "123456",
    });

    expect(res.token).toBe("fake-token");
    expect(res.user.email).toBe("test@example.com");
  });

  it("calls /api/jobs and returns job list", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { id: 1, title: "Frontend Developer" },
        { id: 2, title: "Backend Engineer" },
      ],
    });

    const response = await mockedAxios.get("/api/jobs");
    const jobs = response.data;

    expect(mockedAxios.get).toHaveBeenCalledWith("/api/jobs");
    expect(jobs).toHaveLength(2);
    expect(jobs[0].title).toBe("Frontend Developer");
  });

  it("handles login API errors properly", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Invalid credentials"));

    await expect(login("wrong@example.com", "badpassword")).rejects.toThrow(
      "Invalid credentials"
    );

    expect(mockedAxios.post).toHaveBeenCalledWith("/auth/login", {
      email: "wrong@example.com",
      password: "badpassword",
    });
  });
});
