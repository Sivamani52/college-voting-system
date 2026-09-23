import express from "express";

import {
  createPositionController,
  getPositionsByElection,
  getPositionByIdController,
  updatePositionController,
  deletePositionController
} from "../controllers/positionController.js";

import {
  authenticateToken
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles
} from "../middleware/roleMiddleware.js";

const router = express.Router();


// Create position (Super Admin, Admin)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  createPositionController
);


// Get positions for election (Super Admin, Admin, Student)
router.get(
  "/election/:electionId",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "STUDENT"),
  getPositionsByElection
);


// Get position by ID (Super Admin, Admin, Student)
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "STUDENT"),
  getPositionByIdController
);


// Update position (Super Admin only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  updatePositionController
);


// Delete position (Super Admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  deletePositionController
);


export default router;