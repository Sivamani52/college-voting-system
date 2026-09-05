import pool from "../config/db.js";

export async function createElection({
  title,
  description,
  startDate,
  endDate,
  createdBy
}) {
  const [result] = await pool.query(
    `INSERT INTO elections
     (title, description, start_date, end_date, status, created_by)
     VALUES (?, ?, ?, ?, 'DRAFT', ?)`,
    [
      title,
      description || null,
      startDate,
      endDate,
      createdBy
    ]
  );

  return result.insertId;
}

export async function findAllElections() {
  const [rows] = await pool.query(
    `SELECT *
     FROM elections
     ORDER BY created_at DESC`
  );

  return rows;
}

export async function findElectionById(id) {
  const [rows] = await pool.query(
    `SELECT *
     FROM elections
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0];
}

export async function updateElectionStatus(id, status) {
  const [result] = await pool.query(
    `UPDATE elections
     SET status = ?
     WHERE id = ?`,
    [status, id]
  );

  return result.affectedRows;
}

export async function deleteElection(id) {
  const [result] = await pool.query(
    `DELETE FROM elections
     WHERE id = ?`,
    [id]
  );

  return result.affectedRows;
}