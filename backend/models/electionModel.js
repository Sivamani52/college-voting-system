import pool from "../config/db.js";

export async function createElection({
  title,
  description,
  startDate,
  endDate,
  status = "DRAFT",
  departmentId = null,
  yearId = null,
  sectionId = null,
  createdBy
}) {
  const [result] = await pool.query(
    `INSERT INTO elections
     (title, description, start_date, end_date, status, department_id, year_id, section_id, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description || null,
      startDate,
      endDate,
      status,
      departmentId || null,
      yearId || null,
      sectionId || null,
      createdBy
    ]
  );

  return result.insertId;
}

export async function findAllElections({
  departmentId,
  yearId,
  sectionId,
  studentId,
  studentDepartmentId,
  studentYearId,
  studentSectionId,
  excludeDrafts = false
} = {}) {
  let query = `
    SELECT e.*,
           d.name AS department_name, d.code AS department_code,
           y.name AS year_name,
           sec.name AS section_name
    FROM elections e
    LEFT JOIN departments d ON d.id = e.department_id
    LEFT JOIN years y ON y.id = e.year_id
    LEFT JOIN sections sec ON sec.id = e.section_id
  `;

  const whereClauses = [];
  const params = [];

  // If scoped to a specific student (must be an eligible voter)
  if (studentId) {
    query += ` JOIN eligible_voters ev ON ev.election_id = e.id AND ev.student_id = ? `;
    params.push(studentId);
  }

  // Student section scope: election must be either college-wide OR belong to student's department/year/section
  if (studentDepartmentId !== undefined && studentDepartmentId !== null) {
    whereClauses.push(
      `(e.department_id IS NULL OR (e.department_id = ? AND (e.year_id IS NULL OR e.year_id = ?) AND (e.section_id IS NULL OR e.section_id = ?)))`
    );
    params.push(studentDepartmentId, studentYearId || null, studentSectionId || null);
  }

  // Scoped to specific section (for normal Admins)
  if (departmentId !== undefined && departmentId !== null) {
    whereClauses.push("e.department_id = ?");
    params.push(departmentId);
  }

  if (yearId !== undefined && yearId !== null) {
    whereClauses.push("e.year_id = ?");
    params.push(yearId);
  }

  if (sectionId !== undefined && sectionId !== null) {
    whereClauses.push("e.section_id = ?");
    params.push(sectionId);
  }

  if (excludeDrafts) {
    whereClauses.push("e.status != 'DRAFT'");
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ` + whereClauses.join(" AND ");
  }

  query += ` ORDER BY e.created_at DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
}

export async function findElectionById(id) {
  const [rows] = await pool.query(
    `SELECT e.*,
            d.name AS department_name, d.code AS department_code,
            y.name AS year_name,
            sec.name AS section_name
     FROM elections e
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN years y ON y.id = e.year_id
     LEFT JOIN sections sec ON sec.id = e.section_id
     WHERE e.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0];
}

export async function updateElectionDetails(id, { title, description, startDate, endDate }) {
  const fields = [];
  const params = [];

  if (title !== undefined) {
    fields.push("title = ?");
    params.push(title.trim());
  }
  if (description !== undefined) {
    fields.push("description = ?");
    params.push(description ? description.trim() : null);
  }
  if (startDate !== undefined) {
    fields.push("start_date = ?");
    params.push(new Date(startDate));
  }
  if (endDate !== undefined) {
    fields.push("end_date = ?");
    params.push(new Date(endDate));
  }

  if (fields.length === 0) return 0;

  params.push(id);
  const [result] = await pool.query(
    `UPDATE elections SET ${fields.join(", ")} WHERE id = ?`,
    params
  );

  return result.affectedRows;
}

export async function updateElectionStatus(id, status) {
  const [result] = await pool.query(
    `UPDATE elections
     SET status = ?
     WHERE id = ?`,
    [status, id]
  );

  return result.affectedRows;
}

export async function deleteElection(id) {
  const [result] = await pool.query(
    `DELETE FROM elections
     WHERE id = ?`,
    [id]
  );

  return result.affectedRows;
}