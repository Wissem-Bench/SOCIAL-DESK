"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function ActivityFeed({ activities }) {
  const getTypeClass = (type) => {
    switch (type) {
      case "NOUVELLE COMMANDE":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, index) => (
          <li key={index}>
            <div className="relative pb-8">
              {index !== activities.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getTypeClass(
                      activity.type
                    )}`}
                  >
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h13.5A2.25 2.25 0 0019 13.75v-7.5A2.25 2.25 0 0016.75 4H3.25zM2 9.5h16v4.25a.75.75 0 01-.75.75H2.75a.75.75 0 01-.75-.75V9.5z" />
                    </svg>
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-800">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.subtitle}</p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={activity.timestamp}>
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
