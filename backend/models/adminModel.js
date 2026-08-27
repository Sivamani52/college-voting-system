import pool from "../config/db.js";

export async function createAdminRecord({
  userId,
  fullName,
  departmentId,
  yearId = null,
  sectionId = null
}) {
  const [result] = await pool.query(
    `INSERT INTO admins
     (user_id, full_name, department_id, year_id, section_id)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      fullName,
      departmentId,
      yearId || null,
      sectionId || null
    ]
  );

  return result.insertId;
}

export async function findAdminById(id) {
  const [rows] = await pool.query(
    `SELECT a.*, u.email, u.role, u.status AS user_status
     FROM admins a
     JOIN users u ON a.user_id = u.id
     WHERE a.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0];
}

export async function findAdminByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT a.*, u.email, u.role, u.status AS user_status
     FROM admins a
     JOIN users u ON a.user_id = u.id
     WHERE a.user_id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0];
}

export async function findAllAdmins() {
  const [rows] = await pool.query(
    `SELECT a.*, u.email, u.status AS user_status, u.created_at AS user_created_at
     FROM admins a
     JOIN users u ON a.user_id = u.id
     ORDER BY a.id ASC`
  );

  return rows;
}