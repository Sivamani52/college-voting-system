import pool from "../config/db.js";

export async function createCandidate({
  electionId,
  positionId,
  studentId,
  manifesto,
  photoUrl
}) {
  const [result] = await pool.query(
    `INSERT INTO candidates
     (election_id, position_id, student_id, manifesto, photo_url, status)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
    [
      electionId,
      positionId,
      studentId,
      manifesto || null,
      photoUrl || null
    ]
  );

  return result.insertId;
}

export async function findCandidatesByElection(
  electionId
) {
  const [rows] = await pool.query(
    `SELECT
       c.*,
       s.full_name,
       s.student_id AS student_code,
       s.department_id,
       s.year_id,
       s.section_id,
       p.name AS position_name
     FROM candidates c
     JOIN students s
       ON c.student_id = s.id
     JOIN positions p
       ON c.position_id = p.id
     WHERE c.election_id = ?
     ORDER BY p.id, c.id`,
    [electionId]
  );

  return rows;
}

export async function findCandidatesByPosition(
  positionId
) {
  const [rows] = await pool.query(
    `SELECT
       c.*,
       s.full_name,
       s.student_id AS student_code,
       s.department_id,
       s.year_id,
       s.section_id,
       p.name AS position_name
     FROM candidates c
     JOIN students s
       ON c.student_id = s.id
     JOIN positions p
       ON c.position_id = p.id
     WHERE c.position_id = ?
     ORDER BY c.id`,
    [positionId]
  );

  return rows;
}

export async function findCandidateById(id) {
  const [rows] = await pool.query(
    `SELECT
       c.*,
       s.full_name,
       s.student_id AS student_code,
       s.department_id,
       s.year_id,
       s.section_id,
       p.name AS position_name
     FROM candidates c
     JOIN students s
       ON c.student_id = s.id
     JOIN positions p
       ON c.position_id = p.id
     WHERE c.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0];
}

export async function updateCandidate({
  id,
  manifesto,
  photoUrl,
  status
}) {
  const [result] = await pool.query(
    `UPDATE candidates
     SET manifesto = ?,
         photo_url = ?,
         status = ?
     WHERE id = ?`,
    [
      manifesto !== undefined ? manifesto : null,
      photoUrl !== undefined ? photoUrl : null,
      status,
      id
    ]
  );

  return result.affectedRows;
}

export async function deleteCandidate(id) {
  const [result] = await pool.query(
    `DELETE FROM candidates
     WHERE id = ?`,
    [id]
  );

  return result.affectedRows;
}