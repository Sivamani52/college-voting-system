import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/super-admin",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  (req, res) => {
    res.json({
      message: "Welcome Super Admin",
      user: req.user
    });
  }
);

router.get(
  "/admin",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  (req, res) => {
    res.json({
      message: "Admin access granted",
      user: req.user
    });
  }
);

router.get(
  "/student",
  authenticateToken,
  authorizeRoles("STUDENT"),
  (req, res) => {
    res.json({
      message: "Student access granted",
      user: req.user
    });
  }
);

export default router;