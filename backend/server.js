import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRouter from './routes/authRoutes.js'
import testRoutes from "./routes/testRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import positionRoutes from "./routes/positionRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import eligibleVoterRoutes from "./routes/eligibleVoterRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import academicStructureRoutes from "./routes/academicStructureRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "./.env") });

const app = express();

// Configure CORS for production and development
const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [])
]
  .filter(Boolean)
  .map(url => url.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, server-to-server)
      if (!origin) return callback(null, true);

      // If no origins configured, allow all origins
      if (configuredOrigins.length === 0 || configuredOrigins.includes("*")) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");
      const isAllowed =
        configuredOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.startsWith("http://localhost:") ||
        normalizedOrigin.startsWith("http://127.0.0.1:");

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (useful for cloud platforms like Render, Railway, AWS)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "college-voting-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main API routes with /api prefix
app.use("/api/auth", authRouter);
app.use("/api/test", testRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/admin/elections", electionRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/eligible-voters", eligibleVoterRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api", academicStructureRoutes);

// Fallback aliases without /api prefix for direct client requests
app.use("/auth", authRouter);
app.use("/test", testRoutes);
app.use("/admins", adminRoutes);
app.use("/students", studentRoutes);
app.use("/elections", electionRoutes);
app.use("/admin/elections", electionRoutes);
app.use("/positions", positionRoutes);
app.use("/candidates", candidateRoutes);
app.use("/eligible-voters", eligibleVoterRoutes);
app.use("/votes", voteRoutes);
app.use("/results", resultRoutes);
app.use("/departments", departmentRoutes);
app.use("/", academicStructureRoutes);

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");

    res.json({
      message: "Database connected successfully",
      result: rows
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Database connection failed"
    });
  }
});

// In production, serve the compiled Vite frontend if available
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
const hasFrontendDist = fs.existsSync(path.join(frontendDistPath, "index.html"));

if (process.env.NODE_ENV === "production" && hasFrontendDist) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      message: "College Voting System API is running"
    });
  });
}

// 404 handler for unhandled API routes (compatible with Express 5)
app.use("/api", (req, res) => {
  res.status(404).json({
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Test database connection on startup
  pool.query("SELECT 1")
    .then(() => {
      console.log("Database connected successfully.");
    })
    .catch((err) => {
      console.error(`Database connection warning [${err.code || err.message}]: Check DB_HOST and database status in .env`);
    });
});