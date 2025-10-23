import pool from "../config/db";

export const updatejobService =async (
  id: string,
  title: string,
  company: string,
  location: string,
  description: string,
  salary: number,
  deadline?: string
) => {
  const result = await pool.query(
    `
    UPDATE jobs
    SET title = $1,
        company = $2,
        location = $3,
        description = $4,
        salary = $5,
        deadline = $6
    WHERE id = $7
    RETURNING id, title, company, location, description, salary, posted_by, deadline
    `,
    [title, company, location, description, salary, deadline, id]
  );

  if (result.rows.length === 0) {
    throw new Error("Job not found");
  }

  return result.rows[0];
};

   //GET ALL JOBS (optionally filtered by title/location)
export const getJobsService = async (title?: string, location?: string) => {
  let query = `
    SELECT id, title, company, location, description, salary, posted_by, deadline
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

  query += " ORDER BY id DESC"; // newest first

  const result = await pool.query(query, params);
  return result.rows;
};

   //GET JOB BY ID

export const getJobByIdService = async (id: string) => {
  const result = await pool.query(
    `
    SELECT id, title, company, location, description, salary, posted_by, deadline
    FROM jobs
    WHERE id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Job not found");
  }

  return result.rows[0];
};

   //CREATE JOB
export const createJobService = async (
  title: string,
  company: string,
  location: string,
  description: string,
  salary: number,
  createdBy: number,
  deadline?: string
) => {
  const result = await pool.query(
    `
    INSERT INTO jobs (title, company, location, description, salary, posted_by, deadline)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, title, company, location, description, salary, posted_by, deadline
    `,
    [title, company, location, description, salary, createdBy, deadline]
  );

  return result.rows[0];
};

//UPDATE JOB

export const updateJobService = async (
  id: string,
  title: string,
  company: string,
  location: string,
  description: string,
  salary: number,
  deadline?: string
) => {
  const result = await pool.query(
    `
    UPDATE jobs
    SET title = $1,
        company = $2,
        location = $3,
        description = $4,
        salary = $5,
        deadline = $6
    WHERE id = $7
    RETURNING id, title, company, location, description, salary, posted_by, deadline
    `,
    [title, company, location, description, salary, deadline, id]
  );

  if (result.rows.length === 0) {
    throw new Error("Job not found");
  }

  return result.rows[0];
};


   //DELETE JOB

export const deleteJobService = async (id: string) => {
  const result = await pool.query(
    `
    DELETE FROM jobs
    WHERE id = $1
    RETURNING id, title, company, location, description, salary, posted_by, deadline
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Job not found");
  }

  return result.rows[0];
};
