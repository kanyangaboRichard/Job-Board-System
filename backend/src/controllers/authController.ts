import { Request, Response } from "express";
import * as authService from "../services/authServices";

// -------------------
// Controller: Register
// -------------------
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const { token, user } = await authService.registerUser(
      email,
      password,
      name || "Anonymous"
    );
    res.status(201).json({ token, user });
  } catch (err: any) {
    if (err.message === "Email already exists") {
      return res.status(409).json({ error: err.message });
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------
// Controller: Login
// -------------------
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { token, user } = await authService.loginUser(email, password);
    res.json({ token, user });
  } catch (err: any) {
    if (err.message === "Invalid credentials") {
      return res.status(401).json({ error: err.message });
    }
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------
// Controller: Google OAuth
// -------------------
export const googleCallback = (req: Request, res: Response) => {
  const user = req.user as { id: number; email: string; role: string; name?: string };
  const token = authService.generateGoogleToken(user);
  res.json({ token, user });
};
