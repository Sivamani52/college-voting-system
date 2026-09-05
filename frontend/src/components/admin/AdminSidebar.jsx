import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Vote,
  User,
  LogOut,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function AdminSidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();

  const navSections = [
    {
      title: "ADMIN PANEL",
      items: [
        {
          name: "Dashboard",
          to: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Students",
          to: "/admin/students",
          icon: Users,
        },
      ],
    },
    {
      title: "ELECTION MANAGEMENT",
      items: [
        {
          name: "Elections",
          to: "/admin/elections",
          icon: Vote,
        },
      ],
    },
    {
      title: "ACCOUNT & SECURITY",
      items: [
        {
          name: "Profile & Settings",
          to: "/admin/profile",
          icon: User,
        },
      ],
    },
  ];

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200/80 shadow-2xs">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-xl shadow-xs">
            <Vote size={22} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 leading-tight tracking-tight">
              College Voting
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck size={12} className="text-blue-600" />
              <span className="text-[10px] text-blue-700 font-bold tracking-wider uppercase">
                Admin Console
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
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-99"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            size={18}
                            className={`shrink-0 ${
                              isActive
                                ? "text-white"
                                : "text-gray-400 group-hover:text-blue-600 transition-colors"
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight
                          size={14}
                          className={`transition-transform opacity-60 ${
                            isActive
                              ? "opacity-100 translate-x-0.5"
                              : "group-hover:translate-x-0.5"
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin User Info & Logout Section */}
      <div className="p-3.5 border-t border-gray-100 bg-slate-50/75 space-y-2.5">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1.5 bg-white border border-gray-200/70 rounded-xl p-2 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 uppercase border border-blue-200 shadow-2xs">
              {(user.name || user.email || "A").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                {user.name || user.email || "Administrator"}
              </p>
              <p className="text-[10px] text-blue-600 truncate font-semibold uppercase tracking-wider">
                {user.role || "ADMIN"}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 active:scale-98 rounded-xl border border-red-100 transition-all cursor-pointer shadow-2xs"
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
