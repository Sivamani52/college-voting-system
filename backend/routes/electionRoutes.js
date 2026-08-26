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


router.get(
  "/",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  getAllElections
);


router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  getElectionById
);


router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  changeElectionStatus
);


export default router;