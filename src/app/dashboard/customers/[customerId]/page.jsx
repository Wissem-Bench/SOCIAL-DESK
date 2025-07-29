import { getCustomerDetails } from "@/app/lib/actions/customers";
import Link from "next/link";
import OrderStatusBadge from "@/app/dashboard/orders/OrderStatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function CustomerDetailPage({ params }) {
  const { customerId } = params;
  const { customer, error } = await getCustomerDetails(customerId);

  if (error || !customer) {
    return <p className="p-8 text-red-500">{error || "Client introuvable."}</p>;
  }

  // Orders are sorted from most recent to oldest.
  const sortedOrders = customer.orders.sort(
    (a, b) => new Date(b.order_date) - new Date(a.order_date)
  );

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link
          href="/dashboard/customers"
          className="text-blue-500 hover:underline"
        >
          &larr; Retour à la liste des clients
        </Link>
      </div>

      {/* Customer Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h1 className="text-3xl font-bold">{customer.full_name}</h1>
        <p className="text-gray-600 mt-2">
          Téléphone : {customer.phone_number || "N/A"}
        </p>
        <p className="text-gray-600">Adresse : {customer.address || "N/A"}</p>
        <p className="text-gray-500 text-sm mt-1">
          Client via {customer.platform}
        </p>
      </div>

      {/* orders history */}
      <h2 className="text-2xl font-bold mb-4">Historique des Commandes</h2>
      <div className="space-y-4">
        {sortedOrders && sortedOrders.length > 0 ? (
          sortedOrders.map((order) => {
            const items = Array.isArray(order.order_items)
              ? order.order_items
              : [order.order_items];
            return (
              <div key={order.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-blue-600">
                      <Link
                        href="/dashboard/orders"
                        className="hover:underline"
                      >
                        Commande #{order.id.substring(0, 8)}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.order_date), "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                    <div className="mt-2">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {order.total_amount} TND
                    </p>
                  </div>
                </div>
                <div className="mt-3 border-t pt-3">
                  <ul className="text-sm list-disc list-inside">
                    {items.map((item, index) => (
                      <li key={index}>
                        {item.quantity} x {item.products?.name || "Produit"}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })
        ) : (
          <p className="p-4 text-gray-500 bg-white rounded-lg shadow">
            Ce client n'a aucune commande.
          </p>
        )}
      </div>
    </div>
  );
}
