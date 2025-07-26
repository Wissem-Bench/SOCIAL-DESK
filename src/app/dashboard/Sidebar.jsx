"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// You can find free SVG icons from libraries like heroicons.com
const navigation = [
  {
    name: "Tableau de Bord",
    href: "/dashboard",
    icon: (props) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: "Messagerie",
    href: "/dashboard/inbox",
    icon: (props) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    name: "Commandes",
    href: "/dashboard/orders",
    icon: (props) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    name: "Produits",
    href: "/dashboard/products",
    icon: (props) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
  {
    name: "Clients",
    href: "/dashboard/customers",
    icon: (props) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197"
        />
      </svg>
    ),
  },
];

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();

  return (
    <nav
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out z-40 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Sidebar"
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold">Votre App</h1>
      </div>
      <ul className="mt-6">
        {navigation.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white ${
                pathname === item.href ? "bg-gray-900 text-white" : ""
              }`}
            >
              <item.icon className="h-6 w-6 mr-3" />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
