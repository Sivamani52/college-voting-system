import { LogOut, Vote, ShieldCheck, GraduationCap, UserCheck } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function Navbar({ subtitle = "Portal" }) {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          label: "Super Admin",
          icon: ShieldCheck,
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "ADMIN":
        return {
          label: "Admin",
          icon: UserCheck,
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "STUDENT":
        return {
          label: "Student",
          icon: GraduationCap,
          className: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      default:
        return {
          label: role || "User",
          icon: ShieldCheck,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-xl shadow-xs shrink-0">
            <Vote size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight leading-tight truncate">
              College Voting
            </h1>
            <p className="text-[11px] sm:text-xs text-blue-600 font-semibold truncate flex items-center gap-1">
              <span>{subtitle}</span>
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {user && (
            <div className="flex items-center gap-2.5 sm:gap-3 bg-gray-50 border border-gray-200/80 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs">
                {(user.name || user.email || "U").charAt(0)}
              </div>
              <div className="hidden sm:block text-left max-w-[160px] md:max-w-[220px]">
                <p className="font-semibold text-xs text-gray-900 leading-tight truncate">
                  {user.name || user.email}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <RoleIcon size={10} className="text-blue-600" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 active:scale-98 rounded-xl border border-red-100 transition shadow-2xs cursor-pointer"
            title="Sign out of your account"
            aria-label="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
