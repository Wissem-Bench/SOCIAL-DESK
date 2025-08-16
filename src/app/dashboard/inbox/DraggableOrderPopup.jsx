"use client";

import { useState, useMemo, useRef } from "react";
import Draggable from "react-draggable";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { createFullOrder } from "@/app/lib/actions/orders";
import SubmitButton from "@/app/components/ui/SubmitButton";

export default function DraggableOrderPopup({
  customer,
  products,
  onClose,
  onOrderCreated,
}) {
  const popupRef = useRef(null);

  // Initial line items: always start with one empty row
  const [lineItems, setLineItems] = useState([
    {
      product_id: "",
      quantity: 1,
      selling_price: 0,
      purchase_price: 0,
      products: null,
      hasStockError: false,
    },
  ]);

  const subTotal = useMemo(
    () =>
      lineItems.reduce(
        (acc, item) => acc + item.quantity * item.selling_price,
        0
      ),
    [lineItems]
  );

  // Handle adding/removing items
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        product_id: "",
        quantity: 1,
        selling_price: 0,
        purchase_price: 0,
        products: null,
      },
    ]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Ensure product list doesn't include already-selected products
  function getAvailableProducts(products, lineItems, currentIndex) {
    const selectedProductIds = lineItems
      .map((item, i) =>
        i === currentIndex ? item.product_id : item.products?.id
      )
      .filter(Boolean);
    return products.filter(
      (product) =>
        !selectedProductIds.includes(product.id) ||
        product.id === lineItems[currentIndex]?.product_id
    );
  }

  // Handle changes in line items
  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    const item = { ...updatedItems[index] };

    if (field === "product") {
      const selectedProduct = products.find((p) => p.id === value);
      if (selectedProduct) {
        item.product_id = selectedProduct.id;
        item.selling_price = selectedProduct.selling_price;
        item.purchase_price = selectedProduct.purchase_price;
        item.products = selectedProduct;
        item.hasStockError = item.quantity > selectedProduct.stock_quantity;
      }
    } else if (field === "quantity") {
      const newQuantity = Math.max(1, Number(value) || 1);
      item.quantity = newQuantity;
      if (item.products) {
        item.hasStockError = newQuantity > item.products.stock_quantity;
      }
    }

    updatedItems[index] = item;
    setLineItems(updatedItems);
  };

  const isAddLineDisabled =
    lineItems.some((item) => !item.product_id && !item.products?.id) ||
    lineItems.length >= products.length;

  const isSubmitDisabled =
    lineItems.length === 0 ||
    lineItems.some((item) => !item.product_id && !item.products?.id) ||
    lineItems.some((item) => item.hasStockError);

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    const dataToSubmit = {
      customer_id: customer.id,
      notes: formData.get("notes"),
      items: lineItems
        .filter((item) => item.product_id || item.products?.id)
        .map((item) => ({
          product_id: item.product_id || item.products?.id,
          quantity: item.quantity,
          selling_price: item.selling_price,
          purchase_price: item.purchase_price,
        })),
    };

    const result = await createFullOrder(dataToSubmit);

    if (result.error) {
      alert(result.error.message);
    } else {
      // On success, call the callback function to notify the parent
      if (onOrderCreated) {
        onOrderCreated();
      }
      onClose();
    }
  };

  return (
    <Draggable nodeRef={popupRef} handle=".drag-handle">
      <div
        ref={popupRef}
        className="fixed top-1/4 left-1/4 bg-white shadow-2xl rounded-lg w-full max-w-2xl border z-50"
      >
        <form
          action={handleFormSubmit}
          className="h-full flex flex-col bg-white shadow-xl w-full"
        >
          {/* --- HEADER (The draggable handle) --- */}
          <div className="drag-handle p-4 bg-gray-100 rounded-t-lg flex justify-between items-center cursor-move border-b">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Nouvelle Commande
              </h2>
              <p className="text-sm text-gray-500">Pour : {customer.name}</p>
            </div>
            <button
              type="button"
              className="p-1 rounded-md text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Products */}
            <div>
              <h3 className="text-sm font-medium text-gray-700">Produits</h3>
              <div className="mt-2 space-y-2">
                {lineItems.map((item, index) => {
                  const availableProducts = getAvailableProducts(
                    products,
                    lineItems,
                    index
                  );
                  const hasError = item.hasStockError;
                  const effectiveStock = item.products?.stock_quantity ?? 0;

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-2 p-2 rounded-md border ${
                        hasError
                          ? "bg-red-50 border-red-300"
                          : "border-gray-200"
                      }`}
                    >
                      {/* Product select */}
                      <div className="flex-grow">
                        <select
                          value={item.product_id ?? item.products?.id}
                          onChange={(e) =>
                            handleLineItemChange(
                              index,
                              "product",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="" disabled>
                            Sélectionner un produit
                          </option>
                          {availableProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        {item.products?.stock_quantity !== undefined && (
                          <p
                            className={`text-xs mt-1 ${
                              hasError
                                ? "text-red-700 font-bold"
                                : "text-gray-500"
                            }`}
                          >
                            Stock disponible : {effectiveStock}
                          </p>
                        )}
                        {hasError && (
                          <p className="text-xs text-red-600 font-semibold mt-1">
                            Stock insuffisant !
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        className={`w-20 p-2 text-center border rounded-md ${
                          hasError
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-300"
                        }`}
                        min="1"
                      />

                      {/* Price */}
                      <span className="w-28 text-right text-sm font-medium pt-2">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "TND",
                        }).format(
                          item.selling_price
                            ? item.selling_price * item.quantity
                            : 0
                        )}
                      </span>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="p-1 text-red-500 hover:text-red-700 mt-1"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add line */}
              <button
                type="button"
                onClick={addLineItem}
                className={`mt-2 text-sm ${
                  isAddLineDisabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:underline"
                }`}
                disabled={isAddLineDisabled}
              >
                + Ajouter une ligne
              </button>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Note
              </label>
              <textarea
                name="notes"
                rows="4"
                className="mt-1 block w-full p-2 border rounded-md"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Total</span>
              <p className="text-xl font-bold">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "TND",
                }).format(subTotal)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-md hover:gray-300 text-sm"
              >
                Annuler
              </button>
              <SubmitButton
                pendingText="Création..."
                className={`px-4 py-2 rounded-md text-sm ${
                  isSubmitDisabled
                    ? "bg-gray-300 text-gray-500"
                    : "bg-blue-600 text-white"
                }`}
                disabled={isSubmitDisabled}
              >
                Créer la commande
              </SubmitButton>
            </div>
          </div>
        </form>
      </div>
    </Draggable>
  );
}
