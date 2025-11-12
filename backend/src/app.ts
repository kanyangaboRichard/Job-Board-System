import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRouter";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import companyRoutes from "./routes/companyRoutes";
import adminRoutes from "./routes/adminRoutes";
import adminReportRoutes from "./routes/adminReportRoute";

const app = express();

// Global Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =========================
// ✅ DYNAMIC CORS CONFIGURATION
// =========================
const baseAllowedOrigins = [
  "http://localhost:3001", // Local dev
  "https://job-board-system-8usg.vercel.app", // Main production frontend
  "https://job-board-system-silk.vercel.app", // Backend itself
];

// Function to allow all Vercel preview URLs for your project
function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // allow tools like Postman or curl
  if (baseAllowedOrigins.includes(origin)) return true;
  // ✅ Dynamically allow any preview URL like job-board-system-8usg-xxxx.vercel.app
  if (/^https:\/\/job-board-system-8usg-[\w-]+\.vercel\.app$/.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.warn("🚫 Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//  Handle all preflight (OPTIONS) requests
app.options(/.*/, cors());

// Authentication
app.use(passport.initialize());

// Health Check
app.get("/health", (_req, res) =>
  res.status(200).json({ ok: true, message: "Server running" })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/reports", adminReportRoutes);

// 404 handler
app.use((_req, res) =>
  res.status(404).json({ error: "Endpoint not found. Please check your URL or method." })
);

export default app;
