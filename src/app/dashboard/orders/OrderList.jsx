"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import OrderToolbar from "./OrderToolbar";
import StatusDropdown from "./StatusDropdown";
import OrderDetailsRow from "./OrderDetailsRow";
import OrderPanel from "./OrderPanel";

export default function OrderList({ initialOrders, customers, products }) {
  // We change the state to handle both modes
  const [panelState, setPanelState] = useState({ mode: null, orderId: null }); // mode can be 'edit' or 'create'
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order_number_desc");
  const statuses = ["nouveau", "confirmé", "avec_livreur", "livré", "annulé"];

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...initialOrders];
    if (searchQuery) {
      result = result.filter((order) =>
        order.order_number.toString().includes(searchQuery.trim())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }
    if (clientFilter !== "all") {
      result = result.filter((order) => order.customer_id === clientFilter);
    }
    switch (sortBy) {
      case "order_number_asc":
        result.sort((a, b) => a.order_number - b.order_number);
        break;
      case "date_desc":
        result.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
        break;
      case "date_asc":
        result.sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
        break;
      case "amount_desc":
        result.sort((a, b) => b.total_amount - a.total_amount);
        break;
      case "amount_asc":
        result.sort((a, b) => a.total_amount - b.total_amount);
        break;
      default:
        result.sort((a, b) => b.order_number - a.order_number);
        break;
    }
    return result;
  }, [initialOrders, searchQuery, statusFilter, clientFilter, sortBy]);

  const orderToEdit = useMemo(() => {
    if (panelState.mode !== "edit" || !panelState.orderId) return null;
    return initialOrders.find((o) => o.id === panelState.orderId);
  }, [panelState, initialOrders]);

  const handleRowClick = (orderId) => {
    setExpandedOrderId((currentId) => (currentId === orderId ? null : orderId));
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
        {/* 2. The "New Order" button that sets the state to 'create' mode */}
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
        statuses={statuses}
      />

      <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow border">
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
            {filteredAndSortedOrders.length > 0 ? (
              filteredAndSortedOrders.flatMap((order) => [
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPanelState({ mode: "edit", orderId: order.id });
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        #{order.order_number}
                      </button>
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
                    <StatusDropdown order={order} statuses={statuses} />
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPanelState({ mode: "edit", orderId: order.id });
                      }}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>,
                expandedOrderId === order.id && (
                  <OrderDetailsRow key={`${order.id}-details`} order={order} />
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
