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
    `SELECT a.*, u.email, u.role, u.status AS user_status,
            d.name AS department_name, d.code AS department_code,
            y.name AS year_name,
            sec.name AS section_name
     FROM admins a
     JOIN users u ON a.user_id = u.id
     LEFT JOIN departments d ON d.id = a.department_id
     LEFT JOIN years y ON y.id = a.year_id
     LEFT JOIN sections sec ON sec.id = a.section_id
     WHERE a.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0];
}

export async function findAdminByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT a.*, u.email, u.role, u.status AS user_status,
            d.name AS department_name, d.code AS department_code,
            y.name AS year_name,
            sec.name AS section_name
     FROM admins a
     JOIN users u ON a.user_id = u.id
     LEFT JOIN departments d ON d.id = a.department_id
     LEFT JOIN years y ON y.id = a.year_id
     LEFT JOIN sections sec ON sec.id = a.section_id
     WHERE a.user_id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0];
}

export async function findAllAdmins() {
  const [rows] = await pool.query(
    `SELECT a.*, u.email, u.status AS user_status, u.created_at AS user_created_at,
            d.name AS department_name, d.code AS department_code,
            y.name AS year_name,
            sec.name AS section_name
     FROM admins a
     JOIN users u ON a.user_id = u.id
     LEFT JOIN departments d ON d.id = a.department_id
     LEFT JOIN years y ON y.id = a.year_id
     LEFT JOIN sections sec ON sec.id = a.section_id
     ORDER BY a.id ASC`
  );

  return rows;
}

export async function updateAdminRecord(id, { fullName, departmentId, yearId = null, sectionId = null }) {
  const fields = [];
  const params = [];

  if (fullName !== undefined) {
    fields.push("full_name = ?");
    params.push(fullName.trim());
  }

  if (departmentId !== undefined) {
    fields.push("department_id = ?");
    params.push(departmentId);
  }

  if (yearId !== undefined) {
    fields.push("year_id = ?");
    params.push(yearId || null);
  }

  if (sectionId !== undefined) {
    fields.push("section_id = ?");
    params.push(sectionId || null);
  }

  if (fields.length === 0) return 0;

  params.push(id);
  const [result] = await pool.query(
    `UPDATE admins SET ${fields.join(", ")} WHERE id = ?`,
    params
  );

  return result.affectedRows;
}

export async function deleteAdminRecord(id) {
  // Find user_id first to delete user
  const admin = await findAdminById(id);
  if (!admin) return 0;

  const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [admin.user_id]);
  return result.affectedRows;
}