"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// I'm using heroicons here for demonstration purposes.
// You can replace these with your own SVG components.
import {
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Tableau de Bord", href: "/dashboard", icon: HomeIcon },
  {
    name: "Messagerie",
    href: "/dashboard/inbox",
    icon: ChatBubbleBottomCenterTextIcon,
  },
  {
    name: "Commandes",
    href: "/dashboard/orders",
    icon: ClipboardDocumentListIcon,
  },
  { name: "Produits", href: "/dashboard/products", icon: ShoppingBagIcon },
  { name: "Clients", href: "/dashboard/customers", icon: UsersIcon },
];

export default function Sidebar({ isExpanded, onLinkClick }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white text-gray-800 transition-all duration-300 ease-in-out z-40 border-r border-gray-200 ${
        isExpanded ? "w-64" : "w-20"
      }`}
      aria-label="Sidebar"
    >
      {/* Logo and App Name */}
      <div className="flex items-center h-16 px-4">
        {/* Simple Logo Icon - always visible */}
        <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <span
          className={`ml-3 text-xl font-bold text-gray-800 transition-opacity duration-200 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          Social Desk
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="pt-6 px-2 border-t border-gray-200">
        <ul>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name} className="mb-1">
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={`relative flex items-center min-w-0 rounded-lg transition-colors duration-200 ${
                    isExpanded ? "px-4 py-3" : "justify-center py-3"
                  } ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {/* Active state indicator bar */}
                  <span
                    className={`absolute inset-y-0 left-0 w-1 bg-indigo-600 rounded-r-full transition-opacity duration-200 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  ></span>

                  <item.icon className="h-6 w-6 flex-shrink-0" />
                  <span
                    className={`transition-all duration-200 overflow-hidden whitespace-nowrap
                      ${
                        isExpanded
                          ? "ml-3 w-auto opacity-100"
                          : "ml-0 w-0 opacity-0"
                      }
                    `}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
