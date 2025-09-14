import pool from "../db";

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  created_at?: Date;
}

export const createUser = async (user: User): Promise<User> => {
  const { name, email, password, role } = user;
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, password, role]
  );
  return result.rows[0];
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0] || null;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0] || null;
};
