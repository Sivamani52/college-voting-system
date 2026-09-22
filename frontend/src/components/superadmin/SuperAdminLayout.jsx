import { useState } from "react";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminNavbar from "./SuperAdminNavbar";

export default function SuperAdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/70 flex">
      {/* Super Admin Sidebar (desktop fixed and mobile drawer) */}
      <SuperAdminSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1 min-w-0">
        {/* Super Admin Navbar */}
        <SuperAdminNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Page Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
