import express from "express";
import { createStudent } from "../controllers/studentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Allow SUPER_ADMIN and ADMIN to create students
router.post(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  createStudent
);

export default router;
