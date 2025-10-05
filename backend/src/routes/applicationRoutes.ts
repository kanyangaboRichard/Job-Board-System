// src/routes/applicationRoutes.ts
import { Router } from "express";
import multer, { StorageEngine } from "multer";
import * as applicationController from "../controllers/applicationController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// ========== MULTER CONFIG ==========
const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ========== ROUTES ==========

// ✅ User applies for a job (CV upload)
router.post(
  "/:jobId/apply",
  requireAuth,
  upload.single("cv"), // must match "cv" key from FormData
  applicationController.applyForJob
);

// ✅ Get all applications — admin gets all, user gets their own
router.get("/", requireAuth, async (req: any, res, next) => {
  try {
    if (req.user.role === "admin") {
      // Admin → all applications
      return await applicationController.getAllApplications(req, res, next);
    } else {
      // User → their own applications
      return await applicationController.getUserApplications(req, res, next);
    }
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// ✅ Explicit user route (still works, but optional)
router.get("/user", requireAuth, applicationController.getUserApplications);

// ✅ Admin: get applications for a specific job
router.get("/:jobId", requireAuth, async (req: any, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  return applicationController.getApplicationsByJob(req, res, next);
});

// ✅ Admin: update application status
router.patch("/:id", requireAuth, async (req: any, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  return applicationController.updateApplicationStatus(req, res, next);
});

export default router;
