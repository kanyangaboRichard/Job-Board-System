import { Router } from "express";
import { JobController } from "../controllers/jobController";

const router = Router();

router.get("/", JobController.all);
router.get("/:id", JobController.byId);
router.post("/", JobController.create);
router.patch("/:id", JobController.update);
router.delete("/:id", JobController.remove);

export default router;
