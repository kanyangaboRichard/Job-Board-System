import { Router } from "express";
import passport from "passport";
import pool from "../config/db";
import { checkAdmin } from "../middleware/checkAdmin";

const router = Router();

// Admin Monthly Report Route (No Categories)
router.get(
  "/monthly-report",
  passport.authenticate("jwt", { session: false }),
  checkAdmin,
  async (req, res) => {
    try {
      const month = parseInt((req.query.month as string) || String(new Date().getMonth() + 1), 10);
      const year = parseInt((req.query.year as string) || String(new Date().getFullYear()), 10);
      const monthName = new Date(year, month - 1).toLocaleString("en-US", { month: "long" });

      // --- Total Jobs ---
      const totalJobs = await pool.query(
        `SELECT COUNT(*) FROM jobs 
         WHERE EXTRACT(MONTH FROM created_at) = $1 
         AND EXTRACT(YEAR FROM created_at) = $2`,
        [month, year]
      );

      // --- Total Applications ---
      const totalApplications = await pool.query(
        `SELECT COUNT(*) FROM applications 
         WHERE EXTRACT(MONTH FROM updated_at) = $1 
         AND EXTRACT(YEAR FROM updated_at) = $2`,
        [month, year]
      );

      // --- Accepted / Rejected / Pending ---
      const accepted = await pool.query(
        `SELECT COUNT(*) FROM applications 
         WHERE status = 'accepted'
         AND EXTRACT(MONTH FROM updated_at) = $1 
         AND EXTRACT(YEAR FROM updated_at) = $2`,
        [month, year]
      );

      const rejected = await pool.query(
        `SELECT COUNT(*) FROM applications 
         WHERE status = 'rejected'
         AND EXTRACT(MONTH FROM updated_at) = $1 
         AND EXTRACT(YEAR FROM updated_at) = $2`,
        [month, year]
      );

      const pending = await pool.query(
        `SELECT COUNT(*) FROM applications 
         WHERE status = 'pending'
         AND EXTRACT(MONTH FROM updated_at) = $1 
         AND EXTRACT(YEAR FROM updated_at) = $2`,
        [month, year]
      );

      // --- Top Companies ---
      const topCompanies = await pool.query(
        `
        SELECT company, COUNT(*) AS jobs
        FROM jobs
        WHERE EXTRACT(MONTH FROM created_at) = $1
          AND EXTRACT(YEAR FROM created_at) = $2
        GROUP BY company
        ORDER BY jobs DESC
        LIMIT 5
        `,
        [month, year]
      );

      //  Respond with JSON summary (no categories)
      res.json({
        month: `${monthName} ${year}`,
        totalJobs: Number(totalJobs.rows[0].count),
        totalApplications: Number(totalApplications.rows[0].count),
        accepted: Number(accepted.rows[0].count),
        rejected: Number(rejected.rows[0].count),
        pending: Number(pending.rows[0].count),
        topCompanies: topCompanies.rows,
      });
    } catch (err) {
      console.error("Error generating monthly report:", err);
      res.status(500).json({
        message: "Error generating monthly report",
        error: (err as Error).message,
      });
    }
  }
);

export default router;
