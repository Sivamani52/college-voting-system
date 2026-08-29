import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar subtitle="Super Admin Console" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Super Admin Dashboard
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Logged in as: <span className="font-semibold text-gray-700">{user?.email}</span> (SUPER_ADMIN)
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Welcome to the College Voting System
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            You have full administrative privileges to manage departments, elections, candidates, admins, and students.
          </p>
        </div>
      </main>
    </div>
  );
}