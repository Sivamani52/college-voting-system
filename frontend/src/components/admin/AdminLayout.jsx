import { useState } from "react";
import { Menu, Vote, ShieldCheck } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/70 flex">
      {/* Admin Sidebar (desktop fixed and mobile drawer) */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1 min-w-0">
        {/* Mobile Header (Sticky) */}
        <header className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-xl shadow-2xs shrink-0">
              <Vote size={18} />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-gray-900 text-sm tracking-tight block truncate">
                College Voting
              </span>
              <div className="flex items-center gap-1">
                <ShieldCheck size={11} className="text-blue-600 shrink-0" />
                <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider truncate">
                  Admin Portal
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Open sidebar navigation"
          >
            <Menu size={22} />
          </button>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
