import React from "react";

export default function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className = "",
  color = "blue",
}) {
  const colorMap = {
    purple: "bg-purple-50/80 text-purple-600 border-purple-100/60",
    green: "bg-emerald-50/80 text-emerald-600 border-emerald-100/60",
    indigo: "bg-indigo-50/80 text-indigo-600 border-indigo-100/60",
    red: "bg-red-50/80 text-red-600 border-red-100/60",
    blue: "bg-blue-50/80 text-blue-600 border-blue-100/60",
    amber: "bg-amber-50/80 text-amber-600 border-amber-100/60",
  };

  const badgeColorClass = colorMap[color] || colorMap.blue;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "function" || (typeof icon === "object" && icon.$$typeof)) {
      const IconComponent = icon;
      return <IconComponent size={22} />;
    }
    return icon;
  };

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
          <div className={`p-2.5 sm:p-3 rounded-2xl ${badgeColorClass} shadow-2xs group-hover:scale-105 transition-transform shrink-0`}>
            {renderIcon()}
          </div>
        )}
      </div>
    </div>
  );
}

