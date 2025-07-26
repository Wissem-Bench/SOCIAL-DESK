"use client";

import { createOrderFromConversation } from "@/app/lib/actions/orders";
import { useRef } from "react";

export default function CreateOrderModal({
  isOpen,
  onClose,
  customer,
  products,
}) {
  const formRef = useRef(null);

  if (!isOpen) return null;

  const handleFormAction = async (formData) => {
    const productId = formData.get("product_id");
    const quantity = formData.get("quantity");

    if (!productId || !quantity) {
      alert("Veuillez sélectionner un produit et une quantité.");
      return;
    }

    // We prepare the data for the server action
    const orderItems = [
      { product_id: productId, quantity: parseInt(quantity, 10) },
    ];
    const customerDetails = { id: customer.id, name: customer.name };

    const result = await createOrderFromConversation(
      customerDetails,
      orderItems
    );

    if (result.error) {
      alert(result.error);
    } else {
      alert(result.success);
      onClose(); // Closes the modal on success
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          Créer une commande pour {customer.name}
        </h2>
        <form ref={formRef} action={handleFormAction}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="product_id"
                className="block text-sm font-medium text-gray-700"
              >
                Produit
              </label>
              <select
                name="product_id"
                id="product_id"
                required
                className="mt-1 block w-full p-2 border rounded-md"
              >
                <option value="">Sélectionner un produit</option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.price} TND
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700"
              >
                Quantité
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                defaultValue="1"
                min="1"
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Créer la commande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
