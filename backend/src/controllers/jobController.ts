import { Request, Response } from "express";
import * as jobService from "../services/jobServices";

// -------------------
// GET all jobs
// -------------------
export const getJobs = async (req: Request, res: Response) => {
  try {
    const { title, location } = req.query;
    const jobs = await jobService.getJobsService(
      title as string | undefined,
      location as string | undefined
    );
    res.json(jobs);
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// -------------------
// GET job by ID
// -------------------
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    const job = await jobService.getJobByIdService(id);
    res.json(job);
  } catch (err: any) {
    if (err.message === "Job not found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Get job error:", err);
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

// -------------------
// CREATE job (Admin)
// -------------------
export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, company, location, description, deadline } = req.body;
    const user = req.user as { id: number };

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ Validate required fields
    if (!title || !company || !location || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Optional: validate deadline format
    if (deadline && isNaN(Date.parse(deadline))) {
      return res.status(400).json({ error: "Invalid deadline format" });
    }

    const job = await jobService.createJobService(
      title,
      company,
      location,
      description,
      user.id,
      deadline // ✅ new field
    );

    res.status(201).json(job);
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Failed to create job" });
  }
};

// -------------------
// UPDATE job (Admin)
// -------------------
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, company, location, description, deadline } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // ✅ Optional: validate deadline
    if (deadline && isNaN(Date.parse(deadline))) {
      return res.status(400).json({ error: "Invalid deadline format" });
    }

    const job = await jobService.updateJobService(
      id,
      title,
      company,
      location,
      description,
      deadline // ✅ include deadline
    );

    res.json(job);
  } catch (err: any) {
    if (err.message === "Job not found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Update job error:", err);
    res.status(500).json({ error: "Failed to update job" });
  }
};

// -------------------
// DELETE job (Admin)
// -------------------
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    await jobService.deleteJobService(id);
    res.json({ message: "Job deleted successfully" });
  } catch (err: any) {
    if (err.message === "Job not found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Delete job error:", err);
    res.status(500).json({ error: "Failed to delete job" });
  }
};
