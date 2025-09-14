import { Router } from "express";
const router = Router();

router.post("/login", (req, res) => {
  res.json({ message: "login route" });
});

router.post("/register", (req, res) => {
  res.json({ message: "register route" });
});

export default router;
