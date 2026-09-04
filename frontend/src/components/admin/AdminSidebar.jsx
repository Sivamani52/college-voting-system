import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Vote,
  User,
  LogOut,
  X,
  ShieldCheck,
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
      title: "ACCOUNT",
      items: [
        {
          name: "Profile",
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
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
            <Vote size={22} />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              College Voting
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={12} className="text-blue-600" />
              <span className="text-xs text-blue-600 font-semibold tracking-wide uppercase">
                Admin Portal
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
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <p className="px-3 text-[11px] font-bold text-gray-400 tracking-wider uppercase">
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
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs font-semibold"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`
                    }
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin User Info & Logout Section */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0 uppercase border border-blue-200">
              {(user.name || user.email || "A").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name || user.email || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate font-medium">
                {user.role || "ADMIN"}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
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
