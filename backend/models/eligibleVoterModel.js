import pool from "../config/db.js";

export async function addEligibleVoter({
  electionId,
  studentId
}) {
  const [result] = await pool.query(
    `INSERT INTO eligible_voters
     (election_id, student_id)
     VALUES (?, ?)`,
    [electionId, studentId]
  );

  return result.insertId;
}

export async function addBulkEligibleVoters(electionId, studentIds) {
  if (!studentIds || studentIds.length === 0) {
    return 0;
  }

  const values = studentIds.map(sId => [electionId, sId]);
  const [result] = await pool.query(
    `INSERT IGNORE INTO eligible_voters
     (election_id, student_id)
     VALUES ?`,
    [values]
  );

  return result.affectedRows;
}

export async function findEligibleVotersByElection(
  electionId
) {
  const [rows] = await pool.query(
    `SELECT
       ev.id,
       ev.election_id,
       ev.student_id,
       ev.created_at,
       s.full_name,
       s.student_id AS student_code,
       s.department_id,
       s.year_id,
       s.section_id
     FROM eligible_voters ev
     JOIN students s
       ON ev.student_id = s.id
     WHERE ev.election_id = ?
     ORDER BY ev.id ASC`,
    [electionId]
  );

  return rows;
}

export async function findEligibleVoter({
  electionId,
  studentId
}) {
  const [rows] = await pool.query(
    `SELECT
       ev.*,
       s.full_name,
       s.student_id AS student_code
     FROM eligible_voters ev
     JOIN students s
       ON ev.student_id = s.id
     WHERE ev.election_id = ?
     AND ev.student_id = ?
     LIMIT 1`,
    [electionId, studentId]
  );

  return rows[0];
}

export async function findEligibleVoterById(id) {
  const [rows] = await pool.query(
    `SELECT
       ev.*,
       s.full_name,
       s.student_id AS student_code
     FROM eligible_voters ev
     JOIN students s
       ON ev.student_id = s.id
     WHERE ev.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0];
}

export async function removeEligibleVoter(id) {
  const [result] = await pool.query(
    `DELETE FROM eligible_voters
     WHERE id = ?`,
    [id]
  );

  return result.affectedRows;
}

export async function removeEligibleVotersByElection(electionId) {
  const [result] = await pool.query(
    `DELETE FROM eligible_voters
     WHERE election_id = ?`,
    [electionId]
  );

  return result.affectedRows;
}