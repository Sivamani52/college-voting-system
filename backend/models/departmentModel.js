import pool from "../config/db.js";

export async function findAllDepartmentsWithStats() {
  const [rows] = await pool.query(
    `SELECT 
      d.id,
      d.name,
      d.code,
      d.status,
      d.created_at,
      COUNT(DISTINCT y.id) AS total_years,
      COUNT(DISTINCT sec.id) AS total_sections,
      COUNT(DISTINCT s.id) AS total_students,
      COUNT(DISTINCT a.id) AS total_admins
    FROM departments d
    LEFT JOIN years y ON y.department_id = d.id
    LEFT JOIN sections sec ON sec.year_id = y.id
    LEFT JOIN students s ON s.department_id = d.id
    LEFT JOIN admins a ON a.department_id = d.id
    GROUP BY d.id
    ORDER BY d.name ASC`
  );

  return rows;
}

export async function findDepartmentById(id) {
  const [rows] = await pool.query(
    `SELECT 
      d.id,
      d.name,
      d.code,
      d.status,
      d.created_at,
      COUNT(DISTINCT y.id) AS total_years,
      COUNT(DISTINCT sec.id) AS total_sections,
      COUNT(DISTINCT s.id) AS total_students,
      COUNT(DISTINCT a.id) AS total_admins
    FROM departments d
    LEFT JOIN years y ON y.department_id = d.id
    LEFT JOIN sections sec ON sec.year_id = y.id
    LEFT JOIN students s ON s.department_id = d.id
    LEFT JOIN admins a ON a.department_id = d.id
    WHERE d.id = ?
    GROUP BY d.id
    LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function findDepartmentByNameOrCode(name, code, excludeId = null) {
  let query = `SELECT * FROM departments WHERE (name = ? OR code = ?)`;
  const params = [name, code];

  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }

  query += ` LIMIT 1`;
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

export async function createDepartment({ name, code, status = "ACTIVE" }) {
  const [result] = await pool.query(
    `INSERT INTO departments (name, code, status)
     VALUES (?, ?, ?)`,
    [name.trim(), code.trim().toUpperCase(), status]
  );

  return result.insertId;
}

export async function updateDepartment(id, { name, code, status }) {
  const fields = [];
  const params = [];

  if (name !== undefined) {
    fields.push(`name = ?`);
    params.push(name.trim());
  }

  if (code !== undefined) {
    fields.push(`code = ?`);
    params.push(code.trim().toUpperCase());
  }

  if (status !== undefined) {
    fields.push(`status = ?`);
    params.push(status);
  }

  if (fields.length === 0) return 0;

  params.push(id);
  const [result] = await pool.query(
    `UPDATE departments SET ${fields.join(", ")} WHERE id = ?`,
    params
  );

  return result.affectedRows;
}

export async function deleteDepartment(id) {
  const [result] = await pool.query(
    `DELETE FROM departments WHERE id = ?`,
    [id]
  );

  return result.affectedRows;
}
