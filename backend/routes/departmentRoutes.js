import express from "express";
import {
  getAllDepartmentsController,
  getDepartmentByIdController,
  createDepartmentController,
  updateDepartmentController,
  deleteDepartmentController,
} from "../controllers/departmentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get all departments (Super Admin, Admin)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  getAllDepartmentsController
);

// Get department by ID (Super Admin, Admin)
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  getDepartmentByIdController
);

// Create department (Super Admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  createDepartmentController
);

// Update department (Super Admin only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  updateDepartmentController
);

// Delete/deactivate department (Super Admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  deleteDepartmentController
);

export default router;
