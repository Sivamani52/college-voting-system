import { LogOut, Vote } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function Navbar({ subtitle = "Portal" }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
            <Vote size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              College Voting
            </h1>
            <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:block text-right">
              <p className="font-medium text-sm text-gray-900 leading-tight">
                {user.email}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {user.role}
              </p>
            </div>
          )}

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
