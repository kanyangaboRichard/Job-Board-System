// app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import userRouter from "./routes/userRouter";
import adminRoutes from "./routes/adminRoutes";
import adminMonthlyReport from "./routes/adminMonthlyReport";

const app = express();


// Middleware

app.use(express.json());
app.use(cookieParser()); //parse cookies so JWT/session cookies work

//  Allow frontend (React/Vite) to connect
app.use(
  cors({
    origin: "http://localhost:3001", // frontend
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], //for Bearer tokens
  })
);


app.use(passport.initialize());


// Health check

app.get("/health", (_, res) => res.json({ ok: true }));


// Routes with /api prefix

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminMonthlyReport);

export default app;
