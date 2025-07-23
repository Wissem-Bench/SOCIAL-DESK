"use client";

import { addProduct } from "@/app/lib/actions/products";
import { useRef } from "react";

export default function AddProductForm() {
  // useRef to empty the form after submission
  const formRef = useRef(null);

  // function to handle form action
  const handleAddProduct = async (formData) => {
    const result = await addProduct(formData);
    if (result.error) {
      alert(result.error);
    } else {
      formRef.current?.reset(); // empty the form
    }
  };

  return (
    <form
      ref={formRef}
      action={handleAddProduct}
      className="p-4 border rounded-lg bg-gray-50"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Nom du produit"
          className="p-2 border rounded col-span-2"
          required
        />
        <input
          type="number"
          name="price"
          step="0.01"
          placeholder="Prix (TND)"
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          name="stock_quantity"
          placeholder="Quantité"
          className="p-2 border rounded"
          required
        />
      </div>
      <div className="mt-4">
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Ajouter le produit
        </button>
      </div>
    </form>
  );
}
