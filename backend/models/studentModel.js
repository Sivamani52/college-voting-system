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