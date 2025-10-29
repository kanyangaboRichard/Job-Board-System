import { Router } from "express";
import passport from "passport";
import { checkAdmin } from "../middleware/checkAdmin";
import { AdminReportController } from "../controllers/adminReportController";

const router = Router();

// GET /api/admin/reports?startDate=&endDate=&company=
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  checkAdmin,
  AdminReportController.generate
);

// GET /api/admin/companies
router.get(
  "/companies",
  passport.authenticate("jwt", { session: false }),
  checkAdmin,
  AdminReportController.listCompanies
);

export default router;
