import { useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Layers,
  GraduationCap,
  UserCheck,
  Vote,
  Trophy,
  User,
  LogOut,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function SuperAdminSidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const navSections = [
    {
      title: "SUPER ADMIN CORE",
      items: [
        {
          name: "Dashboard",
          to: "/super-admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "ACADEMIC STRUCTURE",
      items: [
        {
          name: "Departments",
          to: "/super-admin/departments",
          icon: Building2,
        },
        {
          name: "Years & Sections",
          to: "/super-admin/years-sections",
          icon: Layers,
        },
        {
          name: "Students",
          to: "/super-admin/students",
          icon: GraduationCap,
        },
      ],
    },
    {
      title: "ADMINISTRATION & ELECTIONS",
      items: [
        {
          name: "Admins",
          to: "/super-admin/admins",
          icon: UserCheck,
        },
        {
          name: "Elections",
          to: "/super-admin/elections",
          icon: Vote,
        },
        {
          name: "Results",
          to: "/super-admin/results",
          icon: Trophy,
        },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        {
          name: "Profile",
          to: "/super-admin/profile",
          icon: User,
        },
      ],
    },
  ];

  const isItemActive = (itemName, itemTo) => {
    switch (itemName) {
      case "Dashboard":
        return (
          currentPath === "/superadmin" ||
          currentPath === "/superadmin/" ||
          currentPath === "/super-admin" ||
          currentPath === "/super-admin/" ||
          currentPath.startsWith("/superadmin/dashboard") ||
          currentPath.startsWith("/super-admin/dashboard")
        );
      case "Departments":
        return (
          currentPath.startsWith("/superadmin/departments") ||
          currentPath.startsWith("/super-admin/departments")
        );
      case "Years & Sections":
        return (
          currentPath.startsWith("/superadmin/years-sections") ||
          currentPath.startsWith("/super-admin/years-sections")
        );
      case "Students":
        return (
          currentPath.startsWith("/superadmin/students") ||
          currentPath.startsWith("/super-admin/students")
        );
      case "Admins":
        return (
          currentPath.startsWith("/superadmin/admins") ||
          currentPath.startsWith("/super-admin/admins")
        );
      case "Elections":
        return (
          (currentPath.startsWith("/superadmin/elections") ||
            currentPath.startsWith("/super-admin/elections")) &&
          !currentPath.includes("/results")
        );
      case "Results":
        return currentPath.includes("/results");
      case "Profile":
        return (
          currentPath.startsWith("/superadmin/profile") ||
          currentPath.startsWith("/super-admin/profile")
        );
      default:
        return currentPath === itemTo.toLowerCase() || currentPath.startsWith(itemTo.toLowerCase());
    }
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 shadow-xl">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-xs">
            <Vote size={22} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white leading-tight tracking-tight">
              College Voting
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck size={12} className="text-purple-400" />
              <span className="text-[10px] text-purple-300 font-bold tracking-wider uppercase">
                Super Admin
              </span>
            </div>
          </div>
        </div>

        {/* Close button for mobile drawer */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.name, item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                      active
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs font-bold"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white active:scale-99"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={`shrink-0 ${
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-purple-400 transition-colors"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight
                      size={14}
                      className={`transition-transform opacity-60 ${
                        active
                          ? "opacity-100 translate-x-0.5"
                          : "group-hover:translate-x-0.5"
                      }`}
                    />
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Super Admin User Info & Logout Section */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 space-y-2.5">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0 uppercase border border-purple-400/30">
              {(user.name || user.email || "S").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {user.name || user.email || "Super Administrator"}
              </p>
              <p className="text-[10px] text-purple-400 truncate font-semibold uppercase tracking-wider">
                {user.role || "SUPER_ADMIN"}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-red-400 bg-red-950/30 hover:bg-red-900/40 hover:text-red-300 active:scale-98 rounded-xl border border-red-900/40 transition-all cursor-pointer shadow-2xs"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
