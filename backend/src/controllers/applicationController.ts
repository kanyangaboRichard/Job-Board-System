// src/controllers/applicationController.ts
import { RequestHandler } from "express";
import * as applicationService from "../services/applicationServices";

/**
 * Apply for a job
 */
export const applyForJob: RequestHandler = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId || isNaN(parseInt(jobId, 10))) {
      return res.status(400).json({ error: "Valid Job ID is required" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { cover_letter } = req.body as { cover_letter?: string };
    const file = req.file as Express.Multer.File | undefined;

    if (!cover_letter || !file) {
      return res
        .status(400)
        .json({ error: "Cover letter and CV file are required" });
    }

    const cv_url = `/uploads/${file.filename}`;

    const application = await applicationService.applyForJobService(
      jobId,
      req.user.id,
      cover_letter,
      cv_url
    );

    return res.status(201).json(application);
  } catch (err: any) {
    if (err.message === "Already applied to this job") {
      return res.status(409).json({ error: err.message });
    }
    console.error("Apply job error:", err);
    return res.status(500).json({ error: "Failed to apply for job" });
  }
};

/**
 * Get applications by job (Admin/Employer)
 */
export const getApplicationsByJob: RequestHandler = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!jobId || isNaN(parseInt(jobId, 10))) {
      return res.status(400).json({ error: "Valid Job ID is required" });
    }

    const applications = await applicationService.getApplicationsByJobService(jobId);
    return res.json(applications);
  } catch (err) {
    console.error("Get applications error:", err);
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
};

/**
 * Get current user's applications
 */
export const getUserApplications: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const applications = await applicationService.getUserApplicationsService(
      req.user.id
    );

    return res.json(applications);
  } catch (err) {
    console.error("Get user applications error:", err);
    return res.status(500).json({ error: "Failed to fetch user applications" });
  }
};

/**
 * Get all applications (Admin)
 */
export const getAllApplications: RequestHandler = async (_req, res) => {
  try {
    const applications = await applicationService.getAllApplicationsService();
    return res.json(applications);
  } catch (err) {
    console.error("Get all applications error:", err);
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
};

/**
 * Update application status (Admin)
 */
export const updateApplicationStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseNote } = req.body as {
      status?: string;
      responseNote?: string;
    };

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: "Valid Application ID is required" });
    }

    const validStatuses = ["pending", "accepted", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updated = await applicationService.updateApplicationStatusService(
      id,
      status as any,
      responseNote
    );

    return res.json(updated);
  } catch (err: any) {
    if (err.message === "Application not found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Update application error:", err);
    return res.status(500).json({ error: "Failed to update application" });
  }
};
