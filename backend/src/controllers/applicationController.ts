import { Request, Response } from "express";
import pool from "../config/db";

export const applyForJob = async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { cover_letter, cv_url } = req.body;
  const user = req.user as { id: number };

  try {
    const check = await pool.query(
      "SELECT id FROM applications WHERE job_id=$1 AND user_id=$2",
      [jobId, user.id]
    );
    if (check.rows.length > 0) {
      return res.status(409).json({ error: "Already applied to this job" });
    }

    const result = await pool.query(
      "INSERT INTO applications (job_id, user_id, cover_letter, cv_url) VALUES ($1,$2,$3,$4) RETURNING *",
      [jobId, user.id, cover_letter, cv_url]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

export const getApplicationsByJob = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.email AS applicant_email
       FROM applications a
       JOIN users u ON u.id=a.user_id
       WHERE a.job_id=$1`,
      [req.params.jobId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE applications SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Application not found" });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};
