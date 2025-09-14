import { Router } from "express";
import {
  applyJob,
  listApplicationsByUser,
  listApplicationsByJob,
} from "../controllers/applicationController";

const router = Router();

// POST /applications
router.post("/", applyJob);

// GET /applications/user/:user_id
router.get("/user/:user_id", listApplicationsByUser);

// GET /applications/job/:job_id
router.get("/job/:job_id", listApplicationsByJob);

export default router;
