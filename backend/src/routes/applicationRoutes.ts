import { Router } from "express";
import * as applicationController from "../controllers/applicationController";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * Apply for a job (using CV link instead of file upload)
 */
router.post(
  "/:jobId/apply",
  requireAuth,
  applicationController.applyForJob
);

/**
 * Get all applications
 * - Admin → all applications
 * - User → only their applications
 */
router.get("/", requireAuth, async (req: any, res, next) => {
  try {
    if (req.user.role === "admin") {
      // Admin: get all
      return await applicationController.getAllApplications(req, res, next);
    } else {
      // Normal user: get their own
      return await applicationController.getUserApplications(req, res, next);
    }
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

/**
 * Get current user's applications (explicit route)
 */
router.get("/user", requireAuth, applicationController.getUserApplications);

/**
 * Admin: Get applications for a specific job
 */
router.get("/:jobId", requireAuth, async (req: any, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  return applicationController.getApplicationsByJob(req, res, next);
});

/**
 * Admin: Update application status (accept/reject/pending)
 */
router.patch("/:id", requireAuth, async (req: any, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  return applicationController.updateApplicationStatus(req, res, next);
});

export default router;
