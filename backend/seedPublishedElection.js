import pool from './config/db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding published election with full results data...');

  // 1. Get or create a superadmin user as creator
  const [adminUsers] = await pool.query(`SELECT id FROM users WHERE role IN ('SUPER_ADMIN', 'ADMIN') LIMIT 1`);
  let creatorId;

  if (adminUsers.length > 0) {
    creatorId = adminUsers[0].id;
  } else {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const [res] = await pool.query(
      `INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'SUPER_ADMIN', 'ACTIVE')`,
      ['superadmin@college.edu', passwordHash]
    );
    creatorId = res.insertId;
  }

  // 2. Ensure Department, Year, Section exist
  let [depts] = await pool.query(`SELECT id FROM departments LIMIT 1`);
  let deptId;
  if (depts.length === 0) {
    const [res] = await pool.query(
      `INSERT INTO departments (name, code, status) VALUES ('Computer Science & Engineering', 'CSE', 'ACTIVE')`
    );
    deptId = res.insertId;
  } else {
    deptId = depts[0].id;
  }

  let [years] = await pool.query(`SELECT id FROM years WHERE department_id = ? LIMIT 1`, [deptId]);
  let yearId;
  if (years.length === 0) {
    const [res] = await pool.query(
      `INSERT INTO years (department_id, name) VALUES (?, '4th Year')`,
      [deptId]
    );
    yearId = res.insertId;
  } else {
    yearId = years[0].id;
  }

  let [sections] = await pool.query(`SELECT id FROM sections WHERE year_id = ? LIMIT 1`, [yearId]);
  let sectionId;
  if (sections.length === 0) {
    const [res] = await pool.query(
      `INSERT INTO sections (year_id, name) VALUES (?, 'Section A')`,
      [yearId]
    );
    sectionId = res.insertId;
  } else {
    sectionId = sections[0].id;
  }

  // 3. Create or ensure at least 8 students exist
  const studentList = [
    { studentId: 'STU2026001', name: 'Aarav Sharma', email: 'aarav.sharma@college.edu' },
    { studentId: 'STU2026002', name: 'Priya Patel', email: 'priya.patel@college.edu' },
    { studentId: 'STU2026003', name: 'Rahul Verma', email: 'rahul.verma@college.edu' },
    { studentId: 'STU2026004', name: 'Ananya Iyer', email: 'ananya.iyer@college.edu' },
    { studentId: 'STU2026005', name: 'Vikram Singh', email: 'vikram.singh@college.edu' },
    { studentId: 'STU2026006', name: 'Sneha Reddy', email: 'sneha.reddy@college.edu' },
    { studentId: 'STU2026007', name: 'Rohan Gupta', email: 'rohan.gupta@college.edu' },
    { studentId: 'STU2026008', name: 'Divya Nair', email: 'divya.nair@college.edu' }
  ];

  const studentDbIds = [];
  for (const s of studentList) {
    const [existingStudent] = await pool.query(
      `SELECT id FROM students WHERE student_id = ?`,
      [s.studentId]
    );

    if (existingStudent.length > 0) {
      studentDbIds.push(existingStudent[0].id);
    } else {
      const passwordHash = await bcrypt.hash('Student@123', 10);
      let userId;
      const [existingUser] = await pool.query(`SELECT id FROM users WHERE email = ?`, [s.email]);
      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        const [uRes] = await pool.query(
          `INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'STUDENT', 'ACTIVE')`,
          [s.email, passwordHash]
        );
        userId = uRes.insertId;
      }

      const [stRes] = await pool.query(
        `INSERT INTO students (user_id, student_id, full_name, department_id, year_id, section_id, phone, status)
         VALUES (?, ?, ?, ?, ?, ?, '9876543210', 'ACTIVE')`,
        [userId, s.studentId, s.name, deptId, yearId, sectionId]
      );
      studentDbIds.push(stRes.insertId);
    }
  }

  // Also include any other existing students
  const [allStudents] = await pool.query(`SELECT id FROM students`);
  const allStudentIds = allStudents.map(s => s.id);

  // 4. Create a Published Election
  const now = new Date();
  const pastStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pastEnd = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  const [electionRes] = await pool.query(
    `INSERT INTO elections (title, description, start_date, end_date, status, created_by)
     VALUES (?, ?, ?, ?, 'RESULT_PUBLISHED', ?)`,
    [
      'Annual College Union Election 2026 (Published Results)',
      'Official general council election for 2026-2027 student leadership. Results certified and published by Election Committee.',
      pastStart,
      pastEnd,
      creatorId
    ]
  );
  const electionId = electionRes.insertId;
  console.log(`Created election with ID: ${electionId} (Status: RESULT_PUBLISHED)`);

  // 5. Create Positions
  const positionsData = [
    {
      name: 'President',
      description: 'Leads the Student Union and represents student body to university administration.'
    },
    {
      name: 'Vice President',
      description: 'Assists the President and oversees committee operations and student welfare.'
    },
    {
      name: 'General Secretary',
      description: 'Manages official documentation, communications, and council events.'
    }
  ];

  const posIdMap = {};
  for (const pos of positionsData) {
    const [pRes] = await pool.query(
      `INSERT INTO positions (election_id, name, description) VALUES (?, ?, ?)`,
      [electionId, pos.name, pos.description]
    );
    posIdMap[pos.name] = pRes.insertId;
  }

  // 6. Create Candidates
  // President Candidates
  const [candP1] = await pool.query(
    `INSERT INTO candidates (election_id, position_id, student_id, manifesto, photo_url, status)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
    [
      electionId,
      posIdMap['President'],
      studentDbIds[0],
      'Promising campus Wi-Fi upgrade, 24/7 library access, and expanded technical symposiums.',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    ]
  );

  const [candP2] = await pool.query(
    `INSERT INTO candidates (election_id, position_id, student_id, manifesto, photo_url, status)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
    [
      electionId,
      posIdMap['President'],
      studentDbIds[1],
      'Dedicated to student mental wellness initiatives, green campus, and transparent union budgets.',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    ]
  );

  // Vice President Candidates
  const [candVP1] = await pool.query(
    `INSERT INTO candidates (election_id, position_id, student_id, manifesto, photo_url, status)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
    [
      electionId,
      posIdMap['Vice President'],
      studentDbIds[2],
      'Better sports facilities, inter-college athletic tournaments, and cafeteria improvements.',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
    ]
  );

  const [candVP2] = await pool.query(
    `INSERT INTO candidates (election_id, position_id, student_id, manifesto, photo_url, status)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
    [
      electionId,
      posIdMap['Vice President'],
      studentDbIds[3],
      'Industry guest lectures, internship placement portal, and alumni mentoring sessions.',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
    ]
  );

  // General Secretary Candidates
  const [candGS1] = await pool.query(
    `INSERT INTO candidates (election_id, position_id, student_id, manifesto, photo_url, status)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
    [
      electionId,
      posIdMap['General Secretary'],
      studentDbIds[4],
      'Revamping cultural fest, launching coding club hackathons, and transparent council minutes.',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
    ]
  );

  const [candGS2] = await pool.query(
    `INSERT INTO candidates (election_id, position_id, student_id, manifesto, photo_url, status)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
    [
      electionId,
      posIdMap['General Secretary'],
      studentDbIds[5],
      'Streamlining club funding, student grievance redressing cell, and digital ballot audits.',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
    ]
  );

  // 7. Add Eligible Voters
  for (const stId of allStudentIds) {
    await pool.query(
      `INSERT IGNORE INTO eligible_voters (election_id, student_id) VALUES (?, ?)`,
      [electionId, stId]
    );
  }

  // 8. Add Votes
  // Candidate 1 gets more votes for President
  const votersForP1 = allStudentIds.slice(0, Math.ceil(allStudentIds.length * 0.7));
  const votersForP2 = allStudentIds.slice(Math.ceil(allStudentIds.length * 0.7));

  for (const vId of votersForP1) {
    await pool.query(
      `INSERT IGNORE INTO votes (election_id, position_id, candidate_id, student_id) VALUES (?, ?, ?, ?)`,
      [electionId, posIdMap['President'], candP1.insertId, vId]
    );
  }
  for (const vId of votersForP2) {
    await pool.query(
      `INSERT IGNORE INTO votes (election_id, position_id, candidate_id, student_id) VALUES (?, ?, ?, ?)`,
      [electionId, posIdMap['President'], candP2.insertId, vId]
    );
  }

  // Vice President votes
  const votersForVP1 = allStudentIds.slice(0, Math.floor(allStudentIds.length * 0.4));
  const votersForVP2 = allStudentIds.slice(Math.floor(allStudentIds.length * 0.4));

  for (const vId of votersForVP1) {
    await pool.query(
      `INSERT IGNORE INTO votes (election_id, position_id, candidate_id, student_id) VALUES (?, ?, ?, ?)`,
      [electionId, posIdMap['Vice President'], candVP1.insertId, vId]
    );
  }
  for (const vId of votersForVP2) {
    await pool.query(
      `INSERT IGNORE INTO votes (election_id, position_id, candidate_id, student_id) VALUES (?, ?, ?, ?)`,
      [electionId, posIdMap['Vice President'], candVP2.insertId, vId]
    );
  }

  // General Secretary votes
  for (const vId of allStudentIds) {
    const chosenCand = vId % 2 === 0 ? candGS1.insertId : candGS2.insertId;
    await pool.query(
      `INSERT IGNORE INTO votes (election_id, position_id, candidate_id, student_id) VALUES (?, ?, ?, ?)`,
      [electionId, posIdMap['General Secretary'], chosenCand, vId]
    );
  }

  console.log('✅ Successfully seeded published election and cast verified votes!');
  console.log(`Access Results URL: /student/results/${electionId}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
