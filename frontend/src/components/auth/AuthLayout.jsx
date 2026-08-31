import { Vote } from "lucide-react";

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  className = "",
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className={`w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100 ${className}`}>
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-sm">
            <Vote size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {title || "College Voting"}
          </h1>
          {subtitle && (
            <p className="text-gray-500 mt-2 text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {children}

        {footer && <div className="mt-6 text-center">{footer}</div>}
      </div>
    </div>
  );
}
