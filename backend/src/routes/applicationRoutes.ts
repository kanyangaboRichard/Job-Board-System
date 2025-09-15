import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  applyForJob,
  getApplicationsByJob,
  updateApplicationStatus,
} from "../controllers/applicationController";

const router = Router();

// User applies
router.post("/:jobId/apply", requireAuth, requireRole("user"), applyForJob);

// Admin manages
router.get("/job/:jobId", requireAuth, requireRole("admin"), getApplicationsByJob);
router.patch("/:id/status", requireAuth, requireRole("admin"), updateApplicationStatus);

export default router;
