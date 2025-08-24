// src/app/dashboard/customers/CustomerOrdersHistoryRow.jsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { getCustomerOrders } from "@/app/lib/actions/customers";
import OrderStatusBadge from "@/app/dashboard/OrderStatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function CustomerOrdersHistoryRow({ customerId }) {
  const {
    data: customer,
    isLoading,
    isError,
    error,
  } = useQuery({
    // A unique key for this query, including the customerId
    queryKey: ["customerOrders", customerId],
    queryFn: () => getCustomerOrders(customerId),
    // This query will only run when the component is mounted (i.e., the row is expanded)
    enabled: !!customerId,
  });

  // Extract orders from the customer data object
  const orders = customer?.orders || [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <p className="text-sm text-gray-500 italic">
          Chargement de l'historique...
        </p>
      );
    }
    if (isError) {
      // React Query provides a descriptive error object
      return <p className="text-sm text-red-500">{error.message}</p>;
    }
    if (orders.length === 0) {
      return (
        <p className="text-sm text-gray-500 italic">
          Ce client n'a aucune commande.
        </p>
      );
    }

    return (
      <ul className="space-y-2">
        {orders.map((order) => (
          <li
            key={order.id}
            className="flex justify-between items-center text-sm p-2 bg-white rounded-md hover:bg-gray-100"
          >
            <span>
              Commande{" "}
              <span className="font-bold text-indigo-600">
                #{order.order_number}
              </span>{" "}
              -{" "}
              {format(new Date(order.order_date), "dd MMM yyyy", {
                locale: fr,
              })}
            </span>
            <div className="flex items-center gap-4">
              <span className="font-semibold">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "TND",
                }).format(order.total_amount)}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <tr>
      <td colSpan="5" className="p-0">
        <div className="p-4 bg-gray-50/70">
          <h4 className="text-sm font-bold text-gray-800 mb-2">
            Historique des commandes
          </h4>
          {renderContent()}
        </div>
      </td>
    </tr>
  );
}
