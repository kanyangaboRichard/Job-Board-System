import { Router } from "express";
import { CompanyController } from "../controllers/companyController";

const router = Router();

router.get("/", CompanyController.all);
router.get("/:id", CompanyController.byId);
router.post("/", CompanyController.create);
router.patch("/:id", CompanyController.update);
router.delete("/:id", CompanyController.remove);

export default router;
