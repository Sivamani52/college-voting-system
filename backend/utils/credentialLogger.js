import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CREDENTIALS_FILE_PATH = path.resolve(__dirname, "../credentials.txt");

/**
 * Appends user credentials (email & password) to the credentials.txt file.
 *
 * @param {Object} params
 * @param {string} params.role - e.g. "SUPER_ADMIN", "ADMIN", "STUDENT"
 * @param {string} params.email - user's email address
 * @param {string} params.password - user's plain text or temporary password
 * @param {string} [params.name] - user's full name (optional)
 * @param {string} [params.studentId] - student ID / roll number (optional)
 * @param {Object} [params.extraInfo] - any additional metadata (optional)
 */
export async function saveCredentialsToFile({
  role,
  email,
  password,
  name,
  studentId,
  extraInfo
}) {
  try {
    const timestamp = new Date().toISOString();
    let entry = `==================================================\n`;
    entry += `Timestamp : ${timestamp}\n`;
    entry += `Role      : ${role || "USER"}\n`;
    if (name) entry += `Name      : ${name}\n`;
    if (studentId) entry += `Student ID: ${studentId}\n`;
    entry += `Email     : ${email}\n`;
    entry += `Password  : ${password}\n`;

    if (extraInfo && Object.keys(extraInfo).length > 0) {
      entry += `Details   : ${JSON.stringify(extraInfo)}\n`;
    }
    entry += `==================================================\n\n`;

    await fs.promises.appendFile(CREDENTIALS_FILE_PATH, entry, "utf8");
    console.log(`[CredentialsLogger] Credentials saved to ${CREDENTIALS_FILE_PATH} for ${email} (${role})`);
  } catch (error) {
    console.error("[CredentialsLogger] Failed to save credentials to file:", error.message);
  }
}

/**
 * Syncs all existing database users (Super Admin, Admins, Students) into credentials.txt.
 */
export async function syncExistingUsersToFile() {
  try {
    // 1. Fetch users with linked admin/student details
    const [users] = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.email,
        u.role,
        u.status,
        u.must_change_password,
        u.created_at,
        a.id AS admin_id,
        a.full_name AS admin_name,
        a.department_id AS admin_dept_id,
        s.id AS student_table_id,
        s.student_id,
        s.full_name AS student_name,
        s.department_id AS student_dept_id,
        s.phone AS student_phone
      FROM users u
      LEFT JOIN admins a ON u.id = a.user_id
      LEFT JOIN students s ON u.id = s.user_id
      ORDER BY u.created_at ASC
    `);

    let content = `# College Voting System - User Credentials Log\n`;
    content += `# Automatically maintained. Contains existing and newly created users.\n\n`;

    for (const u of users) {
      const name = u.role === "ADMIN" ? u.admin_name : (u.role === "STUDENT" ? u.student_name : (u.email === "superadmin@college.com" ? "Super Admin" : ""));
      
      // For Super Admin we know default password: Admin@123
      let passwordDisplay = "[Created prior to logging - please use assigned password]";
      if (u.email === "superadmin@college.com") {
        passwordDisplay = "Admin@123";
      }

      content += `==================================================\n`;
      content += `Timestamp : ${new Date(u.created_at).toISOString()}\n`;
      content += `Role      : ${u.role}\n`;
      if (name) content += `Name      : ${name}\n`;
      if (u.student_id) content += `Student ID: ${u.student_id}\n`;
      content += `Email     : ${u.email}\n`;
      content += `Password  : ${passwordDisplay}\n`;

      const details = {};
      if (u.admin_dept_id) details.departmentId = u.admin_dept_id;
      if (u.student_dept_id) details.departmentId = u.student_dept_id;
      if (u.student_phone) details.phone = u.student_phone;
      if (u.must_change_password) details.mustChangePassword = true;
      if (u.status) details.status = u.status;

      if (Object.keys(details).length > 0) {
        content += `Details   : ${JSON.stringify(details)}\n`;
      }
      content += `==================================================\n\n`;
    }

    await fs.promises.writeFile(CREDENTIALS_FILE_PATH, content, "utf8");
    console.log(`[CredentialsLogger] Synced ${users.length} existing user(s) to ${CREDENTIALS_FILE_PATH}`);
  } catch (error) {
    console.error("[CredentialsLogger] Failed to sync existing users:", error.message);
  }
}

export { CREDENTIALS_FILE_PATH };
