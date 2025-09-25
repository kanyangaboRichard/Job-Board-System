import pool from "../config/db";

// -------------------
// Get Jobs (with filters)
// -------------------
export const getJobsService = async (title?: string, location?: string) => {
  let query = "SELECT * FROM jobs WHERE 1=1";
  const params: any[] = [];

  if (title) {
    params.push(`%${title}%`);
    query += ` AND title ILIKE $${params.length}`;
  }
  if (location) {
    params.push(`%${location}%`);
    query += ` AND location ILIKE $${params.length}`;
  }

  const result = await pool.query(query, params);
  return result.rows;
};

// -------------------
// Get Job by ID
// -------------------
export const getJobByIdService = async (id: string) => {
  const result = await pool.query("SELECT * FROM jobs WHERE id=$1", [id]);
  if (result.rows.length === 0) {
    throw new Error("Job not found");
  }
  return result.rows[0];
};

// -------------------
// Create Job
// -------------------
export const createJobService = async (
  title: string,
  company: string,
  location: string,
  description: string,
  createdBy: number
) => {
  const result = await pool.query(
    "INSERT INTO jobs (title, company, location, description, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [title, company, location, description, createdBy]
  );
  return result.rows[0];
};

// -------------------
// Update Job
// -------------------
export const updateJobService = async (
  id: string,
  title: string,
  company: string,
  location: string,
  description: string
) => {
  const result = await pool.query(
    "UPDATE jobs SET title=$1, company=$2, location=$3, description=$4 WHERE id=$5 RETURNING *",
    [title, company, location, description, id]
  );
  if (result.rows.length === 0) {
    throw new Error("Job not found");
  }
  return result.rows[0];
};

// -------------------
// Delete Job
// -------------------
export const deleteJobService = async (id: string) => {
  const result = await pool.query("DELETE FROM jobs WHERE id=$1 RETURNING *", [id]);
  if (result.rows.length === 0) {
    throw new Error("Job not found");
  }
  return result.rows[0];
};
