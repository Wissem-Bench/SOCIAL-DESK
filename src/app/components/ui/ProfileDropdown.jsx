"use client";

import { Fragment } from "react";
import {
  ChevronDownIcon,
  UserCircleIcon,
  Cog8ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

export default function ProfileDropdown({ user, onConfirmLogout }) {
  if (!user) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="group inline-flex w-full justify-center items-center gap-x-2 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <span className="sr-only">Ouvrir le menu utilisateur</span>
            {/* Avatar Placeholder */}
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {user.full_name?.charAt(0).toUpperCase() || "S"}
            </div>
            <div className="hidden md:block text-left">
              <p className="truncate font-semibold">
                {user?.full_name || "Utilisateur"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || ""}
              </p>
            </div>
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400 group-hover:text-gray-600"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } group flex items-center px-4 py-2 text-sm`}
                  >
                    <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Gérer le compte
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } group flex items-center px-4 py-2 text-sm`}
                  >
                    <Cog8ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Intégrations
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onConfirmLogout}
                    className={`${
                      active ? "bg-red-50 text-red-900" : "text-gray-700"
                    } group flex w-full items-center px-4 py-2 text-sm`}
                  >
                    <ArrowRightStartOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
                    Se déconnecter
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}
