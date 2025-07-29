export default function OrderDetailsRow({ order }) {
  const items = Array.isArray(order.order_items)
    ? order.order_items
    : [order.order_items];

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
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600">
                  {item.quantity} x {item.products?.name || "Produit inconnu"}
                </span>
                <span className="font-medium text-gray-800">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "TND",
                  }).format(item.products?.price * item.quantity)}
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
