export default function EmptyState({
  icon,
  title = "No data available",
  message = "There are no items to display at this time.",
  action,
  className = "",
}) {
  return (
    <div
      className={`bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-2xs ${className}`}
    >
      {icon && (
        <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center mb-4 border border-blue-100/60 shadow-2xs">
          {icon}
        </div>
      )}
      <h4 className="font-extrabold text-gray-900 text-base sm:text-lg tracking-tight">
        {title}
      </h4>
      <p className="mt-1.5 text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
        {message}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
