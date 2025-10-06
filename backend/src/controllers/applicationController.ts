import { RequestHandler } from "express";
import * as applicationService from "../services/applicationServices";
import transporter from "../config/email"; 

/**
 * Apply for a job (using CV link instead of file upload)
 */
export const applyForJob: RequestHandler = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Validate job ID
    if (!jobId || isNaN(parseInt(jobId, 10))) {
      return res.status(400).json({ error: "Valid Job ID is required" });
    }

    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract fields from body
    const { cover_letter, cv_url } = req.body as {
      cover_letter?: string;
      cv_url?: string;
    };

    // Validate required fields
    if (!cover_letter || !cv_url) {
      return res
        .status(400)
        .json({ error: "Cover letter and CV URL are required" });
    }

    // Optionally validate CV URL format
    const allowedDomains = ["https://", "http://"];
    if (!allowedDomains.some((prefix) => cv_url.startsWith(prefix))) {
      return res.status(400).json({ error: "Invalid CV URL format" });
    }

    // Apply via service
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

    const applications =
      await applicationService.getApplicationsByJobService(jobId);
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
    return res
      .status(500)
      .json({ error: "Failed to fetch user applications" });
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
 * Automatically sends an email to applicant after update
 */
export const updateApplicationStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseNote } = req.body as {
      status?: string;
      responseNote?: string;
    };

    if (!id || isNaN(parseInt(id, 10))) {
      return res
        .status(400)
        .json({ error: "Valid Application ID is required" });
    }

    const validStatuses = ["pending", "accepted", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Update status in DB
    const updated = await applicationService.updateApplicationStatusService(
      id,
      status as any,
      responseNote
    );

    //  Fetch applicant + job details for email
    const details = await applicationService.getApplicationWithUserDetailsService(
      id
    );
    const { applicant_email, applicant_name, job_title } = details;

    //  Send email notification
    try {
      await transporter.sendMail({
        from: `"Job Board System" <${process.env.EMAIL_USER}>`,
        to: applicant_email,
        cc: process.env.SYSTEM_EMAIL || process.env.EMAIL_USER, // optional copy
        subject: `Your Application for "${job_title}" has been ${status}`,
        html: `
          <p>Hello ${applicant_name || "Applicant"},</p>
          <p>Your application for <strong>${job_title}</strong> has been <strong>${status}</strong>.</p>
          ${
            responseNote
              ? `<p><em>Message from Admin:</em> ${responseNote}</p>`
              : ""
          }
          <p>Thank you for applying!</p>
          <br/>
          <p>Best regards,<br/>Job Board Team</p>
        `,
      });

      console.log(` Email sent successfully to ${applicant_email}`);
    } catch (emailErr) {
      console.error(" Email sending failed:", emailErr);
    }

    return res.json(updated);
  } catch (err: any) {
    if (err.message === "Application not found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Update application error:", err);
    return res.status(500).json({ error: "Failed to update application" });
  }
};
