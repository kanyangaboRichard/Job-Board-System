import { Router } from "express";
import { addJob, listJobs, getJob } from "../controllers/jobController";

const router = Router();

// POST /jobs
router.post("/", addJob);

// GET /jobs
router.get("/", listJobs);

// GET /jobs/:id
router.get("/:id", getJob);

export default router;
