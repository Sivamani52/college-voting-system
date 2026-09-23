import express from "express";

import {
  createCandidateController,
  getCandidatesByElection,
  getCandidatesByPositionController,
  getCandidateByIdController,
  updateCandidateController,
  deleteCandidateController
} from "../controllers/candidateController.js";

import {
  authenticateToken
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles
} from "../middleware/roleMiddleware.js";

const router = express.Router();


// Create candidate (Super Admin, Admin)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  createCandidateController
);


// Get candidates by election (Super Admin, Admin, Student)
router.get(
  "/election/:electionId",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "STUDENT"),
  getCandidatesByElection
);


// Get candidates by position (Super Admin, Admin, Student)
router.get(
  "/position/:positionId",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "STUDENT"),
  getCandidatesByPositionController
);


// Get candidate by ID (Super Admin, Admin, Student)
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "STUDENT"),
  getCandidateByIdController
);


// Update candidate (Super Admin only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  updateCandidateController
);


// Delete candidate (Super Admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  deleteCandidateController
);


export default router;