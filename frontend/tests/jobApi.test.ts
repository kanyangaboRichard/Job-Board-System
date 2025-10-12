// tests/api/jobApi.test.ts
import { describe, it, expect, vi } from "vitest";
import api from "../src/api/apiClient";
import {
  getJobs,
  getJobById,
  createJob,
  type JobData,
} from "../src/api/jobs";

//  Mock your custom Axios instance (`api`)
vi.mock("../src/api/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Grab the mocked version
const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

describe("Job API (frontend)", () => {
  //  GET /jobs
  it("fetches jobs successfully", async () => {
    const mockJobs = [
      {
        id: 1,
        title: "Frontend Developer",
        location: "Kigali",
        description: "React + TypeScript",
        salary: 2000,
      },
    ];

    mockedApi.get.mockResolvedValueOnce({ data: mockJobs });

    const result = await getJobs();
    expect(result).toEqual(mockJobs);
    expect(mockedApi.get).toHaveBeenCalledWith("/jobs");
  });

  //  GET /jobs/:id
  it("fetches a job by ID", async () => {
    const mockJob = {
      id: 1,
      title: "Backend Engineer",
      location: "Kigali",
      description: "Node.js Developer",
      salary: 2500,
    };

    mockedApi.get.mockResolvedValueOnce({ data: mockJob });

    const result = await getJobById(1);
    expect(result).toEqual(mockJob);
    expect(mockedApi.get).toHaveBeenCalledWith("/jobs/1");
  });

  //  POST /jobs
  it("creates a job successfully", async () => {
    const newJob: JobData = {
      title: "DevOps Engineer",
      description: "CI/CD setup",
      location: "Kigali",
      salary: 3000,
    };

    mockedApi.post.mockResolvedValueOnce({ data: { id: 3, ...newJob } });

    const result = await createJob(newJob);
    expect(result).toMatchObject({ id: 3, ...newJob });
    expect(mockedApi.post).toHaveBeenCalledWith("/jobs", newJob);
  });

  //  Error handling
  it("handles API errors correctly", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("Network error"));

    await expect(getJobs()).rejects.toThrow("Network error");
  });
});
