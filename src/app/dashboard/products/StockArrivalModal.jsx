"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { recordStockArrival } from "@/app/lib/actions/products";
import { XCircleIcon } from "@heroicons/react/20/solid";
import SubmitButton from "@/app/components/ui/SubmitButton";

export default function StockArrivalModal({ products, onClose }) {
  const queryClient = useQueryClient();
  const [lineItems, setLineItems] = useState([{ product_id: "", quantity: 1 }]);
  const [error, setError] = useState("");

  // --- Setup the mutation with React Query ---
  const { mutate: recordArrivalMutation, isPending } = useMutation({
    mutationFn: recordStockArrival,
    onMutate: () => {
      const toastId = toast.loading("Enregistrement de l'arrivage...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      // --- On success, invalidate queries to trigger automatic refetching ---
      // Invalidate the main product list
      queryClient.invalidateQueries({ queryKey: ["products"] });

      // Invalidate the history for each affected product so it's fresh if the user expands it
      variables.items.forEach((item) => {
        queryClient.invalidateQueries({
          queryKey: ["stockMovements", item.product_id],
        });
      });
      toast.success("Arrivage enregistré !", { id: context.toastId });
      onClose(); // Close the modal
    },
    onError: (error, variables, context) => {
      toast.error(`Erreur : ${error.message}`, { id: context.toastId });
      console.error("Mutation Error:", error);
    },
  });

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { product_id: "", quantity: 1 }]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (formData) => {
    setError("");
    const res = formData.get("reason")?.toString().trim();
    let reasonText = res ? "Arrivage - " + res : "Arrivage";

    const validItems = lineItems
      .filter((item) => item.product_id && item.quantity > 0)
      .map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
      }));

    if (validItems.length === 0) {
      setError(
        "Veuillez ajouter au moins un produit avec une quantité valide."
      );
      return;
    }
    // Call the mutation
    recordArrivalMutation({ reason: reasonText, items: validItems });
  };

  // Prevent already selected products from appearing in other dropdowns
  const availableProducts = products.filter(
    (p) => !lineItems.some((item) => item.product_id === p.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Enregistrer un Arrivage</h2>
          <button type="button" onClick={onClose}>
            <XCircleIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form action={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Raison / Note d'arrivage
            </label>
            <input
              type="text"
              name="reason"
              placeholder="Ex: Livraison Fournisseur A - 02/08/2025"
              className="mt-1 block w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Produits reçus
            </label>
            {lineItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={item.product_id}
                  onChange={(e) =>
                    handleLineItemChange(index, "product_id", e.target.value)
                  }
                  required
                  className="flex-grow p-2 border rounded-md"
                >
                  <option value="" disabled>
                    Sélectionner un produit
                  </option>
                  {/* Allow the current item's product to be in the list */}
                  {item.product_id && (
                    <option value={item.product_id}>
                      {products.find((p) => p.id === item.product_id)?.name}
                    </option>
                  )}
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleLineItemChange(index, "quantity", e.target.value)
                  }
                  min="1"
                  required
                  className="w-24 p-2 border rounded-md text-center"
                />
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  className="p-1 text-red-500 hover:text-red-700 mt-1"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addLineItem}
              className="text-sm text-indigo-600 hover:underline"
            >
              + Ajouter un produit
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
            <SubmitButton
              pendingText="Enregistrement..."
              isPending={isPending}
              className={`px-4 py-2 rounded-md ${
                isPending
                  ? "bg-gray-300 text-gray-500"
                  : "text-white bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Enregistrer l'arrivage
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
