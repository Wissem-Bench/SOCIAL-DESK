"use client";
import LogoutButton from "@/app/dashboard/LogoutButton";

export default function TopNavbar({ onMenuToggle }) {
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

        {/* We can add other elements here later, like a user profile dropdown */}
        <div className="flex-1 flex justify-end">
          {/* Placeholder for future items */}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
