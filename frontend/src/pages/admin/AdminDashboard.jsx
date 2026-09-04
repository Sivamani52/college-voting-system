import { useAuth } from "../../context/useAuth";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Logged in as: <span className="font-semibold text-gray-700">{user?.email}</span> (ADMIN)
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Welcome, Department Administrator
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Manage student registrations, eligible voter rosters, and monitor active voting sessions in your assigned department.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}