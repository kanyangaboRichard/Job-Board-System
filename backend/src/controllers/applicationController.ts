import { Request, Response } from "express";
import { ApplicationService } from "../services/applicationServices";
import sendEmail from "../util/sendEmail";

export const ApplicationController = {
  // Apply for a job
  async apply(req: Request, res: Response) {
    const { jobId } = req.params;
    const { cover_letter, cv_url } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!jobId || isNaN(Number(jobId))) return res.status(400).json({ error: "Invalid job ID" });
    if (!cover_letter || !cv_url)
      return res.status(400).json({ error: "Missing cover letter or CV URL" });

    try {
      const app = await ApplicationService.apply(
        Number(jobId),
        user.id,
        cover_letter,
        cv_url
      );
      return res.status(201).json(app);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  // Fetch applications for a specific job
  async byJob(req: Request, res: Response) {
    try {
      const apps = await ApplicationService.byJob(Number(req.params.jobId));
      res.json(apps);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  },

  // Fetch applications for the logged-in user
  async byUser(req: Request, res: Response) {
    try {
      const apps = await ApplicationService.byUser(Number(req.user!.id));
      res.json(apps);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch user applications" });
    }
  },

  // Fetch all applications (admin use)
  async all(_req: Request, res: Response) {
    try {
      const data = await ApplicationService.all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch all applications" });
    }
  },

  // Update application status and send email
  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, responseNote } = req.body;
    

    try {
      const updated = await ApplicationService.updateStatus(
        Number(id),
        status,
        responseNote
      );

      const details = await ApplicationService.withUserDetails(Number(id));

      if (details.applicant_email) {
        await sendEmail({
          applicant_email: details.applicant_email,
          applicant_name: details.applicant_name,
          job_title: details.job_title,
          status,
          responseNote,
        } as any);
      }

      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
