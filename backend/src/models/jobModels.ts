import pool from "../config/db";

export interface Job {
  id?: number;
  title: string;
  description: string;
  location: string;
  created_at?: Date;
}

export const createJob = async (job: Job): Promise<Job> => {
  const { title, description, location } = job;
  const result = await pool.query(
    `INSERT INTO jobs (title, description, location) 
     VALUES ($1, $2, $3) RETURNING *`,
    [title, description, location]
  );
  return result.rows[0];
};

export const getAllJobs = async (): Promise<Job[]> => {
  const result = await pool.query(`SELECT * FROM jobs ORDER BY created_at DESC`);
  return result.rows;
};

export const getJobById = async (id: number): Promise<Job | null> => {
  const result = await pool.query(`SELECT * FROM jobs WHERE id = $1`, [id]);
  return result.rows[0] || null;
};
