import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js"; // Add .js if you're using ES modules

// Import route modules
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRouter.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminReportRoutes from "./routes/adminReportRoute.js";


// Initialize Express

const app = express();


// GLOBAL MIDDLEWARE

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//CORS CONFIGURATION

const allowedOrigins = [
  "http://localhost:3001", // Local frontend (dev)
  "https://job-board-system-8usg.vercel.app", // Main production frontend
  "https://job-board-system-8usg-e84wiu698-richards-projects-cdb41f5a.vercel.app", // Preview 1
  "https://job-board-system-8usg-7b91hov7p-richards-projects-cdb41f5a.vercel.app", // Preview 2
  "https://job-board-system-silk.vercel.app", // Backend itself (for internal requests)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies / auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicitly handle all preflight requests (important!)
app.options("*", cors());


// AUTHENTICATION

app.use(passport.initialize());


// HEALTH CHECK ROUTE

app.get("/health", (_req, res) =>
  res.status(200).json({ ok: true, message: "Server running" })
);


// MAIN API ROUTES

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/reports", adminReportRoutes);


// FALLBACK HANDLER (404)

app.use((_req, res) => {
  res.status(404).json({
    error: "Endpoint not found. Please check your URL or method.",
  });
});

export default app;
