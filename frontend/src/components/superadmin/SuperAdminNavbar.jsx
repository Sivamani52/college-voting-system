import { Menu, Vote, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function SuperAdminNavbar({ onOpenMobileMenu }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      {/* Mobile Brand / Toggle */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Open sidebar navigation"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-2xs shrink-0">
            <Vote size={18} />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-gray-900 text-sm tracking-tight block truncate">
              College Voting System
            </span>
            <div className="flex items-center gap-1">
              <ShieldCheck size={11} className="text-purple-600 shrink-0" />
              <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider truncate">
                Super Admin Console
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Badge */}
      {user && (
        <div className="flex items-center gap-2.5 bg-slate-50 border border-gray-200/80 rounded-xl px-3 py-1.5 shadow-2xs">
          <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs">
            {(user.name || user.email || "S").charAt(0)}
          </div>
          <div className="hidden sm:block text-left max-w-[160px]">
            <p className="font-bold text-xs text-gray-900 truncate leading-tight">
              {user.name || user.email}
            </p>
            <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
              Super Admin
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
