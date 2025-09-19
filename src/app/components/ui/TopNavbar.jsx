"use client";
import ProfileDropdown from "@/app/components/ui/ProfileDropdown";
import NotificationsPanel from "./NotificationsPanel";

export default function TopNavbar({ onMenuToggle, user, onConfirmLogout }) {
  return (
    <header className="sticky top-0 bg-white shadow-sm z-30">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        {/* Hamburger Menu Button - visible on all screen sizes */}
        <button
          onClick={onMenuToggle}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex-1 flex justify-end items-center gap-x-4">
          <NotificationsPanel />

          {/* Vertical separator */}
          <div className="h-6 w-px bg-gray-200" />

          <ProfileDropdown user={user} onConfirmLogout={onConfirmLogout} />
        </div>
      </div>
    </header>
  );
}
