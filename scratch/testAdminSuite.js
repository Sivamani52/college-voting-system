import assert from "assert";

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("=== STARTING COMPREHENSIVE ADMIN MODULE TEST SUITE ===");
  let adminToken = "";
  let adminUser = null;
  let testStudentId = `TEST_${Date.now()}`;
  let createdStudentRecordId = null;
  let createdElectionId = null;
  let createdPositionId = null;
  let createdCandidateId = null;
  let createdVoterId = null;

  // TEST 1: Admin Login
  console.log("\n[TEST 1] Admin Login with valid credentials");
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "cse.admin@college.com",
      password: "Admin@123",
    }),
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200, `Login failed: ${JSON.stringify(loginData)}`);
  assert.ok(loginData.token, "JWT token missing");
  assert.strictEqual(loginData.user.role, "ADMIN", "Role should be ADMIN");
  adminToken = loginData.token;
  adminUser = loginData.user;
  console.log("✓ Admin login successful. Token acquired.");

  // TEST 2: Invalid Login
  console.log("\n[TEST 2] Invalid Login attempt");
  const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "cse.admin@college.com",
      password: "WrongPassword999!",
    }),
  });
  assert.strictEqual(badLoginRes.status, 401, "Should reject invalid credentials with 401");
  console.log("✓ Invalid login rejected with 401.");

  // TEST 3: Admin Profile
  console.log("\n[TEST 3] Fetch Admin Profile (/api/admins/profile)");
  const profileRes = await fetch(`${BASE_URL}/admins/profile`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const profileData = await profileRes.json();
  assert.strictEqual(profileRes.status, 200, `Profile failed: ${JSON.stringify(profileData)}`);
  assert.ok(profileData.admin, "Admin profile missing");
  console.log("✓ Admin profile fetched:", {
    name: profileData.admin.full_name,
    email: profileData.admin.email,
    deptId: profileData.admin.department_id,
    yearId: profileData.admin.year_id,
    secId: profileData.admin.section_id,
  });

  // TEST 4: Fetch Scoped Students
  console.log("\n[TEST 4] Fetch Scoped Students (/api/students)");
  const studentsRes = await fetch(`${BASE_URL}/students`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const studentsData = await studentsRes.json();
  assert.strictEqual(studentsRes.status, 200, `Students fetch failed: ${JSON.stringify(studentsData)}`);
  assert.ok(Array.isArray(studentsData.students), "Students list must be array");
  console.log(`✓ Fetched ${studentsData.students.length} scoped students.`);

  // TEST 5: Create Student
  console.log("\n[TEST 5] Create New Student (/api/students)");
  const createStudentRes = await fetch(`${BASE_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      studentId: testStudentId,
      fullName: "Automated Test Student",
      email: `test.${Date.now()}@college.com`,
      departmentId: profileData.admin.department_id,
      yearId: profileData.admin.year_id || 1,
      sectionId: profileData.admin.section_id || 1,
      phone: "9876543210",
    }),
  });
  const createStudentData = await createStudentRes.json();
  assert.strictEqual(createStudentRes.status, 201, `Create student failed: ${JSON.stringify(createStudentData)}`);
  createdStudentRecordId = createStudentData.studentRecordId;
  console.log("✓ Student created successfully:", createStudentData);

  // TEST 6: Get Student By ID
  console.log("\n[TEST 6] Get Student By ID (/api/students/:id)");
  const getStudentRes = await fetch(`${BASE_URL}/students/${createdStudentRecordId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const getStudentData = await getStudentRes.json();
  assert.strictEqual(getStudentRes.status, 200, "Should get student record");
  assert.strictEqual(getStudentData.student.student_id, testStudentId);
  console.log("✓ Student fetched by ID successfully.");

  // TEST 7: Create Election
  console.log("\n[TEST 7] Create Election (/api/elections)");
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const createElectionRes = await fetch(`${BASE_URL}/elections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: `Test Election ${Date.now()}`,
      description: "Automated election for testing Admin module",
      startDate: nextWeek.toISOString(),
      endDate: nextMonth.toISOString(),
    }),
  });
  const createElectionData = await createElectionRes.json();
  assert.strictEqual(createElectionRes.status, 201, `Create election failed: ${JSON.stringify(createElectionData)}`);
  createdElectionId = createElectionData.electionId;
  console.log("✓ Election created with ID:", createdElectionId);

  // TEST 8: Add Position to Election
  console.log("\n[TEST 8] Create Position (/api/positions)");
  const createPosRes = await fetch(`${BASE_URL}/positions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      electionId: createdElectionId,
      name: "Class Representative",
      description: "Class leader",
    }),
  });
  const createPosData = await createPosRes.json();
  assert.strictEqual(createPosRes.status, 201, `Create position failed: ${JSON.stringify(createPosData)}`);
  createdPositionId = createPosData.positionId;
  console.log("✓ Position created with ID:", createdPositionId);

  // TEST 9: Add Candidate for Position
  console.log("\n[TEST 9] Nominate Candidate (/api/candidates)");
  const createCandRes = await fetch(`${BASE_URL}/candidates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      electionId: createdElectionId,
      positionId: createdPositionId,
      studentId: createdStudentRecordId,
      manifesto: "Empowering students through technology",
    }),
  });
  const createCandData = await createCandRes.json();
  assert.strictEqual(createCandRes.status, 201, `Create candidate failed: ${JSON.stringify(createCandData)}`);
  createdCandidateId = createCandData.candidateId;
  console.log("✓ Candidate nominated with ID:", createdCandidateId);

  // TEST 10: Add Eligible Voter
  console.log("\n[TEST 10] Add Eligible Voter (/api/eligible-voters)");
  const addVoterRes = await fetch(`${BASE_URL}/eligible-voters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      electionId: createdElectionId,
      studentId: createdStudentRecordId,
    }),
  });
  const addVoterData = await addVoterRes.json();
  assert.strictEqual(addVoterRes.status, 201, `Add voter failed: ${JSON.stringify(addVoterData)}`);
  createdVoterId = addVoterData.id;
  console.log("✓ Eligible voter added with ID:", createdVoterId);

  // TEST 11: Get Eligible Voters for Election
  console.log("\n[TEST 11] Get Eligible Voters (/api/eligible-voters/election/:electionId)");
  const getVotersRes = await fetch(`${BASE_URL}/eligible-voters/election/${createdElectionId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const getVotersData = await getVotersRes.json();
  assert.strictEqual(getVotersRes.status, 200, "Should get eligible voters");
  assert.ok(Array.isArray(getVotersData.eligibleVoters), "Should be array of voters");
  console.log(`✓ Fetched ${getVotersData.eligibleVoters.length} eligible voter(s).`);

  // TEST 12: Status Transitions
  console.log("\n[TEST 12] Election Status Lifecycle Transitions");
  
  // DRAFT -> UPCOMING
  const statusUpcomingRes = await fetch(`${BASE_URL}/elections/${createdElectionId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "UPCOMING" }),
  });
  assert.strictEqual(statusUpcomingRes.status, 200, "DRAFT -> UPCOMING failed");
  console.log("✓ Status transitioned to UPCOMING");

  // UPCOMING -> ACTIVE
  const statusActiveRes = await fetch(`${BASE_URL}/elections/${createdElectionId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "ACTIVE" }),
  });
  assert.strictEqual(statusActiveRes.status, 200, "UPCOMING -> ACTIVE failed");
  console.log("✓ Status transitioned to ACTIVE");

  // ACTIVE -> CLOSED
  const statusClosedRes = await fetch(`${BASE_URL}/elections/${createdElectionId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "CLOSED" }),
  });
  assert.strictEqual(statusClosedRes.status, 200, "ACTIVE -> CLOSED failed");
  console.log("✓ Status transitioned to CLOSED");

  // CLOSED -> RESULT_PUBLISHED
  const statusPublishedRes = await fetch(`${BASE_URL}/elections/${createdElectionId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "RESULT_PUBLISHED" }),
  });
  assert.strictEqual(statusPublishedRes.status, 200, "CLOSED -> RESULT_PUBLISHED failed");
  console.log("✓ Status transitioned to RESULT_PUBLISHED");

  // TEST 13: View Results
  console.log("\n[TEST 13] View Election Results (/api/results/:electionId)");
  const resultsRes = await fetch(`${BASE_URL}/results/${createdElectionId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const resultsData = await resultsRes.json();
  assert.strictEqual(resultsRes.status, 200, "Should get election results");
  assert.ok(resultsData.election, "Election result metadata missing");
  console.log("✓ Election results fetched successfully for published election.");

  // TEST 14: Delete Election
  console.log("\n[TEST 14] Delete Test Election (/api/elections/:id)");
  const deleteRes = await fetch(`${BASE_URL}/elections/${createdElectionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(deleteRes.status, 200, "Delete election failed");
  console.log("✓ Test election deleted successfully.");

  // TEST 15: Role Isolation (Admin cannot access Super Admin endpoint)
  console.log("\n[TEST 15] Verify Admin Role Isolation (/api/admins - Super Admin only)");
  const superAdminEndpointRes = await fetch(`${BASE_URL}/admins`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(superAdminEndpointRes.status, 403, "Admin must be blocked from Super Admin endpoint with 403");
  console.log("✓ Admin correctly denied access (403 Forbidden) to Super Admin endpoint.");

  console.log("\n=======================================================");
  console.log("🎉 ALL 15 AUTOMATED TESTS PASSED WITH 100% SUCCESS!");
  console.log("=======================================================");
}

runTests().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
