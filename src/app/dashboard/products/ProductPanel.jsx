"use client";

import { useState, Fragment } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Combobox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { addProduct, updateProduct } from "@/app/lib/actions/products";
import SubmitButton from "@/app/components/ui/SubmitButton";

export default function ProductPanel({
  productToEdit,
  initialCategories = [],
  onClose,
}) {
  const queryClient = useQueryClient();
  const isEditMode = !!productToEdit;

  // State for the category combobox
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (isEditMode && productToEdit.category_id) {
      const category = initialCategories.find(
        (c) => c.id === productToEdit.category_id
      );
      return category || null;
    }
    return null;
  });
  const [categoryQuery, setCategoryQuery] = useState("");

  // State for the "add new category" inline form

  const filteredCategories =
    categoryQuery === ""
      ? categories
      : categories.filter((c) =>
          c.name.toLowerCase().includes(categoryQuery.toLowerCase())
        );

  // --- Define mutations for add and update ---
  const { mutate: addProductMutation, isPending: isAdding } = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      // On success, invalidate the 'products' query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (err) => {
      alert(`Erreur: ${err.message}`);
    },
  });

  const { mutate: updateProductMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (err) => {
      alert(`Erreur: ${err.message}`);
    },
  });

  const handleFormSubmit = async (formData) => {
    // Right way to console formData Object
    // console.log(Object.fromEntries(formData.entries()));

    // Add selected category_id to the form data before submitting
    if (selectedCategory) {
      formData.append("category_id", selectedCategory.id);
    }

    if (isEditMode) {
      updateProductMutation({ id: productToEdit.id, formData: formData });
    } else {
      addProductMutation(formData);
    }
  };

  const isPending = isAdding || isUpdating;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 max-w-lg w-full flex">
        <form
          action={handleFormSubmit}
          className="h-full flex flex-col bg-white shadow-xl w-full"
        >
          {/* Panel Header */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {isEditMode
                  ? "Modifier le Produit"
                  : "Ajouter un Nouveau Produit"}
              </h2>
              <button
                type="button"
                className="p-1 rounded-md text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Product Name */}
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom du produit
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={productToEdit?.name || ""}
                  required
                  className="mt-1 block w-full p-2 border rounded-md"
                />
              </div>
            </div>

            {/* Category Section */}
            <div>
              {/* The Combobox component now wraps everything related to it */}
              <Combobox value={selectedCategory} onChange={setSelectedCategory}>
                {/* The Label is now correctly inside the Combobox */}
                <Combobox.Label className="block text-sm font-medium text-gray-700">
                  Catégorie
                </Combobox.Label>

                {/* The rest of the Combobox (Input, Button, Options) remains inside */}
                <div className="relative mt-1">
                  <Combobox.Input
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm sm:text-sm"
                    onChange={(event) => setCategoryQuery(event.target.value)}
                    displayValue={(category) => category?.name || ""}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Combobox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
                      {filteredCategories.length === 0 &&
                      categoryQuery !== "" ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                          Aucune catégorie trouvée.
                        </div>
                      ) : (
                        filteredCategories.map((category) => (
                          <Combobox.Option
                            key={category.id}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active
                                  ? "bg-indigo-600 text-white"
                                  : "text-gray-900"
                              }`
                            }
                            value={category}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {category.name}
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active ? "text-white" : "text-indigo-600"
                                    }`}
                                  >
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>
            </div>

            {/* Stock and Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock Actuel
                </label>
                {/* The stock is now a disabled field in the panel. It should only be changed via StockAdjuster or dedicated stock-in forms. */}
                <input
                  type="number"
                  name="stock_quantity"
                  defaultValue={
                    isEditMode ? productToEdit?.stock_quantity || 0 : 0
                  }
                  disabled={isEditMode}
                  className={`mt-1 block w-full p-2 border rounded-md ${
                    isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prix d'achat (TND)
                </label>
                <input
                  type="number"
                  name="purchase_price"
                  defaultValue={productToEdit?.purchase_price || ""}
                  step="0.01"
                  placeholder="Optionnel"
                  className="mt-1 block w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prix de vente (TND)
                </label>
                <input
                  type="number"
                  name="selling_price"
                  defaultValue={productToEdit?.selling_price || ""}
                  step="0.01"
                  required
                  className="mt-1 block w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="flex-shrink-0 p-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
            >
              Annuler
            </button>
            <SubmitButton
              pendingText="Sauvegarde..."
              isPending={isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              {isEditMode ? "Enregistrer" : "Créer le produit"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
