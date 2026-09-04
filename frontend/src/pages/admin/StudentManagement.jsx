import AdminLayout from "../../components/admin/AdminLayout";

export default function StudentManagement() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Student Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage student registrations, verify details, and handle department voter rosters.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-8 sm:p-12 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <h2 className="text-base font-semibold text-gray-800">
              Student Records
            </h2>
            <p className="text-sm text-gray-500">
              Student management features and controls will be configured here.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}