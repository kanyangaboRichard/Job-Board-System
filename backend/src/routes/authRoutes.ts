import { Router } from "express";
import passport from "../config/passport";
import { register, login, googleCallback } from "../controllers/authController";

const router = Router();

// Email + password
router.post("/register", register);
router.post("/login", login);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

export default router;
