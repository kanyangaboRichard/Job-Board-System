import { Router } from "express";
import passport from "../config/passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";


// local Registration

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const assignedRole =
      role && ["user", "admin"].includes(role) ? role : "user";

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role, name",
      [email, hashedPassword, name || "Anonymous", assignedRole]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ token, user });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});


// local login

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});


// google auth Start

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


// google call back

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "https://job-board-system-8usg.vercel.app"}/login`,
  }),
  (req, res) => {
    try {
      const user = req.user as { id: number; email: string; role: string };

      // Generate JWT for the logged-in user
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Use frontend URL from environment or fallback to your production frontend
      const frontendUrl =
        process.env.FRONTEND_URL || "https://job-board-system-8usg.vercel.app";

      // Support optional redirect query (?redirect=/dashboard)
      const redirectPath =
        typeof req.query.redirect === "string" ? req.query.redirect : "/";

      // Redirect back to frontend with token
      res.redirect(`${frontendUrl}${redirectPath}?token=${token}`);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect(
        `${process.env.FRONTEND_URL || "https://job-board-system-8usg.vercel.app"}/login`
      );
    }
  }
);

export default router;
