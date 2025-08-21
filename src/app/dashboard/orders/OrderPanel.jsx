import { useState, useMemo, useRef, Fragment } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Combobox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { updateFullOrder, createFullOrder } from "@/app/lib/actions/orders";
import SubmitButton from "@/app/components/ui/SubmitButton";

export default function OrderPanel({ order, customers, products, onClose }) {
  const queryClient = useQueryClient();
  const isEditMode = !!order;
  console.log("order", order);
  // --- MANAGEMENT OF LOCAL FORM STATUS ---
  const [selectedCustomer, setSelectedCustomer] = useState(
    customers.find((c) => c.id === order?.customer_id) || null
  );
  const [customerQuery, setCustomerQuery] = useState("");

  const comboboxInputRef = useRef(null);

  const initialLineItems = useMemo(() => {
    // If not in edit mode, start with one empty line item
    if (!isEditMode) {
      return [
        {
          product_id: "",
          quantity: 1,
          selling_price: 0,
          purchase_price: 0,
          products: null,
          hasStockError: false,
        },
      ];
    }
    const items = Array.isArray(order.order_items)
      ? order.order_items
      : [order.order_items];

    return items.map((item, index) => {
      const productId = item.product_id ?? item.products?.id;

      const productDetails = products.find((p) => p.id === productId);

      return {
        ...item,
        products: productDetails || {
          name: "Produit supprimé",
          stock_quantity: 0,
        },
        selling_price: item.selling_price ?? productDetails?.selling_price ?? 0,
        purchase_price: 0,
        hasStockError: false,
      };
    });
  }, [order?.order_items, products]);

  const [lineItems, setLineItems] = useState(initialLineItems);

  // --- MUTATIONS ---
  const { mutate: createOrderMutation, isPending: isCreating } = useMutation({
    mutationFn: createFullOrder,
    onSuccess: () => {
      // When an order is created, many things become stale.
      // We invalidate all related queries to force a complete refresh.
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Stock has changed
      queryClient.invalidateQueries({ queryKey: ["customers"] }); // Customer might have new order history
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }); // Stats have changed
      onClose();
    },
    onError: (err) => alert(`Erreur de création: ${err.message}`),
  });

  const { mutate: updateOrderMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateFullOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      onClose();
    },
    onError: (err) => alert(`Erreur de modification: ${err.message}`),
  });

  // FORM SUBMISSION MANAGEMENT
  const handleFormSubmit = async (formData) => {
    const dataToSubmit = {
      customer_id: selectedCustomer?.id,
      notes: formData.get("notes"),
      delivery_service: formData.get("delivery_service"),
      tracking_number: formData.get("tracking_number"),
      items: lineItems
        .filter((item) => item.product_id || item.products?.id)
        .map((item) => ({
          product_id: item.product_id || item.products?.id,
          quantity: item.quantity,
          selling_price: item.selling_price,
          purchase_price: item.purchase_price,
        })),
    };

    if (isEditMode) {
      updateOrderMutation({ orderId: order.id, data: dataToSubmit });
    } else {
      createOrderMutation(dataToSubmit);
    }
    onClose();
  };

  const isPending = isCreating || isUpdating;

  // --- COMPUTATIONAL LOGIC ---
  const filteredCustomers =
    customerQuery === ""
      ? customers
      : customers.filter((c) =>
          c.full_name.toLowerCase().includes(customerQuery.toLowerCase())
        );
  const subTotal = useMemo(
    () =>
      lineItems.reduce(
        (acc, item) => acc + item.quantity * item.selling_price,
        0
      ),
    [lineItems]
  );

  // --- EVENTS MANAGEMENT ---
  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    const item = { ...updatedItems[index] };

    if (field === "product") {
      const selectedProduct = products.find((p) => p.id === value);
      if (selectedProduct) {
        item.product_id = selectedProduct.id;
        item.selling_price = selectedProduct.selling_price;
        item.purchase_price = selectedProduct.purchase_price;
        item.products = selectedProduct; // We store the complete product object
        // validate stock for current quantity
        const originalQty =
          initialLineItems.find((orig) => orig.product_id === item.product_id)
            ?.quantity || 0;
        const availableStock =
          selectedProduct.stock_quantity + (isEditMode ? originalQty : 0);
        item.hasStockError = item.quantity > availableStock;
      }
    } else if (field === "quantity") {
      const newQuantity = Math.max(1, Number(value) || 1); // Prevents a quantity of 0 or less
      item.quantity = newQuantity;
      if (item.products) {
        // Stock logic for edit mode: Available stock is the current stock
        // + the quantity already in this order.
        const originalQty =
          initialLineItems.find((orig) => orig.product_id === item.product_id)
            ?.quantity || 0;
        const availableStock =
          item.products.stock_quantity + (isEditMode ? originalQty : 0);
        item.hasStockError = newQuantity > availableStock;
      }
    }

    updatedItems[index] = item;
    setLineItems(updatedItems);
  };

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

  function getAvailableProducts(products, lineItems, currentIndex) {
    const selectedProduct = lineItems.map((item, i) => {
      return i === currentIndex ? item.product_id : item.products?.id;
    });
    const selectedProductIds = selectedProduct.filter(Boolean); // ignore undefined, null, ''
    const filtredProd = products.filter(
      (product) =>
        !selectedProductIds.includes(product.id) ||
        product.id === lineItems[currentIndex]?.product_id
    );
    return filtredProd;
  }

  const isAddLineDisabled =
    lineItems.some((item) => !item.product_id && !item.products?.id) ||
    lineItems.length >= products.length;

  const isSubmitDisabled =
    !selectedCustomer ||
    lineItems.length === 0 ||
    lineItems.some((item) => !item.product_id && !item.products?.id) ||
    lineItems.some((item) => item.hasStockError);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 max-w-2xl w-full flex">
        <form
          action={handleFormSubmit}
          className="h-full flex flex-col bg-white shadow-xl w-full"
        >
          {/* --- PANEL HEADER --- */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {isEditMode
                    ? "Modifier la Commande"
                    : "Créer une nouvelle commande"}
                </h2>
                {isEditMode && (
                  <p className="mt-1 text-sm text-gray-500">
                    #{order.order_number} <span className="mx-2">·</span>{" "}
                    <span className="font-bold capitalize">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </p>
                )}
              </div>
              <button
                type="button"
                className="p-1 rounded-md text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* --- BODY OF THE FORM --- */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-6">
              {/* --- CUSTOMER SELECTOR --- */}
              <div>
                <Combobox
                  value={selectedCustomer}
                  onChange={setSelectedCustomer}
                >
                  <Combobox.Label className="block text-sm font-medium text-gray-700">
                    Client
                  </Combobox.Label>
                  <div className="relative mt-1">
                    <Combobox.Input
                      ref={comboboxInputRef}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm sm:text-sm"
                      onChange={(event) => setCustomerQuery(event.target.value)}
                      displayValue={(customer) => customer?.full_name || ""}
                      onBlur={() => {
                        // We use a short timeout to prevent a "race condition".
                        // This gives the Combobox time to process a click on an option
                        // before the blur event resets the query.
                        setTimeout(() => {
                          setCustomerQuery("");
                        }, 150); // 150ms is a safe delay
                      }}
                      onFocus={() => {
                        // When the input is focused, dispatch a keyboard event
                        if (comboboxInputRef.current) {
                          const downArrowEvent = new KeyboardEvent("keydown", {
                            key: "ArrowDown",
                            code: "ArrowDown",
                            bubbles: true,
                            cancelable: true,
                          });
                          comboboxInputRef.current.dispatchEvent(
                            downArrowEvent
                          );
                        }
                      }}
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
                        {filteredCustomers.map((customer) => (
                          <Combobox.Option
                            key={customer.id}
                            value={customer}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-900"
                              }`
                            }
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {customer.full_name}
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active ? "text-white" : "text-blue-600"
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
                        ))}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
              </div>

              {/* --- COMMAND LINES --- */}
              <div>
                <h3 className="text-sm font-medium text-gray-700">Produits</h3>
                <div className="mt-2 space-y-2">
                  {lineItems.map((item, index) => {
                    const availableProducts = getAvailableProducts(
                      products,
                      lineItems,
                      index
                    );
                    // We determine if there is an error for this line
                    const hasError = item.hasStockError;
                    console.log("lineItems", lineItems);
                    // In edit mode, the "available" stock includes what is already in the order
                    const originalQty =
                      initialLineItems.find(
                        (orig) => orig.product_id === item.product_id
                      )?.quantity || 0;
                    const effectiveStock =
                      item.products?.stock_quantity +
                      (isEditMode ? originalQty : 0);

                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-2 p-2 rounded-md border transition-colors ${
                          hasError
                            ? "bg-red-50 border-red-300"
                            : "border-gray-200"
                        }`}
                      >
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
                            className="w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm"
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
                            <div className="mt-1 ml-1">
                              <p
                                className={`text-xs transition-colors ${
                                  hasError
                                    ? "text-red-700 font-bold"
                                    : "text-gray-500"
                                }`}
                              >
                                Stock disponible : {effectiveStock}
                              </p>
                              {hasError && (
                                <p className="text-xs text-red-600 font-semibold mt-1">
                                  Stock insuffisant !
                                </p>
                              )}
                            </div>
                          )}
                        </div>

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

                        <span className="w-28 text-right text-sm font-medium text-gray-700 pt-2">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "TND",
                          }).format(
                            item?.selling_price
                              ? item.selling_price * item.quantity
                              : 0
                          )}
                        </span>

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

              {/* --- OTHER FIELDS --- */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Service de livraison
                  </label>
                  <input
                    type="text"
                    name="delivery_service"
                    defaultValue={order?.delivery_service || ""}
                    className="mt-1 block w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Numéro de suivi
                  </label>
                  <input
                    type="text"
                    name="tracking_number"
                    defaultValue={order?.tracking_number || ""}
                    className="mt-1 block w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Note
                  </label>
                  <textarea
                    name="notes"
                    defaultValue={order?.notes || ""}
                    rows="4"
                    className="mt-1 block w-full p-2 border rounded-md"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* --- PANEL FOOTER --- */}
          <div className="flex-shrink-0 p-4 border-t flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Total</span>
              <p className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "TND",
                }).format(subTotal ? subTotal : 0)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
              >
                Annuler
              </button>
              <SubmitButton
                isPending={isPending}
                pendingText={isEditMode ? "Sauvegarde..." : "Création..."}
                className={`px-4 py-2 rounded-md text-sm ${
                  isSubmitDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                disabled={isSubmitDisabled}
              >
                {isEditMode ? "Enregistrer" : "Créer la commande"}
              </SubmitButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
