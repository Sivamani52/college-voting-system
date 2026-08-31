import * as voteModel from '../models/voteModel.js'

// ==========================================
// GET ELECTION RESULTS
// ==========================================
export async function getElectionResults(req, res) {
  try {
    const { electionId } = req.params
    const userRole = req.user?.role

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
    // Students can only see results if status is RESULT_PUBLISHED
    // ------------------------------------------
    if (userRole === 'STUDENT' && election.status !== 'RESULT_PUBLISHED') {
      return res.status(403).json({
        message: 'Results have not been published for this election yet.'
      })
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