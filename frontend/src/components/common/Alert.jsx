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
      container: "bg-green-50 border-green-200 text-green-800",
      icon: <CheckCircle2 className="shrink-0 text-green-600" size={18} />,
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: <AlertCircle className="shrink-0 text-red-600" size={18} />,
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-800",
      icon: <AlertTriangle className="shrink-0 text-amber-600" size={18} />,
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <Info className="shrink-0 text-blue-600" size={18} />,
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div
      className={`p-4 rounded-xl border flex items-start gap-3 text-sm font-medium ${current.container} ${className}`}
    >
      <span className="mt-0.5">{current.icon}</span>
      <div className="flex-1 leading-relaxed">{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-gray-700 p-0.5 rounded transition"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
