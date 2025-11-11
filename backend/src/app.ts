import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport";

// Import route modules
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRouter";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import companyRoutes from "./routes/companyRoutes";
import adminRoutes from "./routes/adminRoutes";
import adminReportRoutes from "./routes/adminReportRoute";

// Initialize Express
const app = express();


//  MIDDLEWARE
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



// Parse JSON request body
app.use(express.json());

// Parse cookies (for JWT/session auth)
app.use(cookieParser());

// Configure CORS for frontend connection
app.use(
  cors({
    origin: [
      "http://localhost:3001", // Frontend origin (adjust for prod)
       "https://job-board-system-8usg.vercel.app",
       "https://job-board-system-8usg-e84wiu698-richards-projects-cdb41f5a.vercel.app", // Vercel production URL
       "https://job-board-system-silk.vercel.app", // Vercel backend itself URL
        "https://job-board-system-8usg-7b91hov7p-richards-projects-cdb41f5a.vercel.app", 
    ],
    credentials: true, // Allow cookies & auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Initialize Passport authentication
app.use(passport.initialize());


//  HEALTH CHECK

app.get("/health", (_req, res) => res.status(200).json({ ok: true, message: "Server running" }));


//  API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/reports", adminReportRoutes);



//  FALLBACK HANDLER (404 for unknown endpoints)

app.use( (_req, res) =>
  res.status(404).json({ error: "Endpoint not found. Please check your URL or method." })
);

export default app;
