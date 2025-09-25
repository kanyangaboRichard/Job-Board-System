import { Request, Response } from "express";
import * as applicationService from "../services/applicationServices";

// -------------------
// Apply for a job
// -------------------
export const applyForJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    const { cover_letter, cv_url } = req.body;
    const user = req.user as { id: number };

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const application = await applicationService.applyForJobService(
      jobId,
      user.id,
      cover_letter,
      cv_url
    );

    res.status(201).json(application);
  } catch (err: any) {
    if (err.message === "Already applied to this job") {
      return res.status(409).json({ error: err.message });
    }
    console.error("Apply job error:", err);
    res.status(500).json({ error: "Failed to apply for job" });
  }
};

// -------------------
// Get applications by job
// -------------------
export const getApplicationsByJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    const applications = await applicationService.getApplicationsByJobService(jobId);
    res.json(applications);
  } catch (err) {
    console.error("Get applications error:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

// -------------------
// Update application status
// -------------------
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Application ID is required" });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updated = await applicationService.updateApplicationStatusService(id, status);
    res.json(updated);
  } catch (err: any) {
    if (err.message === "Application not found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Update application error:", err);
    res.status(500).json({ error: "Failed to update application" });
  }
};
