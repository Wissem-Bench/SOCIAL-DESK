"use client";

import { useState } from "react";
import { deleteProduct, updateProduct } from "@/app/lib/actions/products";

export default function ProductList({ products }) {
  const [editingProductId, setEditingProductId] = useState(null);

  return (
    <div className="bg-white shadow rounded-lg">
      <ul className="divide-y divide-gray-200">
        {products && products.length > 0 ? (
          products.map((product) => (
            <li key={product.id} className="p-4">
              {editingProductId === product.id ? (
                <form
                  action={async (formData) => {
                    await updateProduct(product.id, formData);
                    setEditingProductId(null); // Exit edit mode after updating
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      name="name"
                      defaultValue={product.name}
                      className="p-2 border rounded"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="price"
                        defaultValue={product.price}
                        step="0.01"
                        className="p-2 border rounded w-full"
                        required
                      />
                      <input
                        type="number"
                        name="stock_quantity"
                        defaultValue={product.stock_quantity}
                        className="p-2 border rounded w-full"
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingProductId(null)}
                        className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                // ==== NORMAL DISPLAY ====
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">{product.name}</p>
                    <p className="text-gray-600">
                      Prix : {product.price} TND - Quantité :{" "}
                      {product.stock_quantity}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingProductId(product.id)}
                      className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600"
                    >
                      Modifier
                    </button>
                    <form
                      action={async () => {
                        await deleteProduct(product.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </li>
          ))
        ) : (
          <p className="p-4 text-gray-500">Vous n'avez encore aucun produit.</p>
        )}
      </ul>
    </div>
  );
}
