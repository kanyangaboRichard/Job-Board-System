import express from "express";
import passport from "./config/passport";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";

const app = express();
app.use(express.json());
app.use(passport.initialize());

// health check
app.get("/health", (_, res) => res.json({ ok: true }));

// routes
app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);

export default app;
