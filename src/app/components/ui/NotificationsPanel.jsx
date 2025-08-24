"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Popover, Transition } from "@headlessui/react";
import { BellIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import {
  getUnreadNotifications,
  markAllNotificationsAsRead,
} from "@/app/lib/actions/notifications";

// Helper function to render specific notification content
const renderNotificationContent = (notification) => {
  switch (notification.type) {
    case "new_order":
      return (
        <p>
          Nouvelle commande{" "}
          <span className="font-bold">
            #{notification.content.order_number}
          </span>{" "}
          reçue de{" "}
          <span className="font-bold">
            {notification.content.customer_name}
          </span>
          .
        </p>
      );
    // Add other cases here for 'new_message', 'low_stock', etc.
    default:
      return <p>Vous avez une nouvelle notification.</p>;
  }
};

export default function NotificationsPanel() {
  const queryClient = useQueryClient();

  // Fetch notifications using useQuery
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getUnreadNotifications(),
    // Optional: refetch every minute
    refetchInterval: 60000,
  });

  // Create a mutation to mark all notifications as read
  const { mutate: markAllAsRead, isPending } = useMutation({
    mutationFn: async () => {
      // We only run the mutation if there are unread notifications
      if (notifications.length > 0) {
        return markAllNotificationsAsRead();
      }
      return Promise.resolve(); // Return a resolved promise if no action is needed
    },
    onSuccess: () => {
      // When the mutation is successful, invalidate the notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications.length;

  return (
    <Popover className="relative">
      <Popover.Button className="relative rounded-full p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 max-w-sm transform px-4 sm:px-0">
          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    disabled={isPending}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                  >
                    Marquer tout comme lu
                  </button>
                )}
              </div>
            </div>
            <div className="relative grid gap-8 bg-white p-4 max-h-96 overflow-y-auto">
              {isLoading ? (
                <p className="text-center text-sm text-gray-500">
                  Chargement...
                </p>
              ) : unreadCount > 0 ? (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={`/dashboard/orders/${notification.related_entity_id}`}
                    className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="ml-4">
                      {renderNotificationContent(notification)}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    Tout est à jour
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vous n'avez aucune nouvelle notification.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
