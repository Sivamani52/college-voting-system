import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CREDENTIALS_FILE_PATH = path.resolve(__dirname, "./credentials.txt");

const DEPARTMENTS = [
  { code: "CSE", name: "Computer Science and Engineering", adminPass: "cseadmin" },
  { code: "CSM", name: "Computer Science and Machine Learning", adminPass: "csmadmin" },
  { code: "ECE", name: "Electronics and Communication Engineering", adminPass: "eceadmin" },
  { code: "MECH", name: "Mechanical Engineering", adminPass: "mechadmin" },
  { code: "EEE", name: "Electrical and Electronics Engineering", adminPass: "eeeadmin" }
];

const SECTIONS = ["A", "B", "C", "D", "E"];
const STUDENT_COUNTS = ["01", "02", "03", "04", "05"];

async function seedData() {
  console.log("==========================================");
  console.log(" Starting Dummy Data Seeding");
  console.log("==========================================");

  // 1. Ensure Super Admin exists
  const superAdminEmail = "superadmin@college.com";
  const superAdminPass = "Admin@123";
  const superAdminHash = await bcrypt.hash(superAdminPass, 10);

  const [existingSuperAdmin] = await pool.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [superAdminEmail]
  );

  if (existingSuperAdmin.length === 0) {
    await pool.query(
      `INSERT INTO users (email, password_hash, role, status, must_change_password)
       VALUES (?, ?, 'SUPER_ADMIN', 'ACTIVE', 0)`,
      [superAdminEmail, superAdminHash]
    );
    console.log("✔ Created Super Admin account:", superAdminEmail);
  } else {
    await pool.query(
      `UPDATE users SET password_hash = ?, status = 'ACTIVE', must_change_password = 0 WHERE id = ?`,
      [superAdminHash, existingSuperAdmin[0].id]
    );
    console.log("✔ Updated existing Super Admin credentials");
  }

  // 2. Iterate each department
  const seededAdmins = [];
  const seededStudents = {};

  for (const deptConfig of DEPARTMENTS) {
    console.log(`\n--- Setting up Department: ${deptConfig.code} (${deptConfig.name}) ---`);

    // A. Department record
    let deptId;
    const [deptRows] = await pool.query(
      "SELECT id FROM departments WHERE code = ? LIMIT 1",
      [deptConfig.code]
    );

    if (deptRows.length === 0) {
      const [insertDept] = await pool.query(
        "INSERT INTO departments (name, code, status) VALUES (?, ?, 'ACTIVE')",
        [deptConfig.name, deptConfig.code]
      );
      deptId = insertDept.insertId;
      console.log(`✔ Created department: ${deptConfig.code} (ID: ${deptId})`);
    } else {
      deptId = deptRows[0].id;
      await pool.query(
        "UPDATE departments SET name = ?, status = 'ACTIVE' WHERE id = ?",
        [deptConfig.name, deptId]
      );
      console.log(`✔ Existing department found: ${deptConfig.code} (ID: ${deptId})`);
    }

    // B. Department Admin User & Admin Record
    const adminEmail = `${deptConfig.code.toLowerCase()}admin@college.com`;
    const adminPass = deptConfig.adminPass;
    const adminHash = await bcrypt.hash(adminPass, 10);

    let adminUserId;
    const [existingAdminUser] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [adminEmail]
    );

    if (existingAdminUser.length === 0) {
      const [resUser] = await pool.query(
        `INSERT INTO users (email, password_hash, role, status, must_change_password)
         VALUES (?, ?, 'ADMIN', 'ACTIVE', 0)`,
        [adminEmail, adminHash]
      );
      adminUserId = resUser.insertId;
    } else {
      adminUserId = existingAdminUser[0].id;
      await pool.query(
        "UPDATE users SET password_hash = ?, status = 'ACTIVE', must_change_password = 0, role = 'ADMIN' WHERE id = ?",
        [adminHash, adminUserId]
      );
    }

    // Ensure entry in admins table
    const [existingAdminRecord] = await pool.query(
      "SELECT id FROM admins WHERE user_id = ? LIMIT 1",
      [adminUserId]
    );

    const adminFullName = `${deptConfig.code} Department Admin`;
    if (existingAdminRecord.length === 0) {
      await pool.query(
        `INSERT INTO admins (user_id, full_name, department_id, year_id, section_id)
         VALUES (?, ?, ?, NULL, NULL)`,
        [adminUserId, adminFullName, deptId]
      );
    } else {
      await pool.query(
        `UPDATE admins SET full_name = ?, department_id = ?, year_id = NULL, section_id = NULL WHERE user_id = ?`,
        [adminFullName, deptId, adminUserId]
      );
    }

    seededAdmins.push({
      department: deptConfig.code,
      departmentName: deptConfig.name,
      email: adminEmail,
      usernameOrId: `${deptConfig.code.toLowerCase()}admin`,
      password: adminPass
    });
    console.log(`✔ Admin created/updated: ${adminEmail} (Password: ${adminPass})`);

    // C. Academic Year (1st Year)
    const yearName = "1st Year";
    let yearId;
    const [yearRows] = await pool.query(
      "SELECT id FROM years WHERE department_id = ? AND name = ? LIMIT 1",
      [deptId, yearName]
    );

    if (yearRows.length === 0) {
      const [insertYear] = await pool.query(
        "INSERT INTO years (department_id, name) VALUES (?, ?)",
        [deptId, yearName]
      );
      yearId = insertYear.insertId;
      console.log(`✔ Created Academic Year: ${yearName} (ID: ${yearId})`);
    } else {
      yearId = yearRows[0].id;
      console.log(`✔ Found Academic Year: ${yearName} (ID: ${yearId})`);
    }

    // D. 5 Sections (A, B, C, D, E) & 5 Students each
    seededStudents[deptConfig.code] = [];

    for (const secName of SECTIONS) {
      let secId;
      const [secRows] = await pool.query(
        "SELECT id FROM sections WHERE year_id = ? AND name = ? LIMIT 1",
        [yearId, secName]
      );

      if (secRows.length === 0) {
        const [insertSec] = await pool.query(
          "INSERT INTO sections (year_id, name) VALUES (?, ?)",
          [yearId, secName]
        );
        secId = insertSec.insertId;
        console.log(`  ✔ Created Section: ${secName} (ID: ${secId})`);
      } else {
        secId = secRows[0].id;
      }

      // 5 Students in this Section
      for (const num of STUDENT_COUNTS) {
        const studentId = `${deptConfig.code.toLowerCase()}${secName}${num}`;
        const studentEmail = `${studentId.toLowerCase()}@college.com`;
        const studentPassword = `pass-${studentId}-123`;
        const studentFullName = `${deptConfig.code} Student ${secName}${num}`;
        const studentPhone = `98765${num}${deptId % 10}${secName.charCodeAt(0) % 10}`;

        const studentHash = await bcrypt.hash(studentPassword, 10);

        // User record
        let sUserId;
        const [existingUser] = await pool.query(
          "SELECT id FROM users WHERE email = ? LIMIT 1",
          [studentEmail]
        );

        if (existingUser.length === 0) {
          const [insUser] = await pool.query(
            `INSERT INTO users (email, password_hash, role, status, must_change_password)
             VALUES (?, ?, 'STUDENT', 'ACTIVE', 0)`,
            [studentEmail, studentHash]
          );
          sUserId = insUser.insertId;
        } else {
          sUserId = existingUser[0].id;
          await pool.query(
            `UPDATE users SET password_hash = ?, status = 'ACTIVE', must_change_password = 0, role = 'STUDENT' WHERE id = ?`,
            [studentHash, sUserId]
          );
        }

        // Student record
        const [existingStudent] = await pool.query(
          "SELECT id FROM students WHERE student_id = ? OR user_id = ? LIMIT 1",
          [studentId, sUserId]
        );

        if (existingStudent.length === 0) {
          await pool.query(
            `INSERT INTO students (user_id, student_id, full_name, department_id, year_id, section_id, phone, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
            [sUserId, studentId, studentFullName, deptId, yearId, secId, studentPhone]
          );
        } else {
          await pool.query(
            `UPDATE students SET student_id = ?, full_name = ?, department_id = ?, year_id = ?, section_id = ?, phone = ?, status = 'ACTIVE'
             WHERE id = ?`,
            [studentId, studentFullName, deptId, yearId, secId, studentPhone, existingStudent[0].id]
          );
        }

        seededStudents[deptConfig.code].push({
          section: secName,
          studentId: studentId,
          email: studentEmail,
          password: studentPassword,
          fullName: studentFullName
        });
      }
      console.log(`  ✔ Seeded 5 students for Section ${secName}`);
    }
  }

  // 3. Write clean, complete credentials.txt
  console.log("\n--- Writing Clean credentials.txt ---");
  let fileContent = `# ====================================================================
#             COLLEGE VOTING SYSTEM - USER CREDENTIALS
#                      (Clean & Verified)
# ====================================================================

# --------------------------------------------------------------------
# 1. SUPER ADMIN CREDENTIALS
# --------------------------------------------------------------------
Role      : SUPER_ADMIN
Name      : Super Admin
Email     : ${superAdminEmail}
Password  : ${superAdminPass}
Notes     : Full system control across all departments and elections

# --------------------------------------------------------------------
# 2. DEPARTMENT ADMINS CREDENTIALS (5 Branches)
# (Can log in with either Email or Username e.g. "cseadmin")
# --------------------------------------------------------------------
`;

  for (const admin of seededAdmins) {
    fileContent += `Role        : ADMIN (${admin.department})
Department  : ${admin.departmentName}
Username/ID : ${admin.usernameOrId}
Email       : ${admin.email}
Password    : ${admin.password}
--------------------------------------------------------------------
`;
  }

  fileContent += `\n# --------------------------------------------------------------------
# 3. STUDENT CREDENTIALS (5 Branches x 5 Sections x 5 Students = 125 Students)
# (Students can log in with Student ID e.g. "cseA01" or Email e.g. "csea01@college.com")
# (Password accepted as both "pass-cseA01-123" and "cseA01-123")
# --------------------------------------------------------------------
`;

  for (const deptCode of Object.keys(seededStudents)) {
    fileContent += `\n====================================================================
DEPARTMENT: ${deptCode} (Total: 25 Students across Sections A, B, C, D, E)
====================================================================\n`;

    const students = seededStudents[deptCode];
    for (const sec of SECTIONS) {
      fileContent += `--- SECTION ${sec} ---\n`;
      const secStudents = students.filter(s => s.section === sec);
      for (const st of secStudents) {
        fileContent += `Student ID: ${st.studentId.padEnd(8)} | Email: ${st.email.padEnd(24)} | Password: ${st.password.padEnd(18)} | Alternate: ${st.studentId}-123\n`;
      }
      fileContent += `\n`;
    }
  }

  await fs.promises.writeFile(CREDENTIALS_FILE_PATH, fileContent, "utf8");
  console.log(`✔ Successfully generated clean credentials file at: ${CREDENTIALS_FILE_PATH}`);

  console.log("\n==========================================");
  console.log(" Dummy Data Seeding Finished Successfully!");
  console.log("==========================================");
  process.exit(0);
}

seedData().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
