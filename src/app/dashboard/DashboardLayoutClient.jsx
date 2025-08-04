"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function DashboardLayoutClient({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Detects if the screen is mobile (client-side only)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Closes the sidebar on mobile when changing pages
  useEffect(() => {
    if (isMobile) {
      setIsSidebarExpanded(false);
    }
  }, [pathname, isMobile]);

  const handleMenuToggle = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        onMouseEnter={() => {
          if (!isMobile) setIsSidebarExpanded(true);
        }}
        onMouseLeave={() => {
          if (!isMobile) setIsSidebarExpanded(false);
        }}
      >
        <Sidebar
          isExpanded={isSidebarExpanded}
          onLinkClick={() => {
            if (isMobile) setIsSidebarExpanded(false);
          }}
        />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarExpanded && isMobile && (
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
