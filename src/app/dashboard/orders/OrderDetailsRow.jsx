"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrderDetails } from "@/app/lib/actions/orders";

export default function OrderDetailsRow({ order }) {
  // We use useQuery to fetch the detailed items for this specific order
  // This will be automatically refetched when the 'orders' query is invalidated
  const { data: details, isLoading } = useQuery({
    queryKey: ["orderDetails", order.id],
    queryFn: () => getOrderDetails(order.id), // Action to fetch just items for one order
    initialData: order, // Use initial data to prevent flicker
  });

  if (isLoading)
    return (
      <tr>
        <td colSpan="8">Chargement des détails...</td>
      </tr>
    );

  const items = Array.isArray(details.order_items)
    ? details.order_items
    : [details.order_items];

  return (
    <tr>
      <td colSpan="8" className="p-0">
        <div className="p-4 bg-gray-50">
          <h4 className="text-sm font-bold text-gray-800 mb-2">
            Détails des produits :
          </h4>
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center text-sm hover:bg-gray-100"
              >
                <span className="text-gray-600">
                  {item.quantity} x {item.products?.name || "Produit inconnu"}
                </span>
                <span className="font-medium text-gray-800 hover:bg-slate-100">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "TND",
                  }).format(item.products?.selling_price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          {order.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                Note de la commande :
              </h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
