import pool from "../config/db";
import { applicationModelAttributes } from "../models/applicationModel";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export const ApplicationService = {
  // Apply for a job
  async apply(jobId: number, userId: number, coverLetter: string, cvUrl: string): Promise<applicationModelAttributes> {
    const check = await pool.query<{ id: number }>(
      "SELECT id FROM applications WHERE job_id = $1 AND user_id = $2",
      [jobId, userId]
    );
    if (check.rows.length > 0) throw new Error("Already applied to this job");

    const result = await pool.query<applicationModelAttributes>(
      `INSERT INTO applications (job_id, user_id, cover_letter, cv_url, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id, job_id, user_id, cover_letter, cv_url, status, response_note, applied_at, updated_at`,
      [jobId, userId, coverLetter, cvUrl]
    );

    if (result.rows.length === 0) throw new Error("Failed to create application");
    return result.rows[0] as applicationModelAttributes;
  },

  // Applications by Job
  async byJob(jobId: number): Promise<applicationModelAttributes[]> {
    const result = await pool.query<applicationModelAttributes>(
      `SELECT a.*, u.name AS applicant_name, u.email AS applicant_email
       FROM applications a
       LEFT JOIN users u ON u.id = a.user_id
       WHERE a.job_id = $1
       ORDER BY a.applied_at DESC`,
      [jobId]
    );
    return result.rows;
  },

  // Applications by User
  async byUser(userId: number): Promise<applicationModelAttributes[]> {
    const result = await pool.query<applicationModelAttributes>(
      `SELECT a.*, j.title AS job_title
       FROM applications a
       LEFT JOIN jobs j ON j.id = a.job_id
       WHERE a.user_id = $1
       ORDER BY a.applied_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // All applications
  async all(): Promise<applicationModelAttributes[]> {
    const result = await pool.query<applicationModelAttributes>(
      `SELECT a.*, j.title AS job_title, u.name AS applicant_name, u.email AS applicant_email
       FROM applications a
       LEFT JOIN jobs j ON j.id = a.job_id
       LEFT JOIN users u ON u.id = a.user_id
       ORDER BY a.applied_at DESC`
    );
    return result.rows;
  },

  // Update status
  async updateStatus(id: number, status: ApplicationStatus, responseNote?: string): Promise<applicationModelAttributes> {
    const result = await pool.query<applicationModelAttributes>(
      `UPDATE applications
       SET status = $1, response_note = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, responseNote || null, id]
    );

    if (result.rows.length === 0) throw new Error("Application not found");
    return result.rows[0] as applicationModelAttributes;
  },

  // Details for email notification
  async withUserDetails(id: number): Promise<applicationModelAttributes> {
    const result = await pool.query<applicationModelAttributes>(
      `SELECT a.id, a.status, a.response_note, j.title AS job_title, u.name AS applicant_name, u.email AS applicant_email
       FROM applications a
       LEFT JOIN users u ON u.id = a.user_id
       LEFT JOIN jobs j ON j.id = a.job_id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) throw new Error("Application not found");
    return result.rows[0] as applicationModelAttributes;
  },
};
