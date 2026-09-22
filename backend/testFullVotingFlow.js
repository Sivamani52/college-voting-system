const BASE_URL = "http://localhost:5000/api";

async function req(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function testFullVoting() {
  console.log("=== STARTING FULL VOTING & DUPLICATE PREVENTION TEST ===");

  // 1. Super Admin Login
  const saLogin = await req("/auth/login", "POST", {
    email: "superadmin@college.com",
    password: "Admin@123",
  });
  if (saLogin.status !== 200) throw new Error("Super Admin login failed");
  const saToken = saLogin.data.token;
  console.log("✓ Super Admin authenticated");

  // 2. Student Login
  const studentLogin = await req("/auth/login", "POST", {
    email: "student@gmail.com",
    password: "Student@123",
  });
  if (studentLogin.status !== 200) throw new Error("Student login failed");
  const studentToken = studentLogin.data.token;
  const studentUserId = studentLogin.data.user.id;
  console.log("✓ Student authenticated (ID:", studentUserId, ")");

  // Get student profile to get student table ID
  const profRes = await req("/students/profile", "GET", null, studentToken);
  const studentId = profRes.data.student?.id;
  console.log("✓ Student internal ID:", studentId);

  // 3. Create a live test election
  const start = new Date(Date.now() - 60000).toISOString();
  const end = new Date(Date.now() + 3600000).toISOString();
  const elRes = await req("/elections", "POST", {
    title: "Test Live Election " + Date.now(),
    description: "Testing single transaction voting and duplicate prevention",
    startDate: start,
    endDate: end,
  }, saToken);
  if (elRes.status !== 201) throw new Error("Create election failed: " + JSON.stringify(elRes.data));
  const electionId = elRes.data.electionId;
  console.log("✓ Test election created (ID:", electionId, ")");

  // 4. Create Position
  const posRes = await req("/positions", "POST", {
    electionId,
    name: "Class President",
    description: "Leads the cohort",
  }, saToken);
  if (posRes.status !== 201) throw new Error("Create position failed: " + JSON.stringify(posRes.data));
  const positionId = posRes.data.positionId;
  console.log("✓ Position created (ID:", positionId, ")");

  // 5. Create Candidate
  const candRes = await req("/candidates", "POST", {
    electionId,
    positionId,
    studentId,
    manifesto: "Integrity and innovation",
  }, saToken);
  if (candRes.status !== 201) throw new Error("Create candidate failed: " + JSON.stringify(candRes.data));
  const candidateId = candRes.data.candidateId;
  console.log("✓ Candidate created (ID:", candidateId, ")");

  // 6. Add student as eligible voter
  const eligRes = await req("/eligible-voters", "POST", {
    electionId,
    studentId,
  }, saToken);
  if (eligRes.status !== 201) throw new Error("Add eligible voter failed: " + JSON.stringify(eligRes.data));
  console.log("✓ Student added to voter eligibility roster");

  // 7. Transition election to ACTIVE
  const activeRes = await req(`/elections/${electionId}/status`, "PATCH", { status: "ACTIVE" }, saToken);
  if (activeRes.status !== 200) throw new Error("Transition to ACTIVE failed: " + JSON.stringify(activeRes.data));
  console.log("✓ Election status is now ACTIVE");

  // 8. Check student eligibility
  const checkEligRes = await req(`/eligible-voters/check/${electionId}`, "GET", null, studentToken);
  if (checkEligRes.status !== 200 || !checkEligRes.data.isEligible) {
    throw new Error("Student eligibility check failed: " + JSON.stringify(checkEligRes.data));
  }
  console.log("✓ Verified student eligibility is TRUE");

  // 9. Student casts vote
  const voteRes = await req("/votes", "POST", {
    election_id: electionId,
    votes: [
      { position_id: positionId, candidate_id: candidateId }
    ],
  }, studentToken);
  if (voteRes.status !== 201) {
    throw new Error("Student vote submission failed: " + JSON.stringify(voteRes.data));
  }
  console.log("✓ Student vote cast successfully (201 Created)");

  // 10. Student attempts to vote again in the same election & position
  const duplicateVoteRes = await req("/votes", "POST", {
    election_id: electionId,
    votes: [
      { position_id: positionId, candidate_id: candidateId }
    ],
  }, studentToken);
  if (duplicateVoteRes.status !== 409) {
    throw new Error("Duplicate vote check failed! Expected 409, got: " + duplicateVoteRes.status + " " + JSON.stringify(duplicateVoteRes.data));
  }
  console.log("✓ Duplicate vote correctly rejected with 409 Conflict:", duplicateVoteRes.data.message);

  // 11. Check student's cast votes
  const myVotesRes = await req(`/votes/my-votes/${electionId}`, "GET", null, studentToken);
  if (myVotesRes.status !== 200 || myVotesRes.data.votes?.length !== 1) {
    throw new Error("Get my votes failed: " + JSON.stringify(myVotesRes.data));
  }
  console.log("✓ My votes verified (1 vote recorded for position)");

  // 12. Close election
  const closeRes = await req(`/elections/${electionId}/status`, "PATCH", { status: "CLOSED" }, saToken);
  if (closeRes.status !== 200) throw new Error("Close election failed: " + JSON.stringify(closeRes.data));
  console.log("✓ Election transitioned to CLOSED");

  // 13. Student attempts to view results before publication
  const studentPreResultsRes = await req(`/results/${electionId}`, "GET", null, studentToken);
  if (studentPreResultsRes.status !== 403) {
    throw new Error("Student should be forbidden from viewing results before publication! Got: " + studentPreResultsRes.status);
  }
  console.log("✓ Student correctly forbidden from viewing unpublished results (403 Forbidden)");

  // Super Admin can view results
  const saResultsRes = await req(`/results/${electionId}`, "GET", null, saToken);
  if (saResultsRes.status !== 200) throw new Error("Super Admin should be able to view results");
  console.log("✓ Super Admin can view results in CLOSED state");

  // 14. Publish Results
  const pubRes = await req(`/elections/${electionId}/status`, "PATCH", { status: "RESULT_PUBLISHED" }, saToken);
  if (pubRes.status !== 200) throw new Error("Publish results failed: " + JSON.stringify(pubRes.data));
  console.log("✓ Election status transitioned to RESULT_PUBLISHED");

  // 15. Student views published results
  const studentPostResultsRes = await req(`/results/${electionId}`, "GET", null, studentToken);
  if (studentPostResultsRes.status !== 200) throw new Error("Student view published results failed");
  console.log("✓ Student can now view published results (200 OK)");
  console.log("  Winner:", studentPostResultsRes.data.results?.[0]?.winner?.candidateName || "Tallied");

  // Clean up
  await req(`/elections/${electionId}`, "DELETE", null, saToken);
  console.log("✓ Cleaned up test election");

  console.log("\n🎉 FULL VOTING & DUPLICATE VOTE WORKFLOW TEST PASSED!");
}

testFullVoting().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
