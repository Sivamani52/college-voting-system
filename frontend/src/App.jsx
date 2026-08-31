import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ChangePassword from "./pages/auth/ChangePassword";

import SuperAdminDashboard
  from "./pages/superadmin/SuperAdminDashboard";

import AdminDashboard
  from "./pages/admin/AdminDashboard";

import StudentDashboard
  from "./pages/student/StudentDashboard";

import ProtectedRoute
  from "./routes/ProtectedRoute";

import ElectionDetails from "./pages/student/ElectionDetails";


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
              <ProtectedRoute
                allowedRoles={["SUPER_ADMIN"]}
              >
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />


          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN"]}
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute
                allowedRoles={["STUDENT"]}
              >
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/elections/:id"
            element={
              <ProtectedRoute
                allowedRoles={["STUDENT"]}
              >
                <ElectionDetails />
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