import { Vote, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  className = "",
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-3.5 sm:px-6 py-10 sm:py-16 relative overflow-hidden">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div
        className={`relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-9 border border-white/20 transition-all ${className}`}
      >
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center mb-3.5 shadow-lg shadow-blue-500/25 ring-4 ring-blue-50">
            <Vote size={26} className="sm:w-7 sm:h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider mb-2">
            <ShieldCheck size={12} />
            <span>Official Election Portal</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {title || "College Voting"}
          </h1>
          {subtitle && (
            <p className="text-gray-500 mt-1.5 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content Body (Forms) */}
        <div className="space-y-4">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-6 pt-5 border-t border-gray-100 text-center">{footer}</div>}
      </div>

      {/* Institutional Subtitle */}
      <p className="mt-6 text-[11px] font-medium text-slate-400 text-center max-w-xs leading-relaxed">
        Protected with role-based authentication and end-to-end ballot verification.
      </p>
    </div>
  );
}
