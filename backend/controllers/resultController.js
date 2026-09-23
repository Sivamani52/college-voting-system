import pool from '../config/db.js'
import * as voteModel from '../models/voteModel.js'
import {
  getAdminScope,
  checkAdminElectionScope,
  checkStudentElectionScope,
  UNAUTHORIZED_ELECTION_MESSAGE,
  STUDENT_UNAUTHORIZED_ELECTION_MESSAGE
} from '../middleware/adminScopeMiddleware.js'

// ==========================================
// GET ELECTION RESULTS
// ==========================================
export async function getElectionResults(req, res) {
  try {
    const { electionId } = req.params
    const userRole = req.user?.role
    const userId = req.user?.userId || req.user?.id

    // ------------------------------------------
    // Validate election ID
    // ------------------------------------------
    if (!electionId || isNaN(Number(electionId))) {
      return res.status(400).json({
        message: 'Valid election ID is required.'
      })
    }

    // ------------------------------------------
    // Get election
    // ------------------------------------------
    const election = await voteModel.getElectionById(electionId)

    if (!election) {
      return res.status(404).json({
        message: 'Election not found.'
      })
    }

    // ------------------------------------------
    // ADMIN section scope validation
    // ------------------------------------------
    if (userRole === 'ADMIN') {
      const adminScope = await getAdminScope(userId)
      if (!checkAdminElectionScope(adminScope, election)) {
        return res.status(403).json({
          success: false,
          message: UNAUTHORIZED_ELECTION_MESSAGE
        })
      }
    }

    // ------------------------------------------
    // STUDENT section scope validation & status check
    // ------------------------------------------
    if (userRole === 'STUDENT') {
      const [studentRows] = await pool.query(
        `SELECT id, department_id, year_id, section_id FROM students WHERE user_id = ? LIMIT 1`,
        [userId]
      )
      const student = studentRows[0]
      if (!student || !checkStudentElectionScope(student, election)) {
        return res.status(403).json({
          success: false,
          message: STUDENT_UNAUTHORIZED_ELECTION_MESSAGE
        })
      }

      if (election.status !== 'RESULT_PUBLISHED') {
        return res.status(403).json({
          message: 'Results have not been published for this election yet.'
        })
      }
    }

    const results = await voteModel.getElectionResults(electionId)
    const stats = await voteModel.getElectionStats(electionId)

    return res.status(200).json({
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        status: election.status,
        startDate: election.start_date,
        endDate: election.end_date,
        departmentId: election.department_id,
        yearId: election.year_id,
        sectionId: election.section_id
      },
      stats,
      results
    })

  } catch (error) {
    console.error('Get election results error:', error)

    return res.status(500).json({
      message: 'Failed to fetch election results.',
      error: error.message
    })
  }
}