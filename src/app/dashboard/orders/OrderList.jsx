"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrdersForUser, updateOrderStatus } from "@/app/lib/actions/orders";
import { getCustomers } from "@/app/lib/actions/customers";
import { getProductsForUser } from "@/app/lib/actions/products";
import { useDebounce } from "@/app/hooks/use-debounce";
import OrderToolbar from "./OrderToolbar";
import StatusDropdown from "./StatusDropdown";
import OrderDetailsRow from "./OrderDetailsRow";
import OrderPanel from "./OrderPanel";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil } from "lucide-react";

export default function OrderList() {
  const queryClient = useQueryClient();

  // --- UI STATE MANAGEMENT ---
  const [panelState, setPanelState] = useState({ mode: null, orderId: null }); // mode can be 'edit' or 'create'
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order_number_desc");

  // We debounce the search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filters = {
    search: searchQuery.length >= 4 ? debouncedSearchQuery : "",
    status: statusFilter,
    client: clientFilter,
    sort: sortBy,
  };

  const queryKey = ["orders", filters];

  // --- DATA FETCHING WITH REACT QUERY ---
  const {
    data: orders = [],
    isLoading: isLoadingOrders,
    isError: isOrdersError,
    error: ordersError,
  } = useQuery({
    queryKey: queryKey,
    // The query function now passes all filters to the backend
    queryFn: () => getOrdersForUser(filters),
  });

  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    isError: isCustomersError,
    error: customersError,
  } = useQuery({
    queryKey: ["customers", { isArchived: false }],
    queryFn: () => getCustomers({ isArchived: false }),
  });

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
    error: productsError,
  } = useQuery({
    queryKey: ["products", { view: "active" }],
    queryFn: () => getProductsForUser({ isArchived: false }),
  });

  const isLoading = isLoadingOrders || isLoadingCustomers || isLoadingProducts;
  const isError = isOrdersError || isCustomersError || isProductsError;
  const error = ordersError || customersError || productsError;

  // --- MUTATIONS ---
  // We would add mutations for create/update order here later
  // For now, let's refactor the status update
  const { mutate: updateStatusMutation } = useMutation({
    mutationFn: ({ orderId, newStatus }) =>
      updateOrderStatus(orderId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => alert(err.message),
  });

  // --- HANDLERS ---
  const handleRowClick = (orderId) => {
    setExpandedOrderId((currentId) => (currentId === orderId ? null : orderId));
  };

  const orderToEdit = useMemo(() => {
    if (panelState.mode !== "edit" || !panelState.orderId) return null;
    return orders.find((o) => o.id === panelState.orderId);
  }, [panelState, orders]);

  const tableHeaders = [
    "N°",
    "Client",
    "Date",
    "Statut",
    "Montant",
    "Livraison",
    "Actions",
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
        {/* 2. The "New Order" button sets the state to 'create' mode */}
        <button
          onClick={() => setPanelState({ mode: "create", orderId: null })}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + Nouvelle Commande
        </button>
      </div>

      <OrderToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        clientFilter={clientFilter}
        onClientChange={setClientFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        customers={customers}
      />

      <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow border">
        {isLoading ? (
          <TableSkeleton headers={tableHeaders} rowCount={10} />
        ) : isError ? (
          <p className="p-8 text-red-500 text-center">
            Erreur: {error.message}
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                >
                  N°
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Client
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Statut
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Montant
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Livraison
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.flatMap((order) => [
                  <tr
                    key={order.id}
                    onClick={() => handleRowClick(order.id)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium bg-white">
                      <div className="flex items-center">
                        <svg
                          className={`w-4 h-4 mr-2 text-gray-400 transition-transform duration-200 ${
                            expandedOrderId === order.id ? "rotate-90" : ""
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <h3 className="text-lg font-bold">
                          {order.status === "nouveau" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPanelState({
                                  mode: "edit",
                                  orderId: order.id,
                                });
                              }}
                              className="text-blue-600 hover:underline"
                            >
                              #{order.order_number}
                            </button>
                          ) : (
                            <span className="text-blue-600">
                              #{order.order_number}
                            </span>
                          )}
                        </h3>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.customers?.full_name || "Client inconnu"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.order_date), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </td>
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[150px]"
                    >
                      <StatusDropdown
                        order={order}
                        onStatusChange={updateStatusMutation}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "TND",
                      }).format(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.delivery_service ? (
                        <div>
                          <span className="font-medium">
                            {order.delivery_service}
                          </span>
                          <br />
                          <span className="text-xs text-gray-400">
                            {order.tracking_number || "Pas de suivi"}
                          </span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.status === "nouveau" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPanelState({ mode: "edit", orderId: order.id });
                          }}
                          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-normal px-4 py-1 rounded-md shadow-sm transition"
                        >
                          <Pencil size={14} />
                          Modifier
                        </button>
                      ) : null}
                    </td>
                  </tr>,
                  expandedOrderId === order.id && (
                    <OrderDetailsRow
                      key={`${order.id}-details`}
                      orderId={order.id}
                    />
                  ),
                ])
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12 px-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Aucune commande ne correspond à vos critères
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Essayez d'ajuster vos filtres ou votre recherche.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {panelState.mode && (
        <OrderPanel
          key={panelState.orderId || "create"} // Using a key to force re-mount
          order={panelState.mode === "edit" ? orderToEdit : null}
          customers={customers}
          products={products}
          onClose={() => setPanelState({ mode: null, orderId: null })}
        />
      )}
    </>
  );
}
