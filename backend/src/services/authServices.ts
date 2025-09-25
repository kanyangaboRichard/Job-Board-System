import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";


// Service: Register User

export const registerUser = async (email: string, password: string, role: string = "user") => {
  // Check if user exists
  const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
  if (existing.rows.length > 0) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hash = await bcrypt.hash(password, 10);

  // Insert into DB
  const result = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id, email, role",
    [email, hash, role]
  );

  const user = result.rows[0];

  // Generate JWT
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  return { token, user };
};

// Service: Login User

export const loginUser = async (email: string, password: string) => {
  // Find user
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  const user = result.rows[0];
  if (!user) throw new Error("Invalid credentials");

  // Verify password
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error("Invalid credentials");

  // Generate JWT
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  return { token, user: { id: user.id, email: user.email, role: user.role } };
};


// Service: Google Auth

export const generateGoogleToken = (user: { id: number; role: string }) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
};
