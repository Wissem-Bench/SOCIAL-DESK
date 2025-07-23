import { getOrdersForUser, updateOrderStatus } from "@/app/lib/actions/orders";
import OrderStatusBadge from "./OrderStatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function OrdersPage() {
  const { orders, error } = await getOrdersForUser();
  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  const statuses = ["nouveau", "confirmé", "avec_livreur", "livré", "annulé"];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Commandes</h1>
      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order) => {
            const items = Array.isArray(order.order_items)
              ? order.order_items
              : [order.order_items];
            return (
              <div key={order.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">
                      Commande pour{" "}
                      {order.customers?.full_name || "Client inconnu"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {order.id.substring(0, 8)} | Date:{" "}
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

                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold">Produits :</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {items.map(
                      (item, index) =>
                        item &&
                        item.products && ( // Added a check for more robustness
                          <li key={index}>
                            {item.quantity} x{" "}
                            {item.products.name || "Produit supprimé"}
                          </li>
                        )
                    )}
                  </ul>
                </div>

                <div className="mt-4 border-t pt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">
                    Changer le statut :
                  </span>
                  {statuses.map(
                    (status) =>
                      order.status !== status && (
                        <form
                          action={updateOrderStatus.bind(
                            null,
                            order.id,
                            status
                          )}
                          key={status}
                        >
                          <button
                            type="submit"
                            className="px-3 py-1 text-xs text-white bg-gray-700 rounded hover:bg-black capitalize"
                          >
                            {status.replace("_", " ")}
                          </button>
                        </form>
                      )
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">Aucune commande pour le moment.</p>
        )}
      </div>
    </div>
  );
}
