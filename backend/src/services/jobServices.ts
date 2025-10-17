import pool from "../config/db";


// Get Jobs (with filters)

export const getJobsService = async (title?: string, location?: string) => {
  // Select deadline explicitly
  let query = `
    SELECT id, title, company, location, description, posted_by, deadline
    FROM jobs
    WHERE 1=1
  `;
  const params: any[] = [];

  if (title) {
    params.push(`%${title}%`);
    query += ` AND title ILIKE $${params.length}`;
  }
  if (location) {
    params.push(`%${location}%`);
    query += ` AND location ILIKE $${params.length}`;
  }

  query += " ORDER BY id DESC"; // Optional: newest jobs first

  const result = await pool.query(query, params);
  return result.rows;
};


// Get Job by ID

export const getJobByIdService = async (id: string) => {
  const result = await pool.query(
    `SELECT id, title, company, location, description, posted_by, deadline
     FROM jobs
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Job not found");
  }

  return result.rows[0];
};


// Create Job

export const createJobService = async (
  title: string,
  company: string,
  location: string,
  description: string,
  createdBy: number,
  deadline: string 
) => {
  const result = await pool.query(
    `INSERT INTO jobs (title, company, location, description, posted_by, deadline)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, company, location, description, posted_by, deadline`,
    [title, company, location, description, createdBy, deadline]
  );

  return result.rows[0];
};


// Update Job

export const updateJobService = async (
  id: string,
  title: string,
  company: string,
  location: string,
  description: string,
  deadline: string 
) => {
  const result = await pool.query(
    `UPDATE jobs
     SET title = $1,
         company = $2,
         location = $3,
         description = $4,
         deadline = $5
     WHERE id = $6
     RETURNING id, title, company, location, description, posted_by, deadline`,
    [title, company, location, description, deadline, id]
  );

  if (result.rows.length === 0) {
    throw new Error("Job not found");
  }

  return result.rows[0];
};


// Delete Job

export const deleteJobService = async (id: string) => {
  const result = await pool.query(
    "DELETE FROM jobs WHERE id = $1 RETURNING id, title, company, location, description, posted_by, deadline",
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Job not found");
  }

  return result.rows[0];
};
