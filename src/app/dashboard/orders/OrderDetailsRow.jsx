"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrderDetails } from "@/app/lib/actions/orders";

export default function OrderDetailsRow({ orderId }) {
  // We use useQuery to fetch the detailed items for this specific order.
  // The query key is unique to this order.
  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orderDetails", orderId],
    queryFn: () => getOrderDetails(orderId),
  });

  const renderNotes = () => {
    const note = details?.notes;
    return (
      note && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-800 mb-1">
            Note de la commande :
          </h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{note}</p>
        </div>
      )
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <p className="text-sm text-gray-500 italic">
          Chargement des détails...
        </p>
      );
    }
    if (isError) {
      return <p className="text-sm text-red-500">{error.message}</p>;
    }

    const items = Array.isArray(details.order_items)
      ? details.order_items
      : [details.order_items];

    if (items.length === 0) {
      return (
        <p className="text-sm text-gray-500 italic">
          Cette commande ne contient aucun produit.
        </p>
      );
    }

    return (
      <ul className="space-y-1 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between items-center">
            <span>
              {item.quantity} x {item.products?.name || "Produit supprimé"}
            </span>
            <span className="font-medium text-gray-700">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "TND",
              }).format(item.selling_price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <tr>
      <td colSpan="8" className="p-0">
        <div className="p-4 bg-gray-50/70">
          <h4 className="text-sm font-bold text-gray-800 mb-2">
            Détails de la commande
          </h4>
          {renderContent()}
          {renderNotes()}
        </div>
      </td>
    </tr>
  );
}
