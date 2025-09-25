import { Router } from "express";
import * as applicationController from "../controllers/applicationController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// User applies for a job (must be authenticated)
router.post("/:jobId/apply", requireAuth, applicationController.applyForJob);

// Admin gets applications for a job
router.get("/:jobId/applications", requireAuth, requireRole("admin"), applicationController.getApplicationsByJob);

// Admin updates application status
router.put("/applications/:id/status", requireAuth, requireRole("admin"), applicationController.updateApplicationStatus);

export default router;
