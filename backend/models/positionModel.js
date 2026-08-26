import pool from "../config/db.js";

export async function createPosition({
  electionId,
  name,
  description
}) {
  const [result] = await pool.query(
    `INSERT INTO positions
     (election_id, name, description)
     VALUES (?, ?, ?)`,
    [
      electionId,
      name,
      description || null
    ]
  );

  return result.insertId;
}


export async function findPositionsByElection(
  electionId
) {
  const [rows] = await pool.query(
    `SELECT *
     FROM positions
     WHERE election_id = ?
     ORDER BY id ASC`,
    [electionId]
  );

  return rows;
}


export async function findPositionById(id) {
  const [rows] = await pool.query(
    `SELECT *
     FROM positions
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0];
}


export async function updatePosition(
  id,
  name,
  description
) {
  const [result] = await pool.query(
    `UPDATE positions
     SET name = ?,
         description = ?
     WHERE id = ?`,
    [
      name,
      description || null,
      id
    ]
  );

  return result.affectedRows;
}


export async function deletePosition(id) {
  const [result] = await pool.query(
    `DELETE FROM positions
     WHERE id = ?`,
    [id]
  );

  return result.affectedRows;
}