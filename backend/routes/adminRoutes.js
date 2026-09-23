import express from "express";

import {
  createAdmin,
  getAllAdminsController,
  getAdminProfileController,
  updateAdminController,
  toggleAdminStatusController,
  deleteAdminController,
} from "../controllers/adminController.js";

import {
  authenticateToken
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles
} from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create new admin (Super Admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  createAdmin
);

// Get current admin profile (Admin, Super Admin)
router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getAdminProfileController
);

// Get all admins (Super Admin only)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  getAllAdminsController
);

// Update admin (Super Admin only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  updateAdminController
);

// Toggle admin status ACTIVE/INACTIVE (Super Admin only)
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  toggleAdminStatusController
);

// Delete admin (Super Admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  deleteAdminController
);

export default router;