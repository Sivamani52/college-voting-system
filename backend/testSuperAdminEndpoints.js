const BASE_URL = "http://localhost:5000/api";

async function req(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function testSuite() {
  console.log("=== STARTING SUPER ADMIN TEST SUITE ===");

  try {
    // 1. Super Admin Login
    const loginRes = await req("/auth/login", "POST", {
      email: "superadmin@college.com",
      password: "Admin@123",
    });

    console.log("✓ 1. Super Admin login passed. Token received.");
    const token = loginRes.token;

    // 2. GET /departments
    const deptsRes = await req("/departments", "GET", null, token);
    console.log(`✓ 2. GET /departments passed (${deptsRes.departments.length} departments found)`);

    // 3. POST /departments
    const uniqueCode = "T" + Math.floor(Math.random() * 10000);
    const createDeptRes = await req(
      "/departments",
      "POST",
      { name: "Test Department " + uniqueCode, code: uniqueCode, status: "ACTIVE" },
      token
    );
    const testDeptId = createDeptRes.departmentId;
    console.log(`✓ 3. POST /departments passed (Dept ID: ${testDeptId})`);

    // 4. PUT /departments/:id
    await req(
      `/departments/${testDeptId}`,
      "PUT",
      { name: "Updated Test Department " + uniqueCode },
      token
    );
    console.log("✓ 4. PUT /departments/:id passed");

    // 5. POST /years
    const yearRes = await req(
      "/years",
      "POST",
      { departmentId: testDeptId, name: "1st Year" },
      token
    );
    const testYearId = yearRes.data?.yearId || yearRes.yearId;
    console.log(`✓ 5. POST /years passed (Year ID: ${testYearId})`);

    // 6. POST /sections
    const secRes = await req(
      "/sections",
      "POST",
      { yearId: testYearId, name: "A" },
      token
    );
    const testSecId = secRes.data?.sectionId || secRes.sectionId;
    console.log(`✓ 6. POST /sections passed (Section ID: ${testSecId})`);

    // 7. GET /academic-structure
    const structRes = await req("/academic-structure", "GET", null, token);
    console.log(`✓ 7. GET /academic-structure passed (${structRes.structure.length} faculty branches in tree)`);

    // 8. POST /admins
    const adminEmail = `testadmin_${Date.now()}@college.com`;
    const createAdminRes = await req(
      "/admins",
      "POST",
      {
        name: "Test Administrator",
        email: adminEmail,
        departmentId: testDeptId,
        yearId: testYearId,
        sectionId: testSecId,
      },
      token
    );
    const testAdminId = createAdminRes.adminId;
    console.log(`✓ 8. POST /admins passed (Admin ID: ${testAdminId}, Temp Password generated)`);

    // 9. GET /admins
    const adminsRes = await req("/admins", "GET", null, token);
    console.log(`✓ 9. GET /admins passed (${adminsRes.admins.length} admins returned with department names)`);

    // 10. PATCH /admins/:id/status
    await req(
      `/admins/${testAdminId}/status`,
      "PATCH",
      { status: "INACTIVE" },
      token
    );
    console.log("✓ 10. PATCH /admins/:id/status passed (Marked INACTIVE)");

    // 11. POST /elections
    const startDate = new Date(Date.now() + 60000).toISOString();
    const endDate = new Date(Date.now() + 86400000).toISOString();
    const electionRes = await req(
      "/elections",
      "POST",
      {
        title: "Test Super Admin Election " + Date.now(),
        description: "Test election description",
        startDate,
        endDate,
      },
      token
    );
    const testElectionId = electionRes.electionId;
    console.log(`✓ 11. POST /elections passed (Election ID: ${testElectionId})`);

    // 12. PATCH /elections/:id/status
    await req(
      `/elections/${testElectionId}/status`,
      "PATCH",
      { status: "UPCOMING" },
      token
    );
    await req(
      `/elections/${testElectionId}/status`,
      "PATCH",
      { status: "ACTIVE" },
      token
    );
    await req(
      `/elections/${testElectionId}/status`,
      "PATCH",
      { status: "CLOSED" },
      token
    );
    await req(
      `/elections/${testElectionId}/status`,
      "PATCH",
      { status: "RESULT_PUBLISHED" },
      token
    );
    console.log("✓ 12. PATCH /elections/:id/status lifecycle passed (UPCOMING -> ACTIVE -> CLOSED -> RESULT_PUBLISHED)");

    // 13. GET /results/:id
    await req(`/results/${testElectionId}`, "GET", null, token);
    console.log("✓ 13. GET /results/:id passed");

    // Clean up test data safely
    await req(`/elections/${testElectionId}`, "DELETE", null, token);
    await req(`/admins/${testAdminId}`, "DELETE", null, token);
    await req(`/sections/${testSecId}`, "DELETE", null, token);
    await req(`/years/${testYearId}`, "DELETE", null, token);
    await req(`/departments/${testDeptId}`, "DELETE", null, token);
    console.log("✓ 14. Clean-up of test items passed.");

    console.log("\n==========================================");
    console.log("🎉 ALL SUPER ADMIN BACKEND TESTS PASSED!");
    console.log("==========================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err.data || err.message);
    process.exit(1);
  }
}

testSuite();
