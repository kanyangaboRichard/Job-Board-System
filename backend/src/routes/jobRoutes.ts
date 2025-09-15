import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController";

const router = Router();

// Public
router.get("/", getJobs);
router.get("/:id", getJobById);

// Admin only
router.post("/", requireAuth, requireRole("admin"), createJob);
router.put("/:id", requireAuth, requireRole("admin"), updateJob);
router.delete("/:id", requireAuth, requireRole("admin"), deleteJob);

export default router;
