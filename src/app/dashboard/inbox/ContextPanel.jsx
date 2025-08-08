"use client";

import OrderStatusBadge from "../orders/OrderStatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ContextPanel({ customerDetails, isLoading }) {
  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Chargement...</div>;
  }

  if (!customerDetails) {
    return (
      <div className="p-6 text-center text-gray-500">
        Aucun client sélectionné.
      </div>
    );
  }

  const totalSpent = customerDetails.orders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );

  return (
    <div className="p-6 bg-gray-50 h-full overflow-y-auto">
      <h3 className="font-bold text-lg">{customerDetails.full_name}</h3>
      <p className="text-sm text-gray-600">
        Client via {customerDetails.platform}
      </p>

      <div className="mt-6 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total dépensé</p>
          <p className="text-2xl font-semibold">{totalSpent.toFixed(2)} TND</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Commandes totales</p>
          <p className="text-2xl font-semibold">
            {customerDetails.orders.length}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="font-semibold mb-2">Historique des commandes</h4>
        <div className="space-y-3">
          {customerDetails.orders.length > 0 ? (
            customerDetails.orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-3 rounded-lg shadow-sm text-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600">
                    #{order.order_number}
                  </span>
                  <span className="font-semibold">
                    {order.total_amount.toFixed(2)} TND
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {format(new Date(order.order_date), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">
              Aucune commande pour ce client.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
