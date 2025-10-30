import { Request, Response } from "express";
import { JobService } from "../services/jobServices";

export const JobController = {
  
  // Get all jobs (optionally filter by title/location)
  
  async all(req: Request, res: Response) {
    try {
      const { title, location } = req.query;
      //pagination support
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const offset = (page - 1) * limit;

      const jobs = await JobService.all(title as string, location as string, limit, offset);

      
      res.json(jobs);
    } catch (err) {
      console.error(" Get jobs error:", err);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  },

  
  // Get job by ID
  
  async byId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await JobService.byId(Number(id));
      res.json(job);
    } catch (err: any) {
      if (err.message === "Job not found") {
        return res.status(404).json({ error: err.message });
      }
      console.error(" Get job by ID error:", err);
      res.status(500).json({ error: "Failed to fetch job" });
    }
  },

  
  // Create new job
  
  async create(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        salary,
        deadline,
        company_id,
        location,
        posted_by,
      } = req.body;

      // Debug log for transparency
      console.log("Incoming Job Payload:", req.body);

      // Validate required fields
      if (!title || !description || !company_id || !location) {
        return res.status(400).json({
          error:
            "Missing required fields: title, description, company_id, or location",
        });
      }

      // Convert to proper types
      const job = {
        title,
        description,
        salary: Number(salary) || 0,
        deadline,
        company_id: Number(company_id),
        location,
        posted_by: Number(posted_by), 
        posted_at: new Date(),
      };

      // Validate numeric fields
      if (isNaN(job.company_id) || isNaN(job.posted_by)) {
        return res.status(400).json({
          error: "company_id and posted_by must be valid integers.",
        });
      }

      const newJob = await JobService.create(job);
      res.status(201).json(newJob);
    } catch (err) {
      console.error(" Create job error:", err);
      res.status(500).json({ error: "Failed to create job" });
    }
  },

  
  //  Update job by ID

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedJob = await JobService.update(Number(id), req.body);
      res.json(updatedJob);
    } catch (err: any) {
      if (err.message === "Job not found") {
        return res.status(404).json({ error: err.message });
      }
      console.error(" Update job error:", err);
      res.status(500).json({ error: "Failed to update job" });
    }
  },

  
  // Delete job by ID
  
  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await JobService.remove(Number(id));
      res.json({ message: "Job deleted successfully" });
    } catch (err: any) {
      if (err.message === "Job not found") {
        return res.status(404).json({ error: err.message });
      }
      console.error(" Delete job error:", err);
      res.status(500).json({ error: "Failed to delete job" });
    }
  },
};
