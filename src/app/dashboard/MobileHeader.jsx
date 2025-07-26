"use client";

export default function MobileHeader({ onMenuClick }) {
  return (
    <header className="md:hidden bg-gray-800 text-white p-4 flex items-center">
      <button onClick={onMenuClick} aria-label="Ouvrir le menu">
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
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
      <h1 className="text-xl font-bold ml-4">Dashboard</h1>
    </header>
  );
}
