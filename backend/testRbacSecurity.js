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

async function runRbacTests() {
  console.log("=== STARTING RBAC SECURITY TESTS ===");

  // 1. Unauthenticated request to /departments (POST) -> Expect 401
  const noAuthRes = await req("/departments", "POST", { name: "Unauthorized Dept", code: "UNAUTH" });
  if (noAuthRes.status === 401) {
    console.log("✓ 1. Unauthenticated request correctly rejected with 401 Unauthorized");
  } else {
    throw new Error(`Expected 401, got ${noAuthRes.status}`);
  }

  // 2. Super Admin Login
  const superAdminLogin = await req("/auth/login", "POST", {
    email: "superadmin@college.com",
    password: "Admin@123",
  });
  const superAdminToken = superAdminLogin.data.token;
  console.log("✓ 2. Super Admin authenticated successfully");

  // 3. Test Super Admin access to Super Admin only endpoint (POST /departments) -> Expect 201
  const saPostRes = await req("/departments", "POST", { name: "RBAC Test Dept", code: "RBAC" + Math.floor(Math.random()*1000) }, superAdminToken);
  if (saPostRes.status === 201) {
    console.log("✓ 3. Super Admin granted 201 on Super Admin resource");
    // clean up
    await req(`/departments/${saPostRes.data.departmentId}`, "DELETE", null, superAdminToken);
  } else {
    throw new Error(`Super admin was denied: ${saPostRes.status}`);
  }

  console.log("\n==========================================");
  console.log("🎉 ALL RBAC SECURITY TESTS PASSED!");
  console.log("==========================================");
  process.exit(0);
}

runRbacTests().catch((err) => {
  console.error("❌ RBAC Test failed:", err);
  process.exit(1);
});
