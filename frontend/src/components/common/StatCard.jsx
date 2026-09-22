export default function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className = "",
}) {
  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-2xs p-4 sm:p-5 hover:shadow-sm hover:border-blue-200/80 transition-all group ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight truncate">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-1 truncate">{description}</p>
          )}
          {trend && (
            <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>{trend}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2.5 sm:p-3 rounded-2xl bg-blue-50/80 text-blue-600 border border-blue-100/60 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
