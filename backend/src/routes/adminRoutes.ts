import { Router } from "express";
import pool from "../config/db";
import passport from "passport";
import { checkAdmin } from "../middleware/checkAdmin";

const router = Router();

// GET /api/admin/stats
router.get(
  "/stats",
  passport.authenticate("jwt", { session: false }),
  checkAdmin,
  async (_req, res) => {
    try {
      const totalUsers = await pool.query("SELECT COUNT(*) FROM users");
      const totalJobs = await pool.query("SELECT COUNT(*) FROM jobs");
      const totalApplications = await pool.query("SELECT COUNT(*) FROM applications");
      const pendingApplications = await pool.query("SELECT COUNT(*) FROM applications WHERE status='pending'");
      const acceptedApplications = await pool.query("SELECT COUNT(*) FROM applications WHERE status='accepted'");
      const rejectedApplications = await pool.query("SELECT COUNT(*) FROM applications WHERE status='rejected'");

      res.json({
        users: parseInt(totalUsers.rows[0].count, 10),
        jobs: parseInt(totalJobs.rows[0].count, 10),
        applications: parseInt(totalApplications.rows[0].count, 10),
        pending: parseInt(pendingApplications.rows[0].count, 10),
        accepted: parseInt(acceptedApplications.rows[0].count, 10),
        rejected: parseInt(rejectedApplications.rows[0].count, 10),
      });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
