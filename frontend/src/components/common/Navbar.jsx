import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LogOut,
  Vote,
  ShieldCheck,
  GraduationCap,
  UserCheck,
  Menu,
  X,
  LayoutDashboard,
  Award,
  User,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function Navbar({ subtitle = "Portal" }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const isStudentActive = (to) => {
    if (to === "/student/dashboard") {
      return (
        currentPath === "/student" ||
        currentPath === "/student/" ||
        currentPath.startsWith("/student/dashboard")
      );
    }
    return currentPath.startsWith(to.toLowerCase());
  };

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
  const isStudent = user?.role === "STUDENT";

  const studentLinks = [
    { name: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
    { name: "Elections", to: "/student/elections", icon: Award },
    { name: "My Profile", to: "/student/profile", icon: User },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            to={isStudent ? "/student/dashboard" : user?.role === "ADMIN" ? "/admin" : "/super-admin"}
            className="flex items-center gap-2.5 sm:gap-3 group"
          >
            <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
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
          </Link>
        </div>

        {/* Student Nav Links (Desktop) */}
        {isStudent && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-gray-200/60">
            {studentLinks.map((link) => {
              const Icon = link.icon;
              const active = isStudentActive(link.to);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    active
                      ? "bg-white text-blue-700 shadow-2xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <Icon size={14} />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {user && (
            <Link
              to={isStudent ? "/student/profile" : user?.role === "ADMIN" ? "/admin/profile" : "/super-admin/profile"}
              className="flex items-center gap-2.5 sm:gap-3 bg-gray-50 hover:bg-gray-100/80 border border-gray-200/80 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-2xs transition group"
              title="View Profile"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs group-hover:ring-2 group-hover:ring-blue-400 transition">
                {(user.name || user.email || "U").charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 truncate max-w-[130px] leading-tight">
                  {user.name || user.email}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <RoleIcon size={11} className={roleInfo.className.split(" ")[1]} />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            </Link>
          )}

          <button
            type="button"
            onClick={logout}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200/80 rounded-xl transition shadow-2xs cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          {isStudent && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer for Student */}
      {isStudent && mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {studentLinks.map((link) => {
            const Icon = link.icon;
            const active = isStudentActive(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  active
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={16} className="text-blue-600" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}
