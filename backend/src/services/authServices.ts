import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";


const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Service: Register User
export const registerUser = async (
  email: string,
  password: string,
  name: string = "User",
  role: string = "user"
) => {
  // Check if user exists
  const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
  if (existing.rows.length > 0) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hash = await bcrypt.hash(password, 10);

  // Insert new user
  const result = await pool.query(
    "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role",
    [email, hash, name, role]
  );

  const user = result.rows[0];

  //  Include full details in the token
  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "1hr" }
  );

  return { token, user };
};


// Service: Login User

export const loginUser = async (email: string, password: string) => {
  // Find user
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  const user = result.rows[0];
  if (!user) throw new Error("Invalid credentials");

  // Check password
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error("Invalid credentials");

  //  Include everything needed for frontend role detection
  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "1hr" }
  );

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
};


// Service: Google Auth

export const generateGoogleToken = (user: {
  id: number;
  email: string;
  role: string;
  name?: string;
}) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "1hr" }
  );
};
