import pool from "../config/db";

export interface Application {
  id?: number;
  user_id: number;
  job_id: number;
  resume_url: string;
  applied_at?: Date;
}

export const createApplication = async (app: Application): Promise<Application> => {
  const { user_id, job_id, resume_url } = app;
  const result = await pool.query(
    `INSERT INTO applications (user_id, job_id, resume_url) 
     VALUES ($1, $2, $3) RETURNING *`,
    [user_id, job_id, resume_url]
  );
  return result.rows[0];
};

export const getApplicationsByUserId = async (user_id: number): Promise<Application[]> => {
  const result = await pool.query(`SELECT * FROM applications WHERE user_id = $1`, [user_id]);
  return result.rows;
};

export const getApplicationsByJobId = async (job_id: number): Promise<Application[]> => {
  const result = await pool.query(`SELECT * FROM applications WHERE job_id = $1`, [job_id]);
  return result.rows;
};
