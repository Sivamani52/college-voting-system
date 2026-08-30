import { useAuth } from "../../context/useAuth";
import Navbar from "../../components/common/Navbar";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar subtitle="Department Admin Portal" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Department Admin Dashboard
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Logged in as: <span className="font-semibold text-gray-700">{user?.email}</span> (ADMIN)
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Welcome, Department Administrator
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Manage student registrations, eligible voter rosters, and monitor active voting sessions in your assigned department.
          </p>
        </div>
      </main>
    </div>
  );
}