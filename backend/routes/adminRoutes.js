import express from "express";

import {
  createAdmin
} from "../controllers/adminController.js";

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
  createAdmin
);

export default router;