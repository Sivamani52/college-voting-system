import express from "express";

import {
  createElectionController,
  getAllElections,
  getElectionById,
  updateElectionController,
  changeElectionStatus,
  deleteElectionController
} from "../controllers/electionController.js";

import {
  authenticateToken
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles
} from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create election (Super Admin, Admin)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  createElectionController
);

// Get all elections (Super Admin, Admin, Student)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "STUDENT"),
  getAllElections
);

// Get election by ID (Super Admin, Admin, Student)
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "STUDENT"),
  getElectionById
);

// Update election details (Super Admin, Admin)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  updateElectionController
);

router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  updateElectionController
);

// Change election status (Super Admin, Admin)
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  changeElectionStatus
);

// Specific status transition action aliases
router.post(
  "/:id/activate",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  changeElectionStatus
);

router.post(
  "/:id/close",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  changeElectionStatus
);

router.post(
  "/:id/publish-results",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  changeElectionStatus
);

// Delete election (Super Admin, Admin)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  deleteElectionController
);

export default router;