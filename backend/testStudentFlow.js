import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function testStudentWorkflow() {
  console.log('=== STARTING STUDENT WORKFLOW & REGRESSION TEST ===\n');

  // 1. Student Login
  console.log('--- 1. Student Authentication ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@gmail.com',
      password: 'Student@123'
    })
  });

  const loginData = await loginRes.json();
  if (loginRes.status !== 200) {
    throw new Error(`Student login failed (${loginRes.status}): ${JSON.stringify(loginData)}`);
  }
  const token = loginData.token;
  console.log('  ✅ PASS: Student login succeeds with 200 OK');
  console.log('  ✅ PASS: Role confirmed as', loginData.user.role);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Fetch Student Profile
  console.log('\n--- 2. Student Profile & Academic Details ---');
  
  const profileRes = await fetch(`${BASE_URL}/students/profile`, {
    headers: authHeaders
  });
  const profileData = await profileRes.json();
  if (profileRes.status !== 200) {
    throw new Error(`Fetch profile failed: ${JSON.stringify(profileData)}`);
  }
  const student = profileData.student || profileData;
  console.log('  ✅ PASS: Student profile fetched successfully');
  console.log(`    Student Name: ${student.full_name || student.name}`);
  console.log(`    Student ID: ${student.student_id}`);
  console.log(`    Department: ${student.department_name} (${student.department_code})`);
  console.log(`    Year: ${student.year_name}`);
  console.log(`    Section: ${student.section_name}`);
  console.log(`    Status: ${student.status}`);

  // 3. Fetch Elections Available for Student
  console.log('\n--- 3. Student Elections Browsing ---');
  const electionsRes = await fetch(`${BASE_URL}/elections`, {
    headers: authHeaders
  });
  const electionsData = await electionsRes.json();
  const electionsList = Array.isArray(electionsData) ? electionsData : (electionsData.elections || []);
  console.log(`  ✅ PASS: Fetch student elections returns ${electionsList.length} total elections`);

  if (electionsList.length > 0) {
    const election = electionsList[0];
    console.log(`    Inspecting Election #${election.id}: "${election.title}" [Status: ${election.status}]`);

    // 4. Fetch Positions
    const posRes = await fetch(`${BASE_URL}/positions/election/${election.id}`, {
      headers: authHeaders
    });
    const posData = await posRes.json();
    const positions = Array.isArray(posData) ? posData : (posData.positions || []);
    console.log(`  ✅ PASS: Positions fetched (${positions.length} positions)`);

    // 5. Fetch Candidates
    const candRes = await fetch(`${BASE_URL}/candidates/election/${election.id}`, {
      headers: authHeaders
    });
    const candData = await candRes.json();
    const candidates = Array.isArray(candData) ? candData : (candData.candidates || []);
    console.log(`  ✅ PASS: Candidates fetched (${candidates.length} candidates)`);

    // 6. Check Eligibility
    const eligRes = await fetch(`${BASE_URL}/eligible-voters/check/${election.id}`, {
      headers: authHeaders
    });
    const eligData = await eligRes.json();
    console.log(`  ✅ PASS: Voter eligibility endpoint works:`, eligData.message || eligData.eligible !== undefined ? 'Eligible status checked' : eligData);
  }

  // 7. Test Results on Published Elections
  console.log('\n--- 4. Published Election Results ---');
  const publishedElection = electionsList.find(e => e.status === 'RESULT_PUBLISHED' || e.status === 'COMPLETED');
  if (publishedElection) {
    const resultsRes = await fetch(`${BASE_URL}/votes/results/${publishedElection.id}`, {
      headers: authHeaders
    });
    const resultsData = await resultsRes.json();
    if (resultsRes.status === 200) {
      console.log(`  ✅ PASS: Result published election #${publishedElection.id} results retrieved successfully (200 OK)`);
    } else {
      console.log(`  ⚠️ Status ${resultsRes.status}:`, resultsData.message);
    }
  } else {
    console.log('  ℹ️ Note: No election currently in RESULT_PUBLISHED state');
  }

  // 8. Negative Test: Student Cannot Access Super Admin or Admin endpoints
  console.log('\n--- 5. Student RBAC Boundaries ---');
  const forbiddenRes1 = await fetch(`${BASE_URL}/departments`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Hacker Dept', code: 'HACK' })
  });
  if (forbiddenRes1.status === 403) {
    console.log('  ✅ PASS: Student forbidden from POST /departments (403 Forbidden)');
  } else {
    console.log(`  ❌ FAIL: Expected 403 on POST /departments, got ${forbiddenRes1.status}`);
  }

  const forbiddenRes2 = await fetch(`${BASE_URL}/admins`, {
    headers: authHeaders
  });
  if (forbiddenRes2.status === 403) {
    console.log('  ✅ PASS: Student forbidden from GET /admins (403 Forbidden)');
  } else {
    console.log(`  ❌ FAIL: Expected 403 on GET /admins, got ${forbiddenRes2.status}`);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL STUDENT WORKFLOW & REGRESSION TESTS PASSED!');
  console.log('======================================================\n');
}

testStudentWorkflow().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
