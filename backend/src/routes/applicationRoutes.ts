// src/routes/applicationRoutes.ts
import { Router } from "express";
import multer, { StorageEngine } from "multer";
import * as applicationController from "../controllers/applicationController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Configure multer storage (typed)
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

// ================= ROUTES =================

// User applies for a job (with CV upload)
router.post(
  "/:jobId/apply",
  requireAuth,
  upload.single("cv"), // must match FormData key in frontend
  applicationController.applyForJob
);

// Admin: get ALL applications
router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  applicationController.getAllApplications
);

// User: get their own applications
router.get(
  "/user",
  requireAuth,
  applicationController.getUserApplications
);

// Admin: get applications for a specific job
router.get(
  "/:jobId",
  requireAuth,
  requireRole("admin"),
  applicationController.getApplicationsByJob
);

// Admin: update application status
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  applicationController.updateApplicationStatus
);

export default router;
