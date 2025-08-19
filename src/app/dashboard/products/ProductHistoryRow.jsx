"use client";

import { useQuery } from "@tanstack/react-query";
import { getStockMovements } from "@/app/lib/actions/products";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ProductHistoryRow({ product }) {
  const {
    data: movements = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["stockMovements", product.id],
    queryFn: () => getStockMovements(product.id).then((res) => res.movements),
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <p className="text-sm text-gray-500 italic">
          Chargement de l'historique...
        </p>
      );
    }
    if (isError) {
      return <p className="text-sm text-red-500">{error.message}</p>;
    }
    if (movements.length === 0) {
      return (
        <p className="text-sm text-gray-500 italic">
          Aucun mouvement de stock enregistré pour ce produit.
        </p>
      );
    }
    return (
      <table className="min-w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="py-2 px-3 text-left font-medium text-gray-600">
              Date
            </th>
            <th className="py-2 px-3 text-center font-medium text-gray-600">
              Quantité
            </th>
            <th className="py-2 px-3 text-left font-medium text-gray-600">
              Raison
            </th>
          </tr>
        </thead>
        <tbody>
          {movements.map((move) => (
            <tr key={move.id} className="border-b last:border-b-0">
              <td className="py-2 px-3 text-gray-500">
                {format(new Date(move.created_at), "dd/MM/yyyy HH:mm", {
                  locale: fr,
                })}
              </td>
              <td
                className={`py-2 px-3 text-center font-bold ${
                  move.change_quantity > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {move.change_quantity > 0
                  ? `+${move.change_quantity}`
                  : move.change_quantity}
              </td>
              <td className="py-2 px-3 text-gray-700">{move.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <tr>
      <td colSpan="6" className="p-0">
        <div className="p-4 bg-gray-50/70">
          <h4 className="text-sm font-bold text-gray-800 mb-2">
            Historique des Mouvements de Stock
          </h4>
          {renderContent()}
        </div>
      </td>
    </tr>
  );
}
