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

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",authRouter);
app.use("/api/test", testRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/positions",positionRoutes);
app.use(
  "/api/candidates",
  candidateRoutes
);
app.use("/api/eligible-voters",eligibleVoterRoutes);
app.use("/api/votes", voteRoutes);





app.get("/", (req, res) => {
  res.json({
    message: "College Voting System API is running"
  });
});

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});