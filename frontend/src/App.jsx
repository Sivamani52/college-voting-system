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

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">
        403 - Unauthorized
      </h1>
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
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminDashboard />
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
              <ProtectedRoute allowedRoles={["ADMIN"]}>
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
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminProfile />
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