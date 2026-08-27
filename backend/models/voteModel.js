import pool from '../config/db.js'

// Check whether the student has already voted for this position
export async function hasVoted(electionId, positionId, studentId, connection = pool) {
  const [rows] = await connection.query(
    `SELECT election_id, position_id, candidate_id, student_id, voted_at
     FROM votes
     WHERE election_id = ?
       AND position_id = ?
       AND student_id = ?
     LIMIT 1`,
    [electionId, positionId, studentId]
  )

  return rows.length > 0
}

// Get all votes cast by a specific student in an election
export async function getStudentVotesInElection(electionId, studentId) {
  const [rows] = await pool.query(
    `SELECT 
       v.position_id,
       v.candidate_id,
       v.voted_at,
       p.name AS position_name,
       s.full_name AS candidate_name
     FROM votes v
     JOIN positions p ON v.position_id = p.id
     JOIN candidates c ON v.candidate_id = c.id
     JOIN students s ON c.student_id = s.id
     WHERE v.election_id = ?
       AND v.student_id = ?`,
    [electionId, studentId]
  )

  return rows
}

// Check whether the student is eligible for the election
export async function isEligibleVoter(electionId, studentId, connection = pool) {
  const [rows] = await connection.query(
    `SELECT id
     FROM eligible_voters
     WHERE election_id = ?
       AND student_id = ?
     LIMIT 1`,
    [electionId, studentId]
  )

  return rows.length > 0
}

// Get election
export async function getElectionById(electionId, connection = pool) {
  const [rows] = await connection.query(
    `SELECT id, title, description, status, start_date, end_date, created_by, created_at
     FROM elections
     WHERE id = ?
     LIMIT 1`,
    [electionId]
  )

  return rows[0] || null
}

// Check position belongs to election
export async function getPositionById(
  electionId,
  positionId,
  connection = pool
) {
  const [rows] = await connection.query(
    `SELECT id, election_id, name, description
     FROM positions
     WHERE id = ?
       AND election_id = ?
     LIMIT 1`,
    [positionId, electionId]
  )

  return rows[0] || null
}

// Check candidate belongs to election + position
export async function getCandidateById(
  electionId,
  positionId,
  candidateId,
  connection = pool
) {
  const [rows] = await connection.query(
    `SELECT id, election_id, position_id, student_id, manifesto, photo_url, status
     FROM candidates
     WHERE id = ?
       AND election_id = ?
       AND position_id = ?
     LIMIT 1`,
    [candidateId, electionId, positionId]
  )

  return rows[0] || null
}

// Insert vote
export async function createVote(
  electionId,
  positionId,
  candidateId,
  studentId,
  connection = pool
) {
  const [result] = await connection.query(
    `INSERT INTO votes
      (election_id, position_id, candidate_id, student_id, voted_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [electionId, positionId, candidateId, studentId]
  )

  return result
}

// Get Election Results tally grouped by position & candidate
export async function getElectionResults(electionId) {
  const [rows] = await pool.query(
    `SELECT 
       p.id AS position_id,
       p.name AS position_name,
       c.id AS candidate_id,
       s.full_name AS candidate_name,
       s.student_id AS student_code,
       c.photo_url,
       c.status AS candidate_status,
       COUNT(v.id) AS vote_count
     FROM positions p
     JOIN candidates c ON c.position_id = p.id
     JOIN students s ON c.student_id = s.id
     LEFT JOIN votes v ON v.candidate_id = c.id
     WHERE p.election_id = ?
     GROUP BY p.id, c.id
     ORDER BY p.id ASC, vote_count DESC`,
    [electionId]
  )

  // Group by position
  const resultsByPosition = {}
  for (const row of rows) {
    if (!resultsByPosition[row.position_id]) {
      resultsByPosition[row.position_id] = {
        positionId: row.position_id,
        positionName: row.position_name,
        candidates: []
      }
    }
    resultsByPosition[row.position_id].candidates.push({
      candidateId: row.candidate_id,
      candidateName: row.candidate_name,
      studentCode: row.student_code,
      photoUrl: row.photo_url,
      candidateStatus: row.candidate_status,
      voteCount: Number(row.vote_count)
    })
  }

  return Object.values(resultsByPosition)
}

// Get Election Turnout Statistics
export async function getElectionStats(electionId) {
  const [[eligibleCountRow]] = await pool.query(
    `SELECT COUNT(*) AS total_eligible
     FROM eligible_voters
     WHERE election_id = ?`,
    [electionId]
  )

  const [[votedStudentsRow]] = await pool.query(
    `SELECT COUNT(DISTINCT student_id) AS total_voted_students
     FROM votes
     WHERE election_id = ?`,
    [electionId]
  )

  const [[totalVotesRow]] = await pool.query(
    `SELECT COUNT(*) AS total_votes_cast
     FROM votes
     WHERE election_id = ?`,
    [electionId]
  )

  const totalEligible = eligibleCountRow.total_eligible || 0
  const votedStudents = votedStudentsRow.total_voted_students || 0
  const totalVotesCast = totalVotesRow.total_votes_cast || 0
  const turnoutPercentage = totalEligible > 0 ? ((votedStudents / totalEligible) * 100).toFixed(2) : "0.00"

  return {
    totalEligibleVoters: totalEligible,
    uniqueVotersParticipated: votedStudents,
    totalVotesCast,
    turnoutPercentage: `${turnoutPercentage}%`
  }
}