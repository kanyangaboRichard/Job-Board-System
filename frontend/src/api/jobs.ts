// src/api/jobs.ts
import api from "./apiClient";

export const getJobs = async () => {
  const res = await api.get("/jobs");
  return res.data;
};

export const getJobById = async (id: string | number) => {
  const res = await api.get(`/jobs/${id}`);
  return res.data;
};

export interface JobData {
  title: string;
  description: string;
  location: string;
  salary?: number;
}

export const createJob = async (jobData: JobData) => {
  const res = await api.post("/jobs", jobData);
  return res.data;
};
