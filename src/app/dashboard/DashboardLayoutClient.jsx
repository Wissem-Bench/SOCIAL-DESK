"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../components/ui/Sidebar";
import TopNavbar from "../components/ui/TopNavbar";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import { createClient } from "@/app/lib/supabase/client";

export default function DashboardLayoutClient({ children, user }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [logoutConfirmation, setLogoutConfirmation] = useState({
    isOpen: false,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = () => {
    setLogoutConfirmation({
      isOpen: true,
      title: "Se déconnecter ?",
      message: "Voulez-vous vraiment vous déconnecter ?",
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    // No need to set isLoggingOut back to false, as we are navigating away
  };

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
    <>
      <div className="min-h-screen h-screen bg-gray-50 overflow-x-hidden">
        <div
          onMouseEnter={() => {
            if (!isMobile) setIsSidebarExpanded(true);
          }}
          onMouseLeave={() => {
            if (!isMobile) setIsSidebarExpanded(false);
          }}
          className={logoutConfirmation.isOpen ? "pointer-events-none" : ""}
        >
          <Sidebar
            isExpanded={isSidebarExpanded}
            onLinkClick={() => {
              if (isMobile) setIsSidebarExpanded(false);
            }}
            // userEmail={user.email}
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
          className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col`}
          style={{ paddingLeft: isSidebarExpanded ? "16rem" : "5rem" }}
        >
          <TopNavbar
            user={user}
            className="flex-shrink-0"
            onMenuToggle={handleMenuToggle}
            onConfirmLogout={handleConfirmLogout}
          />
          <main className="flex-1 p-4 md:p-6 overflow-hidden">{children}</main>
        </div>
      </div>
      <ConfirmationModal
        isOpen={logoutConfirmation.isOpen}
        title={logoutConfirmation.title}
        message={logoutConfirmation.message}
        onConfirm={handleLogout}
        onClose={() => setLogoutConfirmation({ isOpen: false })}
        isPending={isLoggingOut}
      />
    </>
  );
}
