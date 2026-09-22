import pool from './config/db.js';

async function seedAdminElections() {
  console.log('Seeding dummy election data for cse.admin@college.com...');

  // 1. Find user id for cse.admin@college.com
  const [users] = await pool.query(`SELECT id, email, role FROM users WHERE email = ?`, ['cse.admin@college.com']);
  if (users.length === 0) {
    console.error('User cse.admin@college.com not found in users table.');
    process.exit(1);
  }

  const adminUserId = users[0].id;
  console.log(`Found admin user ID: ${adminUserId} (${users[0].email})`);

  // 2. Find CSE department, year, section and students
  const [adminRecord] = await pool.query(`SELECT * FROM admins WHERE user_id = ?`, [adminUserId]);
  const deptId = adminRecord[0]?.department_id || 1;

  const [students] = await pool.query(`SELECT id, student_id, full_name FROM students WHERE department_id = ?`, [deptId]);
  console.log(`Found ${students.length} students in CSE department (ID: ${deptId})`);

  // 3. Define sample elections
  const now = new Date();
  
  const sampleElections = [
    {
      title: 'CSE Department Student Council Election 2026',
      description: 'Annual election to select student council president, secretary, and event leads for Computer Science & Engineering department.',
      startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
      status: 'ACTIVE',
      positions: [
        {
          name: 'CSE Department President',
          description: 'Represents the student body of the CSE Department at all academic and leadership committees.',
        },
        {
          name: 'Technical General Secretary',
          description: 'Coordinates hackathons, workshops, and technical symposiums for CSE students.',
        }
      ]
    },
    {
      title: 'CSE Class Representative & Cultural Lead 2026',
      description: 'Selection of Year 4 Section A Class Representative and Department Cultural Secretary.',
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
      status: 'UPCOMING',
      positions: [
        {
          name: 'Class Representative (CR)',
          description: 'Liaises between students, faculty advisors, and department leadership.',
        },
        {
          name: 'Cultural Coordinator',
          description: 'Leads student performances and cultural celebrations.',
        }
      ]
    },
    {
      title: 'CSE Sports & Athletics Captain Election 2026',
      description: 'Election for Sports Captain to represent CSE at annual inter-department collegiate tournaments.',
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      status: 'DRAFT',
      positions: [
        {
          name: 'Sports Captain (Boys)',
          description: 'Leads department teams in soccer, basketball, cricket, and athletics.',
        },
        {
          name: 'Sports Captain (Girls)',
          description: 'Leads department teams in badminton, basketball, and track events.',
        }
      ]
    },
    {
      title: 'CSE Coding Club Leadership Poll 2026',
      description: 'Concluded election for competitive programming head and open-source project leads.',
      startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      endDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      status: 'CLOSED',
      positions: [
        {
          name: 'Competitive Programming Lead',
          description: 'Mentors collegiate teams in ACM-ICPC and algorithmic competitions.',
        }
      ]
    },
    {
      title: 'CSE Association Annual Election 2025-26',
      description: 'Official department election with published results and voter tallies.',
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      status: 'RESULT_PUBLISHED',
      positions: [
        {
          name: 'Association General Secretary',
          description: 'Oversees all CSE department associations, newsletters, and symposium operations.',
        }
      ]
    }
  ];

  for (const el of sampleElections) {
    // Check if election with title already exists
    const [existing] = await pool.query(`SELECT id FROM elections WHERE title = ?`, [el.title]);
    let electionId;

    if (existing.length > 0) {
      electionId = existing[0].id;
      // Update creator to cse.admin@college.com
      await pool.query(
        `UPDATE elections SET created_by = ?, status = ?, start_date = ?, end_date = ?, description = ? WHERE id = ?`,
        [adminUserId, el.status, el.startDate, el.endDate, el.description, electionId]
      );
      console.log(`Updated existing election: "${el.title}" (ID: ${electionId})`);
    } else {
      const [res] = await pool.query(
        `INSERT INTO elections (title, description, start_date, end_date, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [el.title, el.description, el.startDate, el.endDate, el.status, adminUserId]
      );
      electionId = res.insertId;
      console.log(`Created election: "${el.title}" (ID: ${electionId})`);
    }

    // Positions & Candidates
    if (el.positions && el.positions.length > 0 && students.length > 0) {
      let studentIndex = 0;

      for (const pos of el.positions) {
        let posId;
        const [existingPos] = await pool.query(
          `SELECT id FROM positions WHERE election_id = ? AND name = ?`,
          [electionId, pos.name]
        );

        if (existingPos.length > 0) {
          posId = existingPos[0].id;
        } else {
          const [pRes] = await pool.query(
            `INSERT INTO positions (election_id, name, description) VALUES (?, ?, ?)`,
            [electionId, pos.name, pos.description]
          );
          posId = pRes.insertId;
        }

        // Add 2 candidates for position if available
        const cand1 = students[studentIndex % students.length];
        studentIndex++;
        const cand2 = students[studentIndex % students.length];
        studentIndex++;

        if (cand1) {
          const [exC1] = await pool.query(
            `SELECT id FROM candidates WHERE election_id = ? AND position_id = ? AND student_id = ?`,
            [electionId, posId, cand1.id]
          );
          if (exC1.length === 0) {
            await pool.query(
              `INSERT INTO candidates (election_id, position_id, student_id, manifesto, status)
               VALUES (?, ?, ?, ?, 'ACTIVE')`,
              [electionId, posId, cand1.id, `Dedicated to serving CSE students with honesty and innovation.`]
            );
          }
        }

        if (cand2 && cand2.id !== cand1.id) {
          const [exC2] = await pool.query(
            `SELECT id FROM candidates WHERE election_id = ? AND position_id = ? AND student_id = ?`,
            [electionId, posId, cand2.id]
          );
          if (exC2.length === 0) {
            await pool.query(
              `INSERT INTO candidates (election_id, position_id, student_id, manifesto, status)
               VALUES (?, ?, ?, ?, 'ACTIVE')`,
              [electionId, posId, cand2.id, `Empowering every student voice in our department.`]
            );
          }
        }
      }
    }

    // Eligible voters (register all CSE students as eligible voters)
    for (const st of students) {
      const [exVoter] = await pool.query(
        `SELECT id FROM eligible_voters WHERE election_id = ? AND student_id = ?`,
        [electionId, st.id]
      );
      if (exVoter.length === 0) {
        await pool.query(
          `INSERT INTO eligible_voters (election_id, student_id) VALUES (?, ?)`,
          [electionId, st.id]
        );
      }
    }
  }

  console.log('Dummy election data successfully created for cse.admin@college.com!');
  process.exit(0);
}

seedAdminElections().catch(err => {
  console.error('Error seeding admin elections:', err);
  process.exit(1);
});
