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

async function verifyFullSystem() {
  console.log("===============================================================");
  console.log("🚀 STARTING COMPREHENSIVE COLLEGE VOTING SYSTEM VERIFICATION");
  console.log("===============================================================\n");

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      testPassed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      testFailed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // ==============================================================
  // 1. SUPER ADMIN AUTHENTICATION
  // ==============================================================
  console.log("--- 1. Super Admin Authentication ---");
  const saLogin = await req("/auth/login", "POST", {
    email: "superadmin@college.com",
    password: "Admin@123",
  });
  assert(saLogin.status === 200, "Super Admin login succeeds with status 200");
  assert(Boolean(saLogin.data.token), "Super Admin JWT token issued");
  assert(saLogin.data.user?.role === "SUPER_ADMIN", "User role is SUPER_ADMIN");
  const saToken = saLogin.data.token;

  // ==============================================================
  // 2. SUPER ADMIN DASHBOARD METRICS
  // ==============================================================
  console.log("\n--- 2. Super Admin Dashboard Statistics ---");
  const [deptsRes, yearsRes, secRes, adminsRes, studentsRes, electionsRes] = await Promise.all([
    req("/departments", "GET", null, saToken),
    req("/years", "GET", null, saToken),
    req("/sections", "GET", null, saToken),
    req("/admins", "GET", null, saToken),
    req("/students", "GET", null, saToken),
    req("/elections", "GET", null, saToken),
  ]);

  assert(deptsRes.status === 200, "Fetch all departments returns 200");
  assert(yearsRes.status === 200, "Fetch all years returns 200");
  assert(secRes.status === 200, "Fetch all sections returns 200");
  assert(adminsRes.status === 200, "Fetch all admins returns 200");
  assert(studentsRes.status === 200, "Fetch all students returns 200");
  assert(electionsRes.status === 200, "Fetch all elections returns 200");

  console.log(`    📊 Total Departments: ${deptsRes.data.departments?.length}`);
  console.log(`    📊 Total Years: ${yearsRes.data.years?.length}`);
  console.log(`    📊 Total Sections: ${secRes.data.sections?.length}`);
  console.log(`    📊 Total Admins: ${adminsRes.data.admins?.length}`);
  console.log(`    📊 Total Students: ${studentsRes.data.students?.length}`);
  console.log(`    📊 Total Elections: ${electionsRes.data.elections?.length}`);

  // ==============================================================
  // 3. DEPARTMENTS MODULE
  // ==============================================================
  console.log("\n--- 3. Departments Module ---");
  const deptCode = "MECH" + Math.floor(Math.random() * 1000);
  const newDeptRes = await req(
    "/departments",
    "POST",
    { name: `Mechanical Engineering ${deptCode}`, code: deptCode, status: "ACTIVE" },
    saToken
  );
  assert(newDeptRes.status === 201, "Create department returns 201 Created");
  const newDeptId = newDeptRes.data.departmentId;

  // Duplicate Check
  const dupDeptRes = await req(
    "/departments",
    "POST",
    { name: `Mechanical Engineering ${deptCode}`, code: deptCode },
    saToken
  );
  assert(dupDeptRes.status === 400, "Duplicate department code/name correctly rejected with 400");

  // Update Dept
  const updateDeptRes = await req(
    `/departments/${newDeptId}`,
    "PUT",
    { name: `Updated Mech Eng ${deptCode}` },
    saToken
  );
  assert(updateDeptRes.status === 200, "Update department returns 200 OK");

  // Get Dept Details
  const deptDetailsRes = await req(`/departments/${newDeptId}`, "GET", null, saToken);
  assert(deptDetailsRes.status === 200, "Get department by ID returns 200 OK with years and admins array");

  // ==============================================================
  // 4. YEARS & SECTIONS (ACADEMIC HIERARCHY)
  // ==============================================================
  console.log("\n--- 4. Years & Sections Module ---");
  // Add Year
  const newYearRes = await req(
    "/years",
    "POST",
    { departmentId: newDeptId, name: "1st Year" },
    saToken
  );
  assert(newYearRes.status === 201, "Create year under department returns 201 Created");
  const newYearId = newYearRes.data.yearId;

  // Duplicate Year Check
  const dupYearRes = await req(
    "/years",
    "POST",
    { departmentId: newDeptId, name: "1st Year" },
    saToken
  );
  assert(dupYearRes.status === 400, "Duplicate year within same department rejected with 400");

  // Add Section
  const newSecRes = await req(
    "/sections",
    "POST",
    { yearId: newYearId, name: "A" },
    saToken
  );
  assert(newSecRes.status === 201, "Create section under year returns 201 Created");
  const newSecId = newSecRes.data.sectionId;

  // Duplicate Section Check
  const dupSecRes = await req(
    "/sections",
    "POST",
    { yearId: newYearId, name: "A" },
    saToken
  );
  assert(dupSecRes.status === 400, "Duplicate section within same year rejected with 400");

  // Academic Structure Tree
  const treeRes = await req("/academic-structure", "GET", null, saToken);
  assert(treeRes.status === 200, "Get academic structure hierarchy tree returns 200 OK");
  const treeDept = treeRes.data.structure?.find((d) => d.id === newDeptId);
  assert(Boolean(treeDept), "Newly created department present in academic tree");
  assert(treeDept.years?.length === 1, "Department contains 1 year in tree");
  assert(treeDept.years[0].sections?.length === 1, "Year contains 1 section in tree");

  // ==============================================================
  // 5. ADMIN MANAGEMENT & BREVO EMAIL FLOW
  // ==============================================================
  console.log("\n--- 5. Admin Management Module ---");
  const adminEmail = `faculty_${Date.now()}@college.com`;
  const createAdminRes = await req(
    "/admins",
    "POST",
    {
      name: "Prof. Alan Turing",
      email: adminEmail,
      departmentId: newDeptId,
      yearId: newYearId,
      sectionId: newSecId,
    },
    saToken
  );
  assert(createAdminRes.status === 201, "Super Admin creates Admin with 201 Created");
  assert(Boolean(createAdminRes.data.temporaryPassword), "Temporary password returned & logged for Brevo delivery");
  const newAdminId = createAdminRes.data.adminId;
  const newUserId = createAdminRes.data.userId;
  const tempPassword = createAdminRes.data.temporaryPassword;

  // Verify Admin List has department name join
  const allAdmins = await req("/admins", "GET", null, saToken);
  const foundAdmin = allAdmins.data.admins?.find((a) => a.id === newAdminId);
  assert(Boolean(foundAdmin), "New Admin found in admins list");
  assert(Boolean(foundAdmin.department_name), "Admin record includes joined department_name");

  // Update Admin Details
  const updateAdminRes = await req(
    `/admins/${newAdminId}`,
    "PUT",
    { name: "Prof. Alan Mathison Turing" },
    saToken
  );
  assert(updateAdminRes.status === 200, "Update admin details returns 200 OK");

  // Toggle Admin Status
  const toggleStatusRes = await req(
    `/admins/${newAdminId}/status`,
    "PATCH",
    { status: "ACTIVE" },
    saToken
  );
  assert(toggleStatusRes.status === 200, "Toggle admin status returns 200 OK");

  // ==============================================================
  // 6. ELECTION MANAGEMENT & LIFECYCLE
  // ==============================================================
  console.log("\n--- 6. Election Management Module ---");
  const startDate = new Date(Date.now() + 1000).toISOString();
  const endDate = new Date(Date.now() + 86400000).toISOString();
  const createElecRes = await req(
    "/elections",
    "POST",
    {
      title: "Faculty Council Representative 2026",
      description: "College voting election cycle for Faculty Council.",
      startDate,
      endDate,
    },
    saToken
  );
  assert(createElecRes.status === 201, "Create election returns 201 Created");
  const newElectionId = createElecRes.data.electionId;

  // Add Position
  const addPosRes = await req(
    "/positions",
    "POST",
    { electionId: newElectionId, name: "Council Chairperson", description: "Leads meetings" },
    saToken
  );
  assert(addPosRes.status === 201, "Create position returns 201 Created");

  // Election Status Transitions
  const toActiveRes = await req(`/elections/${newElectionId}/status`, "PATCH", { status: "ACTIVE" }, saToken);
  assert(toActiveRes.status === 200, "Transition DRAFT -> ACTIVE returns 200 OK");

  const toClosedRes = await req(`/elections/${newElectionId}/status`, "PATCH", { status: "CLOSED" }, saToken);
  assert(toClosedRes.status === 200, "Transition ACTIVE -> CLOSED returns 200 OK");

  const toPublishedRes = await req(`/elections/${newElectionId}/status`, "PATCH", { status: "RESULT_PUBLISHED" }, saToken);
  assert(toPublishedRes.status === 200, "Transition CLOSED -> RESULT_PUBLISHED returns 200 OK");

  // ==============================================================
  // 7. RESULTS MODULE
  // ==============================================================
  console.log("\n--- 7. Super Admin Results Module ---");
  const resultsRes = await req(`/results/${newElectionId}`, "GET", null, saToken);
  assert(resultsRes.status === 200, "Get election results returns 200 OK");
  assert(resultsRes.data.results?.length > 0, "Position results array returned with candidate tallies");

  // ==============================================================
  // 8. PROFILE & CHANGE PASSWORD
  // ==============================================================
  console.log("\n--- 8. Super Admin Profile & Password Change ---");
  const saProfileRes = await req("/admins/profile", "GET", null, saToken);
  assert(saProfileRes.status === 200, "Super Admin profile retrieved successfully");
  assert(saProfileRes.data.admin?.role === "SUPER_ADMIN", "Super Admin profile role confirmed");

  // Test Password Change
  const changePwRes = await req(
    "/auth/change-password",
    "POST",
    { currentPassword: "Admin@123", newPassword: "Admin@123Updated" },
    saToken
  );
  assert(changePwRes.status === 200, "Super Admin password change succeeds with 200 OK");

  // Verify login with new password
  const newLoginRes = await req("/auth/login", "POST", {
    email: "superadmin@college.com",
    password: "Admin@123Updated",
  });
  assert(newLoginRes.status === 200, "Login with updated password succeeds");

  // Revert password back to Admin@123
  await req(
    "/auth/change-password",
    "POST",
    { currentPassword: "Admin@123Updated", newPassword: "Admin@123" },
    newLoginRes.data.token
  );
  console.log("    ✓ Restored Super Admin default password");

  // ==============================================================
  // 9. ADMIN MODULE REGRESSION TEST
  // ==============================================================
  console.log("\n--- 9. Admin Module Regression Testing ---");

  // A. Test Existing Admin (admin@gmail.com)
  const existingAdminLogin = await req("/auth/login", "POST", {
    email: "admin@gmail.com",
    password: "Admin@123",
  });
  assert(existingAdminLogin.status === 200, "Existing Admin login succeeds");
  const existingAdminToken = existingAdminLogin.data.token;

  // Existing Admin Profile
  const existingAdminProf = await req("/admins/profile", "GET", null, existingAdminToken);
  assert(existingAdminProf.status === 200, "Existing Admin profile retrieved successfully");
  assert(existingAdminProf.data.admin?.role === "ADMIN", "Existing Admin role is ADMIN");

  // Existing Admin Student Roster
  const existingAdminStudents = await req("/students", "GET", null, existingAdminToken);
  assert(existingAdminStudents.status === 200, "Existing Admin accesses student roster");

  // B. Test First-Time Admin Temporary Password Lifecycle
  const tempLoginAttempt = await req("/auth/login", "POST", {
    email: adminEmail,
    password: tempPassword,
  });
  assert(tempLoginAttempt.status === 200, "First-time temporary login succeeds");
  assert(tempLoginAttempt.data.requiresPasswordChange === true, "requiresPasswordChange flag is true on first temporary login");

  // Set Permanent Password
  const resetRes = await req("/auth/reset-password", "POST", {
    userId: newUserId,
    newPassword: "AdminPassword@123",
  });
  assert(resetRes.status === 200, "Permanent password set via reset-password");

  // Login with new permanent password
  const newAdminLogin = await req("/auth/login", "POST", {
    email: adminEmail,
    password: "AdminPassword@123",
  });
  assert(newAdminLogin.status === 200, "Admin login with permanent password succeeds");
  const newAdminToken = newAdminLogin.data.token;

  // Verify Admin Profile with Scope
  const newAdminProf = await req("/admins/profile", "GET", null, newAdminToken);
  assert(newAdminProf.status === 200, "New Admin profile retrieved successfully");
  assert(newAdminProf.data.admin?.department_id === newDeptId, "New Admin retains assigned department scope");

  // Admin Student Management (Create Student in assigned scope)
  const studentIdCode = "STU" + Math.floor(Math.random() * 10000);
  const createStudentRes = await req(
    "/students",
    "POST",
    {
      studentId: studentIdCode,
      fullName: "Student Alpha",
      email: `${studentIdCode.toLowerCase()}@college.edu`,
      departmentId: newDeptId,
      yearId: newYearId,
      sectionId: newSecId,
    },
    newAdminToken
  );
  assert(createStudentRes.status === 201, "Admin creates Student in assigned class with 201 Created");

  // Admin CANNOT access Super Admin only endpoints (Security check)
  const adminDenied1 = await req("/departments", "POST", { name: "Illegal Dept", code: "ILL" }, newAdminToken);
  assert(adminDenied1.status === 403, "Admin forbidden from POST /departments (403 Forbidden)");

  const adminDenied2 = await req("/admins", "POST", { name: "Illegal Admin", email: "ill@col.com" }, newAdminToken);
  assert(adminDenied2.status === 403, "Admin forbidden from POST /admins (403 Forbidden)");

  // Clean up created resources
  await req(`/elections/${newElectionId}`, "DELETE", null, saToken);
  await req(`/admins/${newAdminId}`, "DELETE", null, saToken);
  await req(`/sections/${newSecId}`, "DELETE", null, saToken);
  await req(`/years/${newYearId}`, "DELETE", null, saToken);
  await req(`/departments/${newDeptId}`, "DELETE", null, saToken);

  console.log("\n===============================================================");
  console.log(`🎉 ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! (${testPassed} PASSED, ${testFailed} FAILED)`);
  console.log("===============================================================\n");
  process.exit(0);
}

verifyFullSystem().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
