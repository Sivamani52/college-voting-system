import pool from "../config/db.js";

export async function findStudentByStudentId(studentId) {
  const [rows] = await pool.query(
    "SELECT * FROM students WHERE student_id = ? LIMIT 1",
    [studentId]
  );

  return rows[0];
}

export async function findStudentByUserId(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM students WHERE user_id = ? LIMIT 1",
    [userId]
  );

  return rows[0];
}

export async function createStudentRecord({
  userId,
  studentId,
  fullName,
  departmentId,
  yearId,
  sectionId,
  phone = null
}) {
  const [result] = await pool.query(
    `INSERT INTO students
     (user_id, student_id, full_name, department_id,
      year_id, section_id, phone, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
    [
      userId,
      studentId,
      fullName,
      departmentId,
      yearId,
      sectionId,
      phone || null
    ]
  );

  return result.insertId;
}


export async function findStudentById(id) {
  const [rows] = await pool.query(
    `SELECT s.*, u.email, u.role, u.status AS user_status
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0];
}

export async function findAllStudents({ departmentId, yearId, sectionId, status } = {}) {
  let query = `
    SELECT s.*, u.email, u.status AS user_status
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (departmentId) {
    query += ` AND s.department_id = ?`;
    params.push(departmentId);
  }
  if (yearId) {
    query += ` AND s.year_id = ?`;
    params.push(yearId);
  }
  if (sectionId) {
    query += ` AND s.section_id = ?`;
    params.push(sectionId);
  }
  if (status) {
    query += ` AND s.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY s.id ASC`;

  const [rows] = await pool.query(query, params);
  return rows;
}