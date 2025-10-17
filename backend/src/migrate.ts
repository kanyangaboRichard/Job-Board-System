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
    console.log("Running migrations...");

    // 1. Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        run_on TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(__dirname, "../migrations");

    // 2. Find all .sql migration files
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
    files.sort(); // enforce order: 001_, 002_, ...

    for (const file of files) {
      // Check if migration already ran
      const result = await client.query("SELECT 1 FROM migrations WHERE filename=$1", [file]);
      if ((result.rowCount ?? 0) > 0) {
        console.log(`⏩ Skipping already applied migration: ${file}`);
        continue;
      }

      // Run migration
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");
      console.log(` Applying migration: ${file}`);
      await client.query(sql);

      // Record it
      await client.query("INSERT INTO migrations (filename) VALUES ($1)", [file]);
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
