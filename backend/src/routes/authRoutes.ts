// src/routes/authRoutes.ts
import { Router } from "express";
import passport from "../config/passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// -------------------
// Local Register
// -------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role, name",
      [email, hashedPassword, name || "Anonymous", "user"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// -------------------
// Local Login
// -------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// -------------------
// Google OAuth start
// -------------------
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// -------------------
// Google OAuth callback
// -------------------
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user as { id: number; email: string; role: string };

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    res.redirect(`${frontendUrl}/login?token=${token}`);
  }
);

export default router;
