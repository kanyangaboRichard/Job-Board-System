import { Router } from "express";
import pool from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// -------------------
// GET all jobs (public)
// -------------------
router.get("/", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// -------------------
// GET job by ID (public)
// -------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM jobs WHERE id=$1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Job not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get job error:", err);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// -------------------
// CREATE job (admin only)
// -------------------
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { title, location, description, salary } = req.body;

    const result = await pool.query(
      "INSERT INTO jobs (title, location, description, salary) VALUES ($1,$2,$3,$4) RETURNING *",
      [title, location, description, salary]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Failed to create job" });
  }
});

// -------------------
// UPDATE job (admin only)
// -------------------
router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, description, salary } = req.body;

    const result = await pool.query(
      "UPDATE jobs SET title=$1, location=$2, description=$3, salary=$4 WHERE id=$5 RETURNING *",
      [title, location, description, salary, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Job not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// -------------------
// DELETE job (admin only)
// -------------------
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM jobs WHERE id=$1 RETURNING *", [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Job not found" });

    res.json({ message: "Job deleted", job: result.rows[0] });
  } catch (err) {
    console.error("Delete job error:", err);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

export default router;
