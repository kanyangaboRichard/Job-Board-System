import { Router } from "express";
import passport from "passport";
import { ApplicationController } from "../controllers/applicationController";

const router = Router();

router.post(
  "/:jobId",
  passport.authenticate("jwt", { session: false }),
  ApplicationController.apply
);

router.get("/job/:jobId", ApplicationController.byJob);

router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),  
  ApplicationController.byUser
);

router.get("/", ApplicationController.all);
router.patch("/:id/status", ApplicationController.updateStatus);

export default router;
