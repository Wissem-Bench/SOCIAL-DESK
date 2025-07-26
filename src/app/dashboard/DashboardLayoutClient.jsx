"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";

export default function DashboardLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar component */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
