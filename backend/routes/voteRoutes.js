import express from 'express'
import {
  castVote,
  getMyVotesController,
  getElectionResultsController,
  getElectionStatsController
} from '../controllers/voteController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Student casts a vote
router.post(
  '/',
  authenticateToken,
  authorizeRoles('STUDENT'),
  castVote
)

// Student checks their votes in an election
router.get(
  '/my-votes/:electionId',
  authenticateToken,
  authorizeRoles('STUDENT'),
  getMyVotesController
)

// View election results (Admins always, Students once published)
router.get(
  '/results/:electionId',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STUDENT'),
  getElectionResultsController
)

// View turnout statistics (Super Admin, Admin)
router.get(
  '/stats/:electionId',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'ADMIN'),
  getElectionStatsController
)

export default router