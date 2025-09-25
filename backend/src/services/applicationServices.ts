import pool from "../config/db";


// Apply for a Job

export const applyForJobService = async (
  jobId: string,
  userId: number,
  coverLetter: string,
  cvUrl: string
) => {
  // Check if already applied
  const check = await pool.query(
    "SELECT id FROM applications WHERE job_id=$1 AND user_id=$2",
    [jobId, userId]
  );
  if (check.rows.length > 0) {
    throw new Error("Already applied to this job");
  }

  // Insert application
  const result = await pool.query(
    "INSERT INTO applications (job_id, user_id, cover_letter, cv_url) VALUES ($1,$2,$3,$4) RETURNING *",
    [jobId, userId, coverLetter, cvUrl]
  );

  return result.rows[0];
};

// Get Applications by Job

export const getApplicationsByJobService = async (jobId: string) => {
  const result = await pool.query(
    `SELECT a.*, u.email AS applicant_email
     FROM applications a
     JOIN users u ON u.id=a.user_id
     WHERE a.job_id=$1`,
    [jobId]
  );

  return result.rows;
};

// Update Application Status

export const updateApplicationStatusService = async (id: string, status: string) => {
  const result = await pool.query(
    "UPDATE applications SET status=$1 WHERE id=$2 RETURNING *",
    [status, id]
  );

  if (result.rows.length === 0) {
    throw new Error("Application not found");
  }

  return result.rows[0];
};
