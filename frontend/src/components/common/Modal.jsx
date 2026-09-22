import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  confirmDisabled = false,
  confirmVariant = "primary",
  maxWidth = "max-w-lg",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const btnVariants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-xs shadow-blue-500/20",
    danger:
      "bg-red-600 hover:bg-red-700 active:scale-98 text-white shadow-xs shadow-red-500/20",
    success:
      "bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-xs shadow-emerald-500/20",
    purple:
      "bg-purple-600 hover:bg-purple-700 active:scale-98 text-white shadow-xs shadow-purple-500/20",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in fade-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto text-sm text-gray-700 space-y-4">
          {children}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-98 transition cursor-pointer shadow-2xs"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                btnVariants[confirmVariant] || btnVariants.primary
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
