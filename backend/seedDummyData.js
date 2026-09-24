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

const YEARS = [
  { key: "1", name: "1st Year", sections: ["A", "B", "C", "D", "E"] },
  { key: "2", name: "2nd Year", sections: ["A"] },
  { key: "3", name: "3rd Year", sections: ["A"] },
  { key: "4", name: "4th Year", sections: ["A"] }
];

const STUDENT_COUNTS = ["01", "02", "03", "04", "05"];

async function seedData() {
  console.log("==================================================");
  console.log(" Starting Year-Wise & Branch Dummy Data Seeding");
  console.log("==================================================");

  // 1. Ensure Super Admin
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
    console.log("✔ Super Admin created:", superAdminEmail);
  } else {
    await pool.query(
      `UPDATE users SET password_hash = ?, status = 'ACTIVE', must_change_password = 0 WHERE id = ?`,
      [superAdminHash, existingSuperAdmin[0].id]
    );
    console.log("✔ Super Admin updated:", superAdminEmail);
  }

  const seededTopAdmins = [];
  const seededYearAdmins = [];
  const seededStudents = {};

  for (const deptConfig of DEPARTMENTS) {
    console.log(`\n==================================================`);
    console.log(` DEPARTMENT: ${deptConfig.code} (${deptConfig.name})`);
    console.log(`==================================================`);

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
      console.log(`✔ Created Department: ${deptConfig.code} (ID: ${deptId})`);
    } else {
      deptId = deptRows[0].id;
      await pool.query(
        "UPDATE departments SET name = ?, status = 'ACTIVE' WHERE id = ?",
        [deptConfig.name, deptId]
      );
      console.log(`✔ Found Department: ${deptConfig.code} (ID: ${deptId})`);
    }

    // B. ONE TOP ADMIN FOR THIS BRANCH (year_id = null, section_id = null)
    const topAdminEmail = `${deptConfig.code.toLowerCase()}admin@college.com`;
    const topAdminPass = deptConfig.adminPass;
    const topAdminHash = await bcrypt.hash(topAdminPass, 10);
    const topAdminUsername = `${deptConfig.code.toLowerCase()}admin`;

    let topAdminUserId;
    const [existingTopAdminUser] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [topAdminEmail]
    );

    if (existingTopAdminUser.length === 0) {
      const [resUser] = await pool.query(
        `INSERT INTO users (email, password_hash, role, status, must_change_password)
         VALUES (?, ?, 'ADMIN', 'ACTIVE', 0)`,
        [topAdminEmail, topAdminHash]
      );
      topAdminUserId = resUser.insertId;
    } else {
      topAdminUserId = existingTopAdminUser[0].id;
      await pool.query(
        "UPDATE users SET password_hash = ?, status = 'ACTIVE', must_change_password = 0, role = 'ADMIN' WHERE id = ?",
        [topAdminHash, topAdminUserId]
      );
    }

    const topAdminFullName = `${deptConfig.code} Top Branch Admin`;
    const [existingTopAdminRec] = await pool.query(
      "SELECT id FROM admins WHERE user_id = ? LIMIT 1",
      [topAdminUserId]
    );

    if (existingTopAdminRec.length === 0) {
      await pool.query(
        `INSERT INTO admins (user_id, full_name, department_id, year_id, section_id)
         VALUES (?, ?, ?, NULL, NULL)`,
        [topAdminUserId, topAdminFullName, deptId]
      );
    } else {
      await pool.query(
        `UPDATE admins SET full_name = ?, department_id = ?, year_id = NULL, section_id = NULL WHERE user_id = ?`,
        [topAdminFullName, deptId, topAdminUserId]
      );
    }

    seededTopAdmins.push({
      department: deptConfig.code,
      departmentName: deptConfig.name,
      username: topAdminUsername,
      email: topAdminEmail,
      password: topAdminPass,
      scope: "All Years & All Sections (Branch-Wide Authority)"
    });
    console.log(`✔ Top Branch Admin: ${topAdminEmail} | Pass: ${topAdminPass}`);

    // C. 4 Academic Years & Year-Wise Admins (For Section A only)
    seededStudents[deptConfig.code] = [];

    for (const yr of YEARS) {
      let yearId;
      const [yearRows] = await pool.query(
        "SELECT id FROM years WHERE department_id = ? AND name = ? LIMIT 1",
        [deptId, yr.name]
      );

      if (yearRows.length === 0) {
        const [insertYear] = await pool.query(
          "INSERT INTO years (department_id, name) VALUES (?, ?)",
          [deptId, yr.name]
        );
        yearId = insertYear.insertId;
        console.log(`  ✔ Created Academic Year: ${yr.name} (ID: ${yearId})`);
      } else {
        yearId = yearRows[0].id;
        console.log(`  ✔ Found Academic Year: ${yr.name} (ID: ${yearId})`);
      }

      // Create Sections for this Year
      const sectionMap = {};
      for (const secName of yr.sections) {
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
        } else {
          secId = secRows[0].id;
        }
        sectionMap[secName] = secId;
      }

      // D. YEAR-WISE ADMIN FOR ONE SECTION ONLY (Section A)
      const secAId = sectionMap["A"];
      const yrAdminUsername = `${deptConfig.code.toLowerCase()}y${yr.key}admin`;
      const yrAdminEmail = `${yrAdminUsername}@college.com`;
      const yrAdminPass = yrAdminUsername;
      const yrAdminHash = await bcrypt.hash(yrAdminPass, 10);
      const yrAdminFullName = `${deptConfig.code} Year ${yr.key} Sec A Admin`;

      let yrAdminUserId;
      const [existingYrUser] = await pool.query(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [yrAdminEmail]
      );

      if (existingYrUser.length === 0) {
        const [insUser] = await pool.query(
          `INSERT INTO users (email, password_hash, role, status, must_change_password)
           VALUES (?, ?, 'ADMIN', 'ACTIVE', 0)`,
          [yrAdminEmail, yrAdminHash]
        );
        yrAdminUserId = insUser.insertId;
      } else {
        yrAdminUserId = existingYrUser[0].id;
        await pool.query(
          "UPDATE users SET password_hash = ?, status = 'ACTIVE', must_change_password = 0, role = 'ADMIN' WHERE id = ?",
          [yrAdminHash, yrAdminUserId]
        );
      }

      const [existingYrAdminRec] = await pool.query(
        "SELECT id FROM admins WHERE user_id = ? LIMIT 1",
        [yrAdminUserId]
      );

      if (existingYrAdminRec.length === 0) {
        await pool.query(
          `INSERT INTO admins (user_id, full_name, department_id, year_id, section_id)
           VALUES (?, ?, ?, ?, ?)`,
          [yrAdminUserId, yrAdminFullName, deptId, yearId, secAId]
        );
      } else {
        await pool.query(
          `UPDATE admins SET full_name = ?, department_id = ?, year_id = ?, section_id = ? WHERE user_id = ?`,
          [yrAdminFullName, deptId, yearId, secAId, yrAdminUserId]
        );
      }

      seededYearAdmins.push({
        department: deptConfig.code,
        year: yr.name,
        section: "A",
        username: yrAdminUsername,
        email: yrAdminEmail,
        password: yrAdminPass,
        scope: `${deptConfig.code} • ${yr.name} • Section A Only`
      });
      console.log(`  ✔ Year Admin (Sec A only): ${yrAdminEmail} | Pass: ${yrAdminPass}`);

      // E. SEED 5 STUDENTS FOR EACH SECTION IN THIS YEAR
      for (const secName of yr.sections) {
        const secId = sectionMap[secName];
        for (const num of STUDENT_COUNTS) {
          // studentId e.g. cse1A01, cse2A01, cse1B01
          const studentId = `${deptConfig.code.toLowerCase()}${yr.key}${secName}${num}`;
          const studentEmail = `${studentId.toLowerCase()}@college.com`;
          const studentPassword = `pass-${studentId}-123`;
          const studentFullName = `${deptConfig.code} Y${yr.key} Student ${secName}${num}`;
          const studentPhone = `987${yr.key}${num}${deptId % 10}${secName.charCodeAt(0) % 10}`;

          const studentHash = await bcrypt.hash(studentPassword, 10);

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
            year: yr.name,
            yearKey: yr.key,
            section: secName,
            studentId,
            email: studentEmail,
            password: studentPassword,
            fullName: studentFullName
          });
        }
      }
      console.log(`  ✔ Seeded students for ${yr.name} (${yr.sections.length} section(s) x 5 students)`);
    }
  }

  // 3. Write Clean, Organized credentials.txt
  console.log("\n--- Updating credentials.txt ---");
  let fileContent = `# ====================================================================
#             COLLEGE VOTING SYSTEM - USER CREDENTIALS
#                 (Branch Top Admins, Year Admins & Students)
# ====================================================================

# --------------------------------------------------------------------
# 1. SUPER ADMIN CREDENTIALS
# --------------------------------------------------------------------
Role      : SUPER_ADMIN
Name      : Super Admin
Email     : ${superAdminEmail}
Password  : ${superAdminPass}
Scope     : Full Institution-Wide Super Authority


# --------------------------------------------------------------------
# 2. TOP BRANCH ADMINS (1 Top Admin per Particular Branch)
# Scope: Full department oversight (All Years & All Sections)
# (Can log in with Username e.g. "cseadmin" or Email e.g. "cseadmin@college.com")
# --------------------------------------------------------------------
`;

  for (const admin of seededTopAdmins) {
    fileContent += `Role        : TOP_BRANCH_ADMIN (${admin.department})
Department  : ${admin.departmentName}
Username/ID : ${admin.username}
Email       : ${admin.email}
Password    : ${admin.password}
Authority   : ${admin.scope}
--------------------------------------------------------------------
`;
  }

  fileContent += `\n# --------------------------------------------------------------------
# 3. YEAR-WISE ADMINS (Assigned to One Section Only - Section A)
# Scope: Restricted strictly to their assigned Year and Section A
# (Can log in with Username e.g. "csey1admin" or Email "csey1admin@college.com")
# --------------------------------------------------------------------
`;

  for (const ya of seededYearAdmins) {
    fileContent += `Role        : YEAR_ADMIN (${ya.department} - ${ya.year} - Sec ${ya.section})
Department  : ${ya.department}
Assigned    : ${ya.year}, Section ${ya.section}
Username/ID : ${ya.username}
Email       : ${ya.email}
Password    : ${ya.password}
Scope       : ${ya.scope}
--------------------------------------------------------------------
`;
  }

  fileContent += `\n# --------------------------------------------------------------------
# 4. YEAR-WISE STUDENT CREDENTIALS
# (Students can log in with Student ID e.g. "cse1A01" or Email e.g. "cse1a01@college.com")
# (Password accepted as both "pass-cse1A01-123" and "cse1A01-123")
# --------------------------------------------------------------------
`;

  for (const deptCode of Object.keys(seededStudents)) {
    fileContent += `\n====================================================================
DEPARTMENT: ${deptCode} (Year-Wise Student Roster)
====================================================================\n`;

    const students = seededStudents[deptCode];
    for (const yr of YEARS) {
      fileContent += `\n>>> ${yr.name.toUpperCase()} <<<\n`;
      for (const sec of yr.sections) {
        fileContent += `[ Section ${sec} ]\n`;
        const list = students.filter(s => s.yearKey === yr.key && s.section === sec);
        for (const st of list) {
          fileContent += `Student ID: ${st.studentId.padEnd(9)} | Email: ${st.email.padEnd(25)} | Password: ${st.password.padEnd(19)} | Alternate: ${st.studentId}-123\n`;
        }
        fileContent += `\n`;
      }
    }
  }

  await fs.promises.writeFile(CREDENTIALS_FILE_PATH, fileContent, "utf8");
  console.log(`✔ Successfully generated clean credentials file at: ${CREDENTIALS_FILE_PATH}`);

  console.log("\n==================================================");
  console.log(" Dummy Data Seeding Complete!");
  console.log("==================================================");
  process.exit(0);
}

seedData().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
