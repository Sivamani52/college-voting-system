import pool from "../config/db.js";

export async function findStudentByStudentId(studentId) {
  if (!studentId) return null;
  const cleanId = String(studentId).trim();
  const [rows] = await pool.query(
    "SELECT * FROM students WHERE LOWER(student_id) = LOWER(?) LIMIT 1",
    [cleanId]
  );

  return rows[0];
}

export async function findStudentByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT s.*, u.email, u.role, u.status AS user_status,
            d.name AS department_name, d.code AS department_code,
            y.name AS year_name,
            sec.name AS section_name
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN departments d ON d.id = s.department_id
     LEFT JOIN years y ON y.id = s.year_id
     LEFT JOIN sections sec ON sec.id = s.section_id
     WHERE s.user_id = ?
     LIMIT 1`,
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
    `SELECT s.*, u.email, u.role, u.status AS user_status,
            d.name AS department_name, d.code AS department_code,
            y.name AS year_name,
            sec.name AS section_name
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN departments d ON d.id = s.department_id
     LEFT JOIN years y ON y.id = s.year_id
     LEFT JOIN sections sec ON sec.id = s.section_id
     WHERE (s.id = ? OR s.student_id = ?)
     LIMIT 1`,
    [id, id]
  );

  return rows[0];
}

export async function findAllStudents({ departmentId, yearId, sectionId, status } = {}) {
  let query = `
    SELECT s.*, u.email, u.status AS user_status,
           d.name AS department_name, d.code AS department_code,
           y.name AS year_name,
           sec.name AS section_name
    FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN departments d ON d.id = s.department_id
    LEFT JOIN years y ON y.id = s.year_id
    LEFT JOIN sections sec ON sec.id = s.section_id
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

export async function updateStudentRecord(id, { fullName, departmentId, yearId, sectionId, phone, status }) {
  const fields = [];
  const params = [];

  if (fullName !== undefined) {
    fields.push("full_name = ?");
    params.push(fullName.trim());
  }
  if (departmentId !== undefined) {
    fields.push("department_id = ?");
    params.push(Number(departmentId));
  }
  if (yearId !== undefined) {
    fields.push("year_id = ?");
    params.push(Number(yearId));
  }
  if (sectionId !== undefined) {
    fields.push("section_id = ?");
    params.push(Number(sectionId));
  }
  if (phone !== undefined) {
    fields.push("phone = ?");
    params.push(phone ? phone.trim() : null);
  }
  if (status !== undefined) {
    fields.push("status = ?");
    params.push(status);
  }

  if (fields.length === 0) return 0;

  params.push(id);
  const [result] = await pool.query(
    `UPDATE students SET ${fields.join(", ")} WHERE id = ?`,
    params
  );

  return result.affectedRows;
}

export async function deleteStudentRecord(id) {
  const student = await findStudentById(id);
  if (!student) return 0;

  // Deleting user cascades to student, eligible_voters, votes
  const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [student.user_id]);
  return result.affectedRows;
}