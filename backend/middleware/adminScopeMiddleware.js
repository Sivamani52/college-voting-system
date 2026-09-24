import pool from "../config/db.js";

/**
 * Fetch authenticated Admin's current assignment directly from the database.
 * Never trusts client-supplied department/year/section.
 */
export async function getAdminScope(userId) {
  const [rows] = await pool.query(
    `SELECT a.id AS admin_id, a.user_id, a.full_name,
            a.department_id, a.year_id, a.section_id,
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

  return rows[0] || null;
}

export const UNAUTHORIZED_ELECTION_MESSAGE =
  "You are not authorized to access this election. This election does not belong to your assigned section or department.";

export const STUDENT_UNAUTHORIZED_ELECTION_MESSAGE =
  "You are not authorized to access this election. This election belongs to another section.";

/**
 * Validates whether an election belongs to an admin's assigned Department + Year + Section.
 * If admin has no year/section assignment, they are a Top Branch Admin and can manage all years/sections in their department.
 * SUPER_ADMIN is exempt (handled at route level).
 */
export function checkAdminElectionScope(adminScope, election) {
  if (!adminScope || !election) return false;

  const deptMatch = Number(adminScope.department_id) === Number(election.department_id);
  if (!deptMatch) return false;

  // If admin is assigned to a specific year, enforce year match
  if (adminScope.year_id !== null && adminScope.year_id !== undefined) {
    if (Number(adminScope.year_id) !== Number(election.year_id)) {
      return false;
    }
  }

  // If admin is assigned to a specific section, enforce section match
  if (adminScope.section_id !== null && adminScope.section_id !== undefined) {
    if (Number(adminScope.section_id) !== Number(election.section_id)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates whether a student belongs to an admin's assigned Department + Year + Section.
 * If admin has no year/section assignment, they are a Top Branch Admin and can manage all students in their department.
 */
export function checkAdminStudentScope(adminScope, student) {
  if (!adminScope || !student) return false;

  const deptMatch = Number(adminScope.department_id) === Number(student.department_id);
  if (!deptMatch) return false;

  // If admin is assigned to a specific year, enforce year match
  if (adminScope.year_id !== null && adminScope.year_id !== undefined) {
    if (Number(adminScope.year_id) !== Number(student.year_id)) {
      return false;
    }
  }

  // If admin is assigned to a specific section, enforce section match
  if (adminScope.section_id !== null && adminScope.section_id !== undefined) {
    if (Number(adminScope.section_id) !== Number(student.section_id)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates whether an election belongs to a student's assigned Department + Year + Section.
 * College-wide elections (department_id is NULL) are accessible to all eligible voters.
 */
export function checkStudentElectionScope(student, election) {
  if (!student || !election) return false;

  // College-wide election
  if (election.department_id === null || election.department_id === undefined) {
    return true;
  }

  const deptMatch = Number(student.department_id) === Number(election.department_id);
  const yearMatch = !election.year_id || Number(student.year_id) === Number(election.year_id);
  const secMatch = !election.section_id || Number(student.section_id) === Number(election.section_id);

  return deptMatch && yearMatch && secMatch;
}

