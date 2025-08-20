"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adjustStockQuantity } from "@/app/lib/actions/products";
import SubmitButton from "@/app/components/ui/SubmitButton";

export default function StockAdjustmentModal({ product, onClose }) {
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { mutate: adjustStockMutation, isPending } = useMutation({
    mutationFn: adjustStockQuantity,
    onSuccess: () => {
      // 2. --- On success, invalidate both the main product list and this product's specific history ---
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: ["stockMovements", product.id],
      });
      onClose(); // Close modal
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleFormAction = (formData) => {
    // We add a default reason if the user leaves it blank
    if (!formData.get("reason")) {
      formData.set("reason", "Correction inventaire");
    }
    adjustStockMutation(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold">
          Ajuster le stock pour "{product.name}"
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Stock actuel : {product.stock_quantity}
        </p>

        <form action={handleFormAction}>
          <input type="hidden" name="productId" value={product.id} />
          <div className="space-y-4">
            <div>
              <label
                htmlFor="newQuantity"
                className="block text-sm font-medium text-gray-700"
              >
                Nouvelle quantité totale
              </label>
              <input
                id="newQuantity"
                name="newQuantity"
                type="number"
                defaultValue={product.stock_quantity}
                min="0"
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700"
              >
                Raison de l'ajustement
              </label>
              <input
                id="reason"
                name="reason"
                type="text"
                placeholder="'Correction inventaire' par défaut"
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
            <SubmitButton
              pendingText="Ajustement..."
              isPending={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Confirmer l'ajustement
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
