import pool from "../config/db";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface ApplicationRow {
  id: number;
  job_id: number;
  user_id: number;
  job_title?: string;
  applicant_name?: string;
  applicant_email?: string;
  cover_letter?: string;
  cv_url?: string;
  status: ApplicationStatus;
  response_note?: string | null;
  applied_at: Date;
  updated_at?: Date;
}


 //Apply for a Job (using CV link instead of file upload)
 
export const applyForJobService = async (
  jobId: string,
  userId: number,
  coverLetter: string,
  cvLink: string
): Promise<ApplicationRow> => {
  // Check if user already applied for this job
  const check = await pool.query<{ id: number }>(
    "SELECT id FROM applications WHERE job_id = $1 AND user_id = $2",
    [jobId, userId]
  );

  if (check.rows.length > 0) {
    throw new Error("Already applied to this job");
  }

  // Insert new application
  const result = await pool.query<ApplicationRow>(
    `INSERT INTO applications (job_id, user_id, cover_letter, cv_url, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING id, job_id, user_id, cover_letter, cv_url, status, response_note, applied_at`,
    [jobId, userId, coverLetter, cvLink]
  );

  if (result.rows.length === 0) {
    throw new Error("Failed to create application");
  }

  return result.rows[0]!;
};


  //Get Applications by Job (Admin/Employer view)
 
export const getApplicationsByJobService = async (
  jobId: string
): Promise<ApplicationRow[]> => {
  const result = await pool.query<ApplicationRow>(
    `SELECT a.id, a.cover_letter, a.cv_url, a.status, a.response_note, a.applied_at,
            u.name AS applicant_name, u.email AS applicant_email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     WHERE a.job_id = $1
     ORDER BY a.applied_at DESC`,
    [jobId]
  );

  return result.rows;
};


 //Get Applications by User (for "My Applications" page)
 //includes job_id (used by frontend to show "Applied" badge)
 
export const getUserApplicationsService = async (
  userId: number
): Promise<ApplicationRow[]> => {
  const result = await pool.query<ApplicationRow>(
    `SELECT 
        a.id,
        a.job_id,
        j.title AS job_title,
        a.status,
        a.response_note,
        a.applied_at
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE a.user_id = $1
     ORDER BY a.applied_at DESC`,
    [userId]
  );

  return result.rows;
};


 // Get All Applications (Admin view)
 
export const getAllApplicationsService = async (): Promise<ApplicationRow[]> => {
  const result = await pool.query<ApplicationRow>(
    `SELECT a.id, j.title AS job_title, a.cover_letter, a.cv_url,
            u.name AS applicant_name, u.email AS applicant_email,
            a.status, a.response_note, a.applied_at
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     JOIN users u ON u.id = a.user_id
     ORDER BY a.applied_at DESC`
  );

  return result.rows;
};


 //Update Application Status (+ optional responseNote)
 
export const updateApplicationStatusService = async (
  id: string,
  status: ApplicationStatus,
  responseNote?: string
): Promise<ApplicationRow> => {
  const result = await pool.query<ApplicationRow>(
    `UPDATE applications
     SET status = $1, response_note = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING id, job_id, user_id, cover_letter, cv_url, status, response_note, applied_at, updated_at`,
    [status, responseNote || null, id]
  );

  if (result.rows.length === 0) {
    throw new Error("Application not found");
  }

  return result.rows[0]!;
};

// Get Application + User + Job Details (for Email Notifications)

export const getApplicationWithUserDetailsService = async (id: string) => {
  const result = await pool.query(
    `SELECT 
        a.id,
        a.status,
        a.response_note,
        j.title AS job_title,
        u.name AS applicant_name,
        u.email AS applicant_email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     JOIN jobs j ON j.id = a.job_id
     WHERE a.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Application not found");
  }

  return result.rows[0];
};
