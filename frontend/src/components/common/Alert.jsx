import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export default function Alert({
  type = "info",
  message,
  onDismiss,
  className = "",
}) {
  if (!message) return null;

  const styles = {
    success: {
      container: "bg-emerald-50/90 border-emerald-200 text-emerald-900",
      icon: <CheckCircle2 className="shrink-0 text-emerald-600" size={18} />,
    },
    error: {
      container: "bg-red-50/90 border-red-200 text-red-900",
      icon: <AlertCircle className="shrink-0 text-red-600" size={18} />,
    },
    warning: {
      container: "bg-amber-50/90 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="shrink-0 text-amber-600" size={18} />,
    },
    info: {
      container: "bg-blue-50/90 border-blue-200 text-blue-900",
      icon: <Info className="shrink-0 text-blue-600" size={18} />,
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm font-semibold shadow-2xs ${current.container} ${className}`}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{current.icon}</span>
      <div className="flex-1 leading-relaxed min-w-0 break-words">{message}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss alert"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
