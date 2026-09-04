import AdminLayout from "../../components/admin/AdminLayout";

export default function ElectionManagement() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Election Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Oversee department elections, candidate nominations, positions, and polling schedules.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-8 sm:p-12 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <h2 className="text-base font-semibold text-gray-800">
              Election Overview
            </h2>
            <p className="text-sm text-gray-500">
              Election configuration, candidate listings, and position management will be accessible here.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
