import express from "express";

import {
  createAdmin,
  getAllAdminsController,
  getAdminProfileController
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

export default router;