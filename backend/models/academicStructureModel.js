import pool from "../config/db.js";

// --- Year Operations ---

export async function findYearsByDepartment(departmentId = null) {
  let query = `
    SELECT 
      y.id,
      y.department_id,
      y.name,
      y.created_at,
      d.name AS department_name,
      d.code AS department_code,
      COUNT(DISTINCT sec.id) AS total_sections,
      COUNT(DISTINCT s.id) AS total_students
    FROM years y
    JOIN departments d ON d.id = y.department_id
    LEFT JOIN sections sec ON sec.year_id = y.id
    LEFT JOIN students s ON s.year_id = y.id
  `;
  const params = [];

  if (departmentId) {
    query += ` WHERE y.department_id = ?`;
    params.push(departmentId);
  }

  query += ` GROUP BY y.id ORDER BY d.name ASC, y.name ASC`;
  const [rows] = await pool.query(query, params);
  return rows;
}

export async function findYearById(id) {
  const [rows] = await pool.query(
    `SELECT y.*, d.name AS department_name, d.code AS department_code
     FROM years y
     JOIN departments d ON d.id = y.department_id
     WHERE y.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function findYearByDepartmentAndName(departmentId, name, excludeId = null) {
  let query = `SELECT * FROM years WHERE department_id = ? AND name = ?`;
  const params = [departmentId, name];

  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }

  query += ` LIMIT 1`;
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

export async function createYear({ departmentId, name }) {
  const [result] = await pool.query(
    `INSERT INTO years (department_id, name) VALUES (?, ?)`,
    [departmentId, name.trim()]
  );
  return result.insertId;
}

export async function updateYear(id, { name }) {
  const [result] = await pool.query(
    `UPDATE years SET name = ? WHERE id = ?`,
    [name.trim(), id]
  );
  return result.affectedRows;
}

export async function deleteYear(id) {
  const [result] = await pool.query(
    `DELETE FROM years WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
}

// --- Section Operations ---

export async function findSectionsByYear(yearId = null, departmentId = null) {
  let query = `
    SELECT 
      sec.id,
      sec.year_id,
      sec.name,
      sec.created_at,
      y.name AS year_name,
      d.id AS department_id,
      d.name AS department_name,
      d.code AS department_code,
      COUNT(DISTINCT s.id) AS total_students
    FROM sections sec
    JOIN years y ON y.id = sec.year_id
    JOIN departments d ON d.id = y.department_id
    LEFT JOIN students s ON s.section_id = sec.id
  `;
  const params = [];
  const conditions = [];

  if (yearId) {
    conditions.push(`sec.year_id = ?`);
    params.push(yearId);
  }

  if (departmentId) {
    conditions.push(`d.id = ?`);
    params.push(departmentId);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` GROUP BY sec.id ORDER BY d.name ASC, y.name ASC, sec.name ASC`;
  const [rows] = await pool.query(query, params);
  return rows;
}

export async function findSectionById(id) {
  const [rows] = await pool.query(
    `SELECT sec.*, y.name AS year_name, y.department_id, d.name AS department_name, d.code AS department_code
     FROM sections sec
     JOIN years y ON y.id = sec.year_id
     JOIN departments d ON d.id = y.department_id
     WHERE sec.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function findSectionByYearAndName(yearId, name, excludeId = null) {
  let query = `SELECT * FROM sections WHERE year_id = ? AND name = ?`;
  const params = [yearId, name];

  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }

  query += ` LIMIT 1`;
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

export async function createSection({ yearId, name }) {
  const [result] = await pool.query(
    `INSERT INTO sections (year_id, name) VALUES (?, ?)`,
    [yearId, name.trim()]
  );
  return result.insertId;
}

export async function updateSection(id, { name }) {
  const [result] = await pool.query(
    `UPDATE sections SET name = ? WHERE id = ?`,
    [name.trim(), id]
  );
  return result.affectedRows;
}

export async function deleteSection(id) {
  const [result] = await pool.query(
    `DELETE FROM sections WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
}

// --- Nested Academic Structure Tree ---

export async function getFullAcademicStructureTree() {
  const [departments] = await pool.query(`SELECT * FROM departments ORDER BY name ASC`);
  const [years] = await pool.query(`SELECT * FROM years ORDER BY name ASC`);
  const [sections] = await pool.query(`SELECT * FROM sections ORDER BY name ASC`);
  const [studentCounts] = await pool.query(`
    SELECT department_id, year_id, section_id, COUNT(*) AS count
    FROM students
    GROUP BY department_id, year_id, section_id
  `);

  const tree = departments.map((dept) => {
    const deptYears = years.filter((y) => y.department_id === dept.id);
    const yearsWithSections = deptYears.map((yr) => {
      const yrSections = sections.filter((s) => s.year_id === yr.id);
      const sectionsWithCount = yrSections.map((sec) => {
        const match = studentCounts.find(
          (sc) => sc.department_id === dept.id && sc.year_id === yr.id && sc.section_id === sec.id
        );
        return {
          ...sec,
          studentCount: match ? match.count : 0,
        };
      });

      const yearStudentCount = studentCounts
        .filter((sc) => sc.department_id === dept.id && sc.year_id === yr.id)
        .reduce((sum, item) => sum + item.count, 0);

      return {
        ...yr,
        studentCount: yearStudentCount,
        sections: sectionsWithCount,
      };
    });

    const deptStudentCount = studentCounts
      .filter((sc) => sc.department_id === dept.id)
      .reduce((sum, item) => sum + item.count, 0);

    return {
      ...dept,
      studentCount: deptStudentCount,
      years: yearsWithSections,
    };
  });

  return tree;
}
