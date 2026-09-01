import pool from '../config/db.js'
import * as voteModel from '../models/voteModel.js'

// ==========================================
// SUBMIT VOTES (Single Transaction API)
// ==========================================
export async function submitVotes(req, res) {
  let connection

  try {
    // ------------------------------------------------
    // 1. Authenticate user from JWT and check STUDENT role
    // ------------------------------------------------
    const userId = req.user?.userId || req.user?.id

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.'
      })
    }

    if (req.user?.role !== 'STUDENT') {
      return res.status(403).json({
        message: 'Only students are authorized to cast votes.'
      })
    }

    // ------------------------------------------------
    // 2. Validate request payload
    // Expected format:
    // {
    //   "election_id": 1,
    //   "votes": [
    //     { "position_id": 1, "candidate_id": 5 },
    //     { "position_id": 2, "candidate_id": 8 }
    //   ]
    // }
    // ------------------------------------------------
    const rawElectionId = req.body.election_id ?? req.body.electionId
    const electionId = Number(rawElectionId)

    if (!electionId || isNaN(electionId)) {
      return res.status(400).json({
        message: 'A valid election_id is required.'
      })
    }

    // Normalize incoming votes array (or single vote if passed)
    let votes = req.body.votes
    if (!votes && (req.body.position_id || req.body.positionId)) {
      votes = [
        {
          position_id: req.body.position_id ?? req.body.positionId,
          candidate_id: req.body.candidate_id ?? req.body.candidateId
        }
      ]
    }

    if (!Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({
        message: 'A non-empty array of votes is required.'
      })
    }

    // Sanitize vote items and check for required fields
    const sanitizedVotes = []
    const positionIdsInRequest = new Set()

    for (let i = 0; i < votes.length; i++) {
      const v = votes[i]
      const posId = Number(v.position_id ?? v.positionId)
      const candId = Number(v.candidate_id ?? v.candidateId)

      if (!posId || isNaN(posId) || !candId || isNaN(candId)) {
        return res.status(400).json({
          message: `Vote at index ${i} is missing valid position_id or candidate_id.`
        })
      }

      if (positionIdsInRequest.has(posId)) {
        return res.status(400).json({
          message: `Duplicate vote submission for position ID ${posId} in the same request.`
        })
      }

      positionIdsInRequest.add(posId)
      sanitizedVotes.push({
        position_id: posId,
        candidate_id: candId
      })
    }

    // ------------------------------------------------
    // 3. Verify student exists and is ACTIVE
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

    if (student.status !== 'ACTIVE') {
      return res.status(403).json({
        message: 'Inactive student accounts are not permitted to vote.'
      })
    }

    const studentId = student.id

    // ------------------------------------------------
    // 4. Begin MySQL Transaction
    // ------------------------------------------------
    connection = await pool.getConnection()
    await connection.beginTransaction()

    // ------------------------------------------------
    // 5. Validate Election exists and status is ACTIVE
    // ------------------------------------------------
    const election = await voteModel.getElectionById(electionId, connection)

    if (!election) {
      await connection.rollback()
      return res.status(404).json({
        message: 'Election not found.'
      })
    }

    if (election.status !== 'ACTIVE') {
      await connection.rollback()
      return res.status(400).json({
        message: `Voting is not active for this election. Current status: ${election.status}.`
      })
    }

    // ------------------------------------------------
    // 6. Validate Student is an eligible voter
    // ------------------------------------------------
    const isEligible = await voteModel.isEligibleVoter(
      electionId,
      studentId,
      connection
    )

    if (!isEligible) {
      await connection.rollback()
      return res.status(403).json({
        message: 'You are not registered as an eligible voter for this election.'
      })
    }

    // ------------------------------------------------
    // 7. Validate Each Position and Candidate
    // ------------------------------------------------
    for (const voteItem of sanitizedVotes) {
      const { position_id, candidate_id } = voteItem

      // a. Check position belongs to this election
      const position = await voteModel.getPositionById(
        electionId,
        position_id,
        connection
      )

      if (!position) {
        await connection.rollback()
        return res.status(400).json({
          message: `Position ID ${position_id} does not belong to election ID ${electionId}.`
        })
      }

      // b. Check candidate belongs to election and position
      const candidate = await voteModel.getCandidateById(
        electionId,
        position_id,
        candidate_id,
        connection
      )

      if (!candidate) {
        await connection.rollback()
        return res.status(400).json({
          message: `Candidate ID ${candidate_id} is not nominated for position "${position.name}".`
        })
      }

      // c. Check candidate status is ACTIVE
      if (candidate.status !== 'ACTIVE') {
        await connection.rollback()
        return res.status(400).json({
          message: `Candidate "${candidate.full_name}" is currently inactive.`
        })
      }

      // d. Check student has not already voted for this position
      const alreadyVoted = await voteModel.hasVoted(
        electionId,
        position_id,
        studentId,
        connection
      )

      if (alreadyVoted) {
        await connection.rollback()
        return res.status(409).json({
          message: `You have already cast a vote for position "${position.name}".`
        })
      }

      // e. Insert vote record using existing table structure:
      // election_id, position_id, candidate_id, student_id, voted_at
      await voteModel.createVote(
        electionId,
        position_id,
        candidate_id,
        studentId,
        connection
      )
    }

    // ------------------------------------------------
    // 8. Commit Transaction
    // ------------------------------------------------
    await connection.commit()

    return res.status(201).json({
      success: true,
      message: 'All votes have been successfully submitted and recorded.',
      election_id: electionId,
      submitted_votes_count: sanitizedVotes.length,
      voted_at: new Date().toISOString()
    })

  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Transaction rollback error:', rollbackError)
      }
    }

    console.error('Submit votes error:', error)

    // Handle database duplicate key constraint if concurrent requests occur
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return res.status(409).json({
        message: 'A duplicate vote was detected. You have already voted for one or more of these positions.'
      })
    }

    return res.status(500).json({
      message: 'Failed to submit votes due to a server error.',
      error: error.message
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

// Alias for backwards compatibility
export const castVote = submitVotes

// ==========================================
// GET STUDENT'S VOTES IN AN ELECTION
// ==========================================
export async function getMyVotesController(req, res) {
  try {
    const rawElectionId = req.params.electionId
    const electionId = Number(rawElectionId)

    if (!electionId || isNaN(electionId)) {
      return res.status(400).json({
        message: 'Valid election ID is required.'
      })
    }

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
      election_id: electionId,
      electionId: electionId,
      votes: votes,
      votesCast: votes
    })
  } catch (error) {
    console.error('Get my votes error:', error)
    return res.status(500).json({
      message: 'Failed to fetch your votes.'
    })
  }
}

// ==========================================
// GET ELECTION RESULTS
// ==========================================
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

// ==========================================
// GET ELECTION TURNOUT STATS
// ==========================================
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