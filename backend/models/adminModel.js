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