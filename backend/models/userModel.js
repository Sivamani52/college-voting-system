import pool from "../config/db.js";

export async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1",
    [cleanEmail]
  );

  return rows[0];
}

export async function findUserById(userId) {
  if (!userId) return null;
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [userId]
  );

  return rows[0];
}

export async function createUser(email, passwordHash, role, mustChangePassword = false) {
  const [result] = await pool.query(
    `INSERT INTO users (email, password_hash, role, must_change_password)
     VALUES (?, ?, ?, ?)`,
    [email, passwordHash, role, mustChangePassword]
  );

  return result.insertId;
}

export async function updateMustChangePassword(userId, mustChangePassword) {
  const [result] = await pool.query(
    `UPDATE users SET must_change_password = ? WHERE id = ?`,
    [mustChangePassword, userId]
  );

  return result.affectedRows > 0;
}
