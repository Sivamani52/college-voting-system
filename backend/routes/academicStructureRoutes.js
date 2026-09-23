import express from "express";
import {
  getAcademicStructureController,
  getYearsController,
  createYearController,
  updateYearController,
  deleteYearController,
  getSectionsController,
  createSectionController,
  updateSectionController,
  deleteSectionController,
} from "../controllers/academicStructureController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Full academic structure tree (Super Admin, Admin)
router.get(
  "/academic-structure",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  getAcademicStructureController
);

// --- Years ---
router.get(
  "/years",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  getYearsController
);

router.post(
  "/years",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  createYearController
);

router.put(
  "/years/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  updateYearController
);

router.delete(
  "/years/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  deleteYearController
);

// --- Sections ---
router.get(
  "/sections",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  getSectionsController
);

router.post(
  "/sections",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  createSectionController
);

router.put(
  "/sections/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  updateSectionController
);

router.delete(
  "/sections/:id",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  deleteSectionController
);

export default router;
