import { useState, useEffect } from "react";
import { getCustomerOrders } from "@/app/lib/actions/customers";
import OrderStatusBadge from "@/app/dashboard/OrderStatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function CustomerOrdersHistoryRow({ customerId }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch order history only when the row is expanded
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getCustomerOrders(customerId);
      if (result.error) {
        setError(result.error);
      } else {
        setOrders(result?.customer?.orders);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, [customerId]);

  const renderContent = () => {
    if (isLoading)
      return (
        <p className="text-sm text-gray-500 italic">
          Chargement de l'historique...
        </p>
      );
    if (error) return <p className="text-sm text-red-500">{error}</p>;
    if (orders.length === 0)
      return (
        <p className="text-sm text-gray-500 italic">
          Ce client n'a aucune commande.
        </p>
      );

    return (
      <ul className="space-y-2">
        {orders.map((order) => (
          <li
            key={order.id}
            className="flex justify-between items-center text-sm p-2 bg-white rounded-md hover:bg-gray-100"
          >
            <span>
              Commande{" "}
              <span className="font-bold text-blue-600">
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
