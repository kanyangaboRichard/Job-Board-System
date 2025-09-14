import { Request, Response } from "express";
import { createApplication, 
    getApplicationsByJobId, 
    getApplicationsByUserId, 
    Application } from "../models/applicationModel";

// Apply for a job
export const applyJob = async (req: Request, res: Response) => {
  try {
    const { user_id, job_id, resume_url } = req.body as Application;
    const application = await createApplication({ user_id, job_id, resume_url });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// List applications by user
export const listApplicationsByUser = async (req: Request, res: Response) => {
  try {
    const user_id = parseInt(req.params.user_id ?? "");
    const applications = await getApplicationsByUserId(user_id);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// List applications by job
export const listApplicationsByJob = async (req: Request, res: Response) => {
  try {
    const job_id = parseInt(req.params.job_id ?? "");
    const applications = await getApplicationsByJobId(job_id);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
