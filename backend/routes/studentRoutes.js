import express from "express";

import {
  createStudent,
  getAllStudentsController,
  getStudentByIdController,
  getStudentProfileController,
  updateStudentController,
  deleteStudentController,
  toggleStudentStatusController
} from "../controllers/studentController.js";

import {
  authenticateToken
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles
} from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create a new student (Super Admin, Admin)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  createStudent
);

// Get current student profile (Student, Admin, Super Admin)
router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("STUDENT", "ADMIN", "SUPER_ADMIN"),
  getStudentProfileController
);

// Get all students (Admin, Super Admin)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getAllStudentsController
);

// Get student by ID (Admin, Super Admin)
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getStudentByIdController
);

// Update student (Admin, Super Admin)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  updateStudentController
);

// Toggle student status (Admin, Super Admin)
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  toggleStudentStatusController
);

// Delete student (Admin, Super Admin)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  deleteStudentController
);

export default router;