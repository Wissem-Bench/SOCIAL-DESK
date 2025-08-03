"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function DashboardLayoutClient({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const pathname = usePathname();

  // Automatically close sidebar on route change (for mobile)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarExpanded(false);
    }
  }, [pathname]);

  const handleMenuToggle = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        onMouseEnter={() => {
          if (window.innerWidth >= 768) setIsSidebarExpanded(true);
        }}
        onMouseLeave={() => {
          if (window.innerWidth >= 768) setIsSidebarExpanded(false);
        }}
      >
        <Sidebar
          isExpanded={isSidebarExpanded}
          onLinkClick={() => {
            if (window.innerWidth < 768) setIsSidebarExpanded(false);
          }}
        />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarExpanded && window.innerWidth < 768 && (
        <div
          onClick={() => setIsSidebarExpanded(false)}
          className="fixed inset-0 bg-black opacity-50 z-30"
          aria-hidden="true"
        />
      )}

      {/* Main content area with dynamic padding */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "md:pl-64" : "md:pl-20"
        }`}
      >
        <TopNavbar onMenuToggle={handleMenuToggle} />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
