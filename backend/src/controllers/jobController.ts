import { Request, Response } from "express";
import { createJob, getAllJobs, getJobById, Job } from "../models/jobModels";

// Create a new job
export const addJob = async (req: Request, res: Response) => {
  try {
    const { title, description, location } = req.body as Job;
    const job = await createJob({ title, description, location });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get all jobs
export const listJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await getAllJobs();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get single job by ID
export const getJob = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id ?? "");
    const job = await getJobById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
