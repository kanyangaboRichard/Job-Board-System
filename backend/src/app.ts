// index.ts or app.ts
import express from "express";
import cors from "cors";
import passport from "./config/passport";

import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";

const app = express();

// -------------------
// Middleware
// -------------------
app.use(express.json());

// ✅ Allow frontend (React/Vite) to connect
app.use(
  cors({
    origin: "http://localhost:3001", // your frontend URL
    credentials: true,               // allow cookies/credentials if needed
  })
);

app.use(passport.initialize());

// -------------------
// Health check
// -------------------
app.get("/health", (_, res) => res.json({ ok: true }));

// -------------------
// Routes with /api prefix
// -------------------
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

export default app;
