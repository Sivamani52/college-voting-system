import express from "express";

import {
  createStudent
} from "../controllers/studentController.js";

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
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  createStudent
);

export default router;