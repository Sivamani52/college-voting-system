import pool from '../config/db.js'

// Get election
export async function getElectionById(electionId) {
  const [rows] = await pool.query(
    `SELECT id, title, description, status, start_date, end_date, created_by, created_at
     FROM elections
     WHERE id = ?
     LIMIT 1`,
    [electionId]
  )

  return rows[0] || null
}


// Get all positions of an election
export async function getPositionsByElection(electionId) {
  const [rows] = await pool.query(
    `SELECT id, name, description
     FROM positions
     WHERE election_id = ?
     ORDER BY id ASC`,
    [electionId]
  )

  return rows
}


// Get candidates and their vote counts
export async function getCandidateResults(
  electionId,
  positionId
) {
  const [rows] = await pool.query(
    `SELECT
        c.id AS candidate_id,
        c.student_id,
        s.student_id AS student_code,
        c.manifesto,
        c.photo_url,
        c.status,
        s.full_name AS candidate_name,
        COUNT(v.id) AS vote_count
     FROM candidates c

     INNER JOIN students s
       ON c.student_id = s.id

     LEFT JOIN votes v
       ON v.candidate_id = c.id
       AND v.election_id = c.election_id
       AND v.position_id = c.position_id

     WHERE c.election_id = ?
       AND c.position_id = ?

     GROUP BY
        c.id,
        c.student_id,
        s.student_id,
        c.manifesto,
        c.photo_url,
        c.status,
        s.full_name

     ORDER BY vote_count DESC, c.id ASC`,
    [electionId, positionId]
  )

  return rows
}