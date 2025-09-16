// src/api/jobs.ts
import apiClient from "./apiClient";

export const getJobs = async () => {
  const res = await apiClient.get("/jobs");
  return res.data;
};

export const getJobById = async (id: string | number) => {
  const res = await apiClient.get(`/jobs/${id}`);
  return res.data;
};

// Define a JobData interface according to your job object structure
export interface JobData {
  title: string;
  description: string;
  location: string;
  salary?: number;
  // Add other fields as needed
}

export const createJob = async (jobData: JobData) => {
  const res = await apiClient.post("/jobs", jobData);
  return res.data;
};
