import express from "express";

import {
  createElectionController,
  getAllElections,
  getElectionById,
  changeElectionStatus
} from "../controllers/electionController.js";

import {
  authenticateToken
} from "../middleware/authMiddleware.js";

import {
  authorizeRoles
} from "../middleware/roleMiddleware.js";

const router = express.Router();


router.post(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
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



router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  changeElectionStatus
);


export default router;