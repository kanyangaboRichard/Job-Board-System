// src/routes/jobRoutes.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import * as jobController from "../controllers/jobController";

const router = Router();

// -------------------
// Public Routes (no login required)
// -------------------
router.get("/", jobController.getJobs);       // Get all jobs
router.get("/:id", jobController.getJobById); // Get a single job by ID

// -------------------
// Admin-only Routes (must be logged in as admin)
// -------------------
router.post("/", requireAuth, requireRole("admin"), jobController.createJob);
router.put("/:id", requireAuth, requireRole("admin"), jobController.updateJob);
router.delete("/:id", requireAuth, requireRole("admin"), jobController.deleteJob);

export default router;