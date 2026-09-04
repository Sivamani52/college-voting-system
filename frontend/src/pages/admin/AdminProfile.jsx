import AdminLayout from "../../components/admin/AdminLayout";
import { useAuth } from "../../context/useAuth";

export default function AdminProfile() {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Admin Profile
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View your administrator account details and department assignments.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8">
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xl shrink-0 uppercase border border-blue-200">
                {(user?.name || user?.email || "A").charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {user?.name || user?.email || "Administrator"}
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  {user?.role || "ADMIN"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Email Address
                </span>
                <span className="text-sm font-medium text-gray-800 break-all">
                  {user?.email || "Not specified"}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Account Role
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {user?.role || "ADMIN"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
