import pool from "../config/db.js";

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
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
