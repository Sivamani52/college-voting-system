import express from 'express'
import {
  getElectionResults
} from '../controllers/resultController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

// ==========================================
// GET PUBLISHED ELECTION RESULTS (Admins can preview, Students once published)
// ==========================================
router.get(
  '/:electionId',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STUDENT'),
  getElectionResults
)

export default router