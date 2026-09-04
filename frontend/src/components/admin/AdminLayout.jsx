import { useState } from "react";
import { Menu, Vote, ShieldCheck } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar (handles both desktop fixed and mobile drawer) */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1 min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 text-white rounded-lg">
              <Vote size={18} />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">College Voting</span>
              <div className="flex items-center gap-1">
                <ShieldCheck size={10} className="text-blue-600" />
                <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar navigation"
          >
            <Menu size={22} />
          </button>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
