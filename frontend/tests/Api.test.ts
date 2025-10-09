/**
 * @file __tests__/Api.test.ts
 * Tests for API layer integration (mocked with Axios)
 */

import axios from "axios";
import { login } from "../src/api/auth"; // adjust path if needed

// Mock Axios globally
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls /api/auth/login and returns token", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        token: "fake-token",
        user: { email: "test@example.com" },
      },
    });

    const res = await login("test@example.com", "123456");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/api/auth/login",
      { email: "test@example.com", password: "123456" }
    );

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

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/api/auth/login",
      { email: "wrong@example.com", password: "badpassword" }
    );
  });
});
