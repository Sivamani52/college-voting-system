import pool from "../config/db.js";

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
     (user_id, student_id, full_name, department_id, year_id, section_id, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      studentId,
      fullName,
      departmentId,
      yearId,
      sectionId,
      phone
    ]
  );

  return result.insertId;
}

export async function findStudentByStudentId(studentId) {
  const [rows] = await pool.query(
    `SELECT * FROM students WHERE student_id = ? LIMIT 1`,
    [studentId]
  );
  return rows[0];
}
