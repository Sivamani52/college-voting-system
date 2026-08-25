import pool from "../config/db.js";

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0];
}

export async function createUser(email, passwordHash, role) {
  const [result] = await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES (?, ?, ?)`,
    [email, passwordHash, role]
  );

  return result.insertId;
}



