import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log(" Running migrations...");
    const migrationsDir = path.join(__dirname, "../migrations");

    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
    files.sort(); // ensure user,jobs,applications...order

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");
      console.log(` Applying migration: ${file}`);
      await client.query(sql);
    }

    console.log(" All migrations applied!");
  } catch (err) {
    console.error(" Migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
