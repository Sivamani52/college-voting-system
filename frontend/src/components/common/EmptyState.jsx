export default function EmptyState({
  icon,
  title = "No data available",
  message = "There are no items to display at this time.",
  action,
  className = "",
}) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-xs ${className}`}
    >
      {icon && (
        <div className="mx-auto w-fit p-4 rounded-full bg-gray-100 text-gray-500 mb-4">
          {icon}
        </div>
      )}
      <h4 className="font-bold text-gray-900 text-base">{title}</h4>
      <p className="mt-1.5 text-sm text-gray-500 max-w-sm mx-auto">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
