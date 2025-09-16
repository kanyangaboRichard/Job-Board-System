    import  { Request, Response } from "express";
    import pool from "../config/db";
    import router from "./jobRoutes";

    // -------------------
    // User applies for a job
    // -------------------
    export const applyForJob = async (req: Request, res: Response) => {
      try {
        //  requireAuth already ensures req.user exists
        const user = req.user as { id: number; role: string };
        if (!user) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const { jobId } = req.params;
        const { cover_letter, cv_link } = req.body;

        const result = await pool.query(
          "INSERT INTO applications (user_id, job_id, cover_letter, cv_link) VALUES ($1,$2,$3,$4) RETURNING *",
          [user.id, jobId, cover_letter, cv_link]
        );

        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error("Apply job error:", err);
        res.status(500).json({ error: "Failed to apply for job" });
      }
    };

    // -------------------
    // Admin gets applications for a job
    // -------------------
    export const getApplicationsByJob = async (req: Request, res: Response) => {
      try {
        const { jobId } = req.params;
        const result = await pool.query("SELECT * FROM applications WHERE job_id=$1", [jobId]);
        res.json(result.rows);
      } catch (err) {
        console.error("Get applications error:", err);
        res.status(500).json({ error: "Failed to fetch applications" });
      }
    };

    // -------------------
    // Admin updates application status
    // -------------------
    export const updateApplicationStatus = async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
          "UPDATE applications SET status=$1 WHERE id=$2 RETURNING *",
          [status, id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Application not found" });
        }

        res.json(result.rows[0]);
      } catch (err) {
        console.error("Update application error:", err);
        res.status(500).json({ error: "Failed to update application" });
      }
    };

export default router;