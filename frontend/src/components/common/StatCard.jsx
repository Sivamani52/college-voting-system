export default function StatCard({ title, value, icon, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-xs p-5 hover:shadow-sm transition ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1.5">
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
