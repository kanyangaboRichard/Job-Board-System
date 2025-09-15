import { Request, Response } from "express";
import pool from "../config/db";

export const getJobs = async (req: Request, res: Response) => {
  const { title, location } = req.query;
  try {
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
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM jobs WHERE id=$1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Job not found" });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

export const createJob = async (req: Request, res: Response) => {
  const { title, company, location, description } = req.body;
  const user = req.user as { id: number };
  try {
    const result = await pool.query(
      "INSERT INTO jobs (title, company, location, description, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [title, company, location, description, user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  const { title, company, location, description } = req.body;
  try {
    const result = await pool.query(
      "UPDATE jobs SET title=$1, company=$2, location=$3, description=$4 WHERE id=$5 RETURNING *",
      [title, company, location, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Job not found" });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("DELETE FROM jobs WHERE id=$1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};
