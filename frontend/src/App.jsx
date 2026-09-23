import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import { Toaster } from "react-hot-toast";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ChangePassword from "./pages/auth/ChangePassword";

import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminDepartments from "./pages/superadmin/SuperAdminDepartments";
import SuperAdminYearsSections from "./pages/superadmin/SuperAdminYearsSections";
import SuperAdminStudents from "./pages/superadmin/SuperAdminStudents";
import SuperAdminAdmins from "./pages/superadmin/SuperAdminAdmins";
import SuperAdminElections from "./pages/superadmin/SuperAdminElections";
import SuperAdminResults from "./pages/superadmin/SuperAdminResults";
import SuperAdminProfile from "./pages/superadmin/SuperAdminProfile";
import ElectionResults from "./pages/superadmin/ElectionResults";

import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentManagement from "./pages/admin/StudentManagement";
import ElectionManagement from "./pages/admin/ElectionManagement";
import AdminProfile from "./pages/admin/AdminProfile";

import StudentDashboard from "./pages/student/StudentDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

import ElectionDetails from "./pages/student/ElectionDetails";
import ConfirmVote from "./pages/student/ConfirmVote";
import Results from "./pages/student/Results";
import StudentProfile from "./pages/student/StudentProfile";
import StudentElections from "./pages/student/StudentElections";

function Unauthorized() {
  const storedUser = localStorage.getItem("user");
  let dashboardPath = "/login";
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === "ADMIN") dashboardPath = "/admin";
      else if (parsed.role === "SUPER_ADMIN") dashboardPath = "/superadmin";
      else if (parsed.role === "STUDENT") dashboardPath = "/student";
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
          <span className="text-2xl font-black">403</span>
        </div>
        <h1 className="text-xl font-extrabold text-gray-900">
          Access Prohibited
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          You do not have administrative permission to access this restricted route or scope.
        </p>
        <a
          href={dashboardPath}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
        >
          Return to Your Dashboard
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />

        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          <Route
            path="/change-password"
            element={<ChangePassword />}
          />
          <Route
            path="/update-password"
            element={<ChangePassword />}
          />

          {/* Super Admin */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/departments"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminDepartments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/departments"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminDepartments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/years-sections"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminYearsSections />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/years-sections"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminYearsSections />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/students"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminStudents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/students"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminStudents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/admins"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminAdmins />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/admins"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminAdmins />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/elections"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminElections />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/elections"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminElections />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/results"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/results"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/profile"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/profile"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/elections/:electionId/results"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <ElectionResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/elections/:electionId/results"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <ElectionResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/results/:electionId"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <ElectionResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/results/:electionId"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <ElectionResults />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <StudentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students/add"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <StudentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <StudentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <StudentManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/elections"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ElectionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/elections/add"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ElectionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/elections/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ElectionManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/elections/:electionId/results"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <Results />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/results/:electionId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <Results />
              </ProtectedRoute>
            }
          />

          {/* Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/elections"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentElections />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/elections/:id"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <ElectionDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/elections/:electionId/results"
            element={
              <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "SUPER_ADMIN"]}>
                <Results />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/results/:electionId"
            element={
              <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "SUPER_ADMIN"]}>
                <Results />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/confirm-vote"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <ConfirmVote />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/elections/:id/confirm"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <ConfirmVote />
              </ProtectedRoute>
            }
          />

          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          {/* Default */}
          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}