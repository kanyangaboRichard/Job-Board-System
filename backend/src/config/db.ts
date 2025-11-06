import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Prefer DATABASE_URL when available (Render)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "admin",
        database: process.env.DB_NAME || "job_board_db",
      }
);

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log(" Database connected successfully!");
  } catch (error) {
    console.error(" Database connection failed:", error);
    process.exit(1);
  }
};

export default pool;
