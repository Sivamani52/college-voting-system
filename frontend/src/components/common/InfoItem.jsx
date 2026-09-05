export default function InfoItem({
  label,
  value,
  icon,
  className = "",
}) {
  return (
    <div
      className={`bg-slate-50/80 border border-gray-200/70 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-start gap-3 transition-colors ${className}`}
    >
      {icon && (
        <div className="p-2 rounded-xl bg-white border border-gray-200/80 text-blue-600 shrink-0 shadow-2xs">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="font-bold text-gray-900 text-xs sm:text-sm break-words mt-0.5">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}
