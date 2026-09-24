import express from "express";

import {
  addEligibleVoterController,
  addBulkEligibleVotersController,
  getEligibleVotersController,
  getEligibleVoterByIdController,
  checkMyEligibilityController,
  removeEligibleVoterController,
  removeAllEligibleVotersController
} from "../controllers/eligibleVoterController.js";

import {
  authenticateToken
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles
} from "../middleware/roleMiddleware.js";

const router = express.Router();


// Add eligible voter (Super Admin, Admin)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  addEligibleVoterController
);


// Bulk add eligible voters by filter or student ID list (Super Admin, Admin)
router.post(
  "/bulk",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  addBulkEligibleVotersController
);


// Check current logged-in student's eligibility (Student, Admin, Super Admin)
router.get(
  "/check/:electionId",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "STUDENT"),
  checkMyEligibilityController
);


// Get eligible voters for an election (Super Admin, Admin)
router.get(
  "/election/:electionId",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  getEligibleVotersController
);


// Get eligible voter by ID (Super Admin, Admin)
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  getEligibleVoterByIdController
);


// Remove all eligible voters for an election (Super Admin, Admin)
router.delete(
  "/election/:electionId",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  removeAllEligibleVotersController
);


// Remove eligible voter by ID (Super Admin, Admin)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  removeEligibleVoterController
);


export default router;