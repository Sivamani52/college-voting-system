import express from 'express'
import {
  submitVotes,
  getMyVotesController,
  getElectionResultsController,
  getElectionStatsController
} from '../controllers/voteController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

// ==========================================
// STUDENT SUBMITS ALL VOTES IN A TRANSACTION
// ==========================================
router.post(
  '/',
  authenticateToken,
  authorizeRoles('STUDENT'),
  submitVotes
)

// ==========================================
// STUDENT CHECKS THEIR VOTES IN AN ELECTION
// ==========================================
router.get(
  '/my-votes/:electionId',
  authenticateToken,
  authorizeRoles('STUDENT'),
  getMyVotesController
)

// ==========================================
// VIEW ELECTION RESULTS
// ==========================================
router.get(
  '/results/:electionId',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STUDENT'),
  getElectionResultsController
)

// ==========================================
// VIEW TURNOUT STATISTICS
// ==========================================
router.get(
  '/stats/:electionId',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'ADMIN'),
  getElectionStatsController
)

export default router