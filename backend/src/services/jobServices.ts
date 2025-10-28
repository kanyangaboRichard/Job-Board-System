import pool from "../config/db";
import { JobAttributes } from "../models/jobModels";

export const JobService = {
  // =====================================================
  // 1️⃣  Get all jobs (optionally filter by title/location)
  // =====================================================
  async all(title?: string, location?: string): Promise<JobAttributes[]> {
    try {
      let query = `
        SELECT 
          j.id,
          j.title,
          j.description,
          j.salary,
          j.location,
          j.deadline,
          j.company_id,
          c.company_name,
          j.posted_by,
          j.created_at
        FROM jobs j
        JOIN companies c ON j.company_id = c.company_id
      `;

      const conditions: string[] = [];
      const params: any[] = [];

      if (title) {
        params.push(`%${title}%`);
        conditions.push(`j.title ILIKE $${params.length}`);
      }

      if (location) {
        params.push(`%${location}%`);
        conditions.push(`j.location ILIKE $${params.length}`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += " ORDER BY j.created_at DESC";

      const result = await pool.query<JobAttributes>(query, params);
      return result.rows;
    } catch (err) {
      console.error("❌ [JobService.all] Error fetching jobs:", err);
      throw new Error("Database error: failed to fetch jobs");
    }
  },

  // =====================================================
  // 2️⃣  Get job by ID
  // =====================================================
  async byId(id: number): Promise<JobAttributes> {
    try {
      const result = await pool.query<JobAttributes>(
        `
        SELECT 
          j.id,
          j.title,
          j.description,
          j.salary,
          j.location,
          j.deadline,
          j.company_id,
          c.company_name,
          c.company_location,
          j.posted_by,
          j.created_at
        FROM jobs j
        JOIN companies c ON j.company_id = c.company_id
        WHERE j.id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) throw new Error("Job not found");
      return result.rows[0]!; // ✅ safe now
    } catch (err) {
      console.error("❌ [JobService.byId] Error fetching job by ID:", err);
      throw err;
    }
  },

  // =====================================================
  // 3️⃣  Get jobs by company ID
  // =====================================================
  async getByCompanyId(companyId: number): Promise<JobAttributes[]> {
    try {
      const result = await pool.query<JobAttributes>(
        `
        SELECT 
          j.id,
          j.title,
          j.description,
          j.salary,
          j.location,
          j.deadline,
          j.company_id,
          c.company_name,
          c.company_location,
          j.posted_by,
          j.created_at
        FROM jobs j
        JOIN companies c ON j.company_id = c.company_id
        WHERE j.company_id = $1
        ORDER BY j.created_at DESC
        `,
        [companyId]
      );
      return result.rows;
    } catch (err) {
      console.error("❌ [JobService.getByCompanyId] Error fetching company jobs:", err);
      throw new Error("Database error: failed to fetch jobs by company ID");
    }
  },

  // =====================================================
  // 4️⃣  Create new job
  // =====================================================
  async create(
    job: {
      title: string;
      description: string;
      salary: number;
      location: string;
      company_id: number;
      posted_by: number;
      deadline: string;
      posted_at: Date;
    }
  ): Promise<JobAttributes> {
    try {
      const result = await pool.query<JobAttributes>(
        `
        INSERT INTO jobs 
          (title, description, salary, location, company_id, posted_by, deadline, created_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING 
          id, title, description, salary, location, company_id, posted_by, deadline, created_at
        `,
        [
          job.title,
          job.description,
          job.salary,
          job.location,
          job.company_id,
          job.posted_by,
          job.deadline,
        ]
      );

      if (result.rows.length === 0) throw new Error("Failed to create job");
      return result.rows[0]!; 
    } catch (err) {
      console.error(" [JobService.create] Error creating job:", err);
      throw new Error("Database error: failed to create job");
    }
  },

  // =====================================================
  // 5️⃣  Update job (partial update allowed)
  // =====================================================
  async update(
    id: number,
    fields: Partial<JobAttributes> & { location?: string }
  ): Promise<JobAttributes> {
    try {
      const updates: string[] = [];
      const params: any[] = [];
      let index = 1;

      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) {
          updates.push(`${key} = $${index}`);
          params.push(value);
          index++;
        }
      }

      if (updates.length === 0) {
        throw new Error("No fields provided to update");
      }

      const query = `
        UPDATE jobs
        SET ${updates.join(", ")}, updated_at = NOW()
        WHERE id = $${index}
        RETURNING id, title, description, salary, location, company_id, posted_by, deadline, created_at;
      `;
      params.push(id);

      const result = await pool.query<JobAttributes>(query, params);

      if (result.rows.length === 0) throw new Error("Job not found");
      return result.rows[0]!; 
    } catch (err) {
      console.error(" [JobService.update] Error updating job:", err);
      throw err;
    }
  },

  
  //  Delete job
  
  async remove(id: number): Promise<void> {
    try {
      const result = await pool.query(`DELETE FROM jobs WHERE id = $1 RETURNING id`, [id]);
      if (result.rowCount === 0) throw new Error("Job not found");
    } catch (err) {
      console.error("[JobService.remove] Error deleting job:", err);
      throw new Error("Database error: failed to delete job");
    }
  },
};
