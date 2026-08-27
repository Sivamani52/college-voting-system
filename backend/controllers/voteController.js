import pool from '../config/db.js'
import * as voteModel from '../models/voteModel.js'

export async function castVote(req, res) {
  let connection

  try {
    const electionId = req.body.electionId || req.body.election_id
    const positionId = req.body.positionId || req.body.position_id
    const candidateId = req.body.candidateId || req.body.candidate_id

    // ------------------------------------------------
    // 1. Validate request body
    // ------------------------------------------------
    if (!electionId || !positionId || !candidateId) {
      return res.status(400).json({
        message:
          'electionId, positionId and candidateId are required.'
      })
    }

    // ------------------------------------------------
    // 2. Get authenticated user from JWT
    // ------------------------------------------------
    const userId = req.user?.userId || req.user?.id

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.'
      })
    }

    // ------------------------------------------------
    // 3. Make sure authenticated user is a student
    // ------------------------------------------------
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({
        message: 'Only students can vote.'
      })
    }

    // ------------------------------------------------
    // 4. Get student profile using user_id
    // ------------------------------------------------
    const [studentRows] = await pool.query(
      `SELECT id, user_id, student_id, full_name, status
       FROM students
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    )

    if (studentRows.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found.'
      })
    }

    const student = studentRows[0]

    // Do not allow inactive students to vote
    if (student.status !== 'ACTIVE') {
      return res.status(403).json({
        message: 'Inactive students cannot vote.'
      })
    }

    const studentId = student.id

    // ------------------------------------------------
    // 5. Get database connection & begin transaction
    // ------------------------------------------------
    connection = await pool.getConnection()
    await connection.beginTransaction()

    // ------------------------------------------------
    // 6. Check election
    // ------------------------------------------------
    const election = await voteModel.getElectionById(
      electionId,
      connection
    )

    if (!election) {
      await connection.rollback()
      return res.status(404).json({
        message: 'Election not found.'
      })
    }

    // ------------------------------------------------
    // 7. Election must be ACTIVE
    // ------------------------------------------------
    if (election.status !== 'ACTIVE') {
      await connection.rollback()
      return res.status(400).json({
        message: 'Voting is not currently active for this election.'
      })
    }

    // ------------------------------------------------
    // 8. Check student eligibility
    // ------------------------------------------------
    const eligible = await voteModel.isEligibleVoter(
      electionId,
      studentId,
      connection
    )

    if (!eligible) {
      await connection.rollback()
      return res.status(403).json({
        message: 'You are not eligible to vote in this election.'
      })
    }

    // ------------------------------------------------
    // 9. Check position belongs to election
    // ------------------------------------------------
    const position = await voteModel.getPositionById(
      electionId,
      positionId,
      connection
    )

    if (!position) {
      await connection.rollback()
      return res.status(400).json({
        message: 'Invalid position for this election.'
      })
    }

    // ------------------------------------------------
    // 10. Check candidate belongs to election + position
    // ------------------------------------------------
    const candidate = await voteModel.getCandidateById(
      electionId,
      positionId,
      candidateId,
      connection
    )

    if (!candidate) {
      await connection.rollback()
      return res.status(400).json({
        message:
          'Invalid candidate. Candidate does not belong to this election and position.'
      })
    }

    // ------------------------------------------------
    // 11. Candidate must be ACTIVE
    // ------------------------------------------------
    if (candidate.status !== 'ACTIVE') {
      await connection.rollback()
      return res.status(400).json({
        message: 'This candidate is not active.'
      })
    }

    // ------------------------------------------------
    // 12. Check duplicate vote
    // ------------------------------------------------
    const alreadyVoted = await voteModel.hasVoted(
      electionId,
      positionId,
      studentId,
      connection
    )

    if (alreadyVoted) {
      await connection.rollback()
      return res.status(409).json({
        message: 'You have already voted for this position.'
      })
    }

    // ------------------------------------------------
    // 13. Insert vote
    // ------------------------------------------------
    await voteModel.createVote(
      electionId,
      positionId,
      candidateId,
      studentId,
      connection
    )

    // ------------------------------------------------
    // 14. Commit transaction
    // ------------------------------------------------
    await connection.commit()

    return res.status(201).json({
      message: 'Vote cast successfully.',
      vote: {
        electionId: Number(electionId),
        positionId: Number(positionId),
        candidateId: Number(candidateId)
      }
    })
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError)
      }
    }

    console.error('Cast vote error:', error)

    return res.status(500).json({
      message: 'Failed to cast vote.',
      error: error.message
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

// Get the logged-in student's votes in a given election
export async function getMyVotesController(req, res) {
  try {
    const { electionId } = req.params
    const userId = req.user?.userId || req.user?.id

    const [studentRows] = await pool.query(
      `SELECT id FROM students WHERE user_id = ? LIMIT 1`,
      [userId]
    )

    if (studentRows.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found.'
      })
    }

    const studentId = studentRows[0].id
    const votes = await voteModel.getStudentVotesInElection(electionId, studentId)

    return res.json({
      electionId: Number(electionId),
      votesCast: votes
    })
  } catch (error) {
    console.error('Get my votes error:', error)
    return res.status(500).json({
      message: 'Failed to fetch your votes.'
    })
  }
}

// Get election results
export async function getElectionResultsController(req, res) {
  try {
    const { electionId } = req.params
    const userRole = req.user?.role

    if (!electionId || isNaN(Number(electionId))) {
      return res.status(400).json({
        message: 'Valid election ID is required.'
      })
    }

    const election = await voteModel.getElectionById(electionId)
    if (!election) {
      return res.status(404).json({
        message: 'Election not found.'
      })
    }

    // Students can only see results if status is RESULT_PUBLISHED
    if (userRole === 'STUDENT' && election.status !== 'RESULT_PUBLISHED') {
      return res.status(403).json({
        message: 'Results have not been published for this election yet.'
      })
    }

    const results = await voteModel.getElectionResults(electionId)
    const stats = await voteModel.getElectionStats(electionId)

    return res.json({
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        status: election.status,
        startDate: election.start_date,
        endDate: election.end_date
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

// Get election turnout stats
export async function getElectionStatsController(req, res) {
  try {
    const { electionId } = req.params

    if (!electionId || isNaN(Number(electionId))) {
      return res.status(400).json({
        message: 'Valid election ID is required.'
      })
    }

    const election = await voteModel.getElectionById(electionId)
    if (!election) {
      return res.status(404).json({
        message: 'Election not found.'
      })
    }

    const stats = await voteModel.getElectionStats(electionId)

    return res.json({
      electionId: Number(electionId),
      stats
    })
  } catch (error) {
    console.error('Get election stats error:', error)
    return res.status(500).json({
      message: 'Failed to fetch election statistics.',
      error: error.message
    })
  }
}