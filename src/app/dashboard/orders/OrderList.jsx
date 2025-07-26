"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  updateOrderStatus,
  updateOrderDetails,
} from "@/app/lib/actions/orders";

// --- SUB-COMPONENT FOR THE TOOLBAR (FILTERS, SORTING, SEARCH) ---
function OrderToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  clientFilter,
  onClientChange,
  sortBy,
  onSortChange,
  customers,
  statuses,
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg mb-6 border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Barre de recherche */}
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700"
          >
            Rechercher par N°
          </label>
          <input
            type="text"
            id="search"
            placeholder="Ex: 1024..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* 2. Filtre par statut */}
        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700"
          >
            Statut
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            {statuses.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        {/* 3. Filtre par client */}
        <div>
          <label
            htmlFor="client-filter"
            className="block text-sm font-medium text-gray-700"
          >
            Client
          </label>
          <select
            id="client-filter"
            value={clientFilter}
            onChange={(e) => onClientChange(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les clients</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.full_name}
              </option>
            ))}
          </select>
        </div>
        {/* 4. Tri */}
        <div>
          <label
            htmlFor="sort-by"
            className="block text-sm font-medium text-gray-700"
          >
            Trier par
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="order_number_desc">
              N° de commande (décroissant)
            </option>
            <option value="order_number_asc">N° de commande (croissant)</option>
            <option value="date_desc">Date (plus récent)</option>
            <option value="date_asc">Date (plus ancien)</option>
            <option value="amount_desc">Montant (plus élevé)</option>
            <option value="amount_asc">Montant (moins élevé)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// A sub-component for the edit form to keep the code clean
function OrderEditForm({ order, onCancel }) {
  // We bind the order.id to the action
  const updateOrderDetailsWithId = updateOrderDetails.bind(null, order.id);

  return (
    <form
      action={async (formData) => {
        await updateOrderDetailsWithId(formData);
        onCancel(); // Close the form on submission
      }}
      className="mt-4 p-4 bg-gray-50 rounded-md border"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor={`delivery_service_${order.id}`}
            className="block text-sm font-medium text-gray-700"
          >
            Service de livraison
          </label>
          <input
            type="text"
            name="delivery_service"
            id={`delivery_service_${order.id}`}
            defaultValue={order.delivery_service || ""}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor={`tracking_number_${order.id}`}
            className="block text-sm font-medium text-gray-700"
          >
            Numéro de suivi
          </label>
          <input
            type="text"
            name="tracking_number"
            id={`tracking_number_${order.id}`}
            defaultValue={order.tracking_number || ""}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor={`notes_${order.id}`}
            className="block text-sm font-medium text-gray-700"
          >
            Note
          </label>
          <textarea
            name="notes"
            id={`notes_${order.id}`}
            defaultValue={order.notes || ""}
            rows="3"
            className="mt-1 block w-full p-2 border rounded-md"
          ></textarea>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}

// --- NOUVEAU SOUS-COMPOSANT POUR LE SÉLECTEUR DE STATUT ---
function StatusDropdown({ order, statuses }) {
  const [localStatus, setLocalStatus] = useState(order.status);
  const getStatusStyles = (status) => {
    const styles = {
      nouveau: "bg-blue-100 text-blue-800",
      confirmé: "bg-green-100 text-green-800",
      avec_livreur: "bg-yellow-100 text-yellow-800",
      livré: "bg-gray-200 text-gray-800",
      annulé: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  // Synchroniser l'état local avec les props
  const [currentColorClass, setCurrentColorClass] = useState(
    getStatusStyles(order.status)
  );

  const handleSelectionChange = async (e) => {
    const newStatus = e.target.value;
    const previousStatus = localStatus;
    setLocalStatus(newStatus);
    setCurrentColorClass(getStatusStyles(newStatus));

    try {
      await updateOrderStatus(order.id, newStatus);
    } catch (error) {
      setLocalStatus(previousStatus);
      setCurrentColorClass(getStatusStyles(previousStatus));
    }
  };

  return (
    <select
      name="status"
      value={localStatus} // Contrôlé par les props
      onChange={handleSelectionChange}
      className={`capitalize block w-25 pl-3 pr-8 py-1 text-sm border-0 rounded-lg shadow-sm outline-none transition-colors duration-150 ${currentColorClass}`}
      aria-label={`Statut de la commande ${order.order_number}`}
    >
      {statuses.map((status) => (
        <option key={status} value={status} className="bg-white text-black">
          {status.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}

// --- MAIN COMPONENT ---
export default function OrderList({ initialOrders, customers }) {
  const [editingOrderId, setEditingOrderId] = useState(null);
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

  return (
    <div>
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

      {/* Conteneur pour le scroll horizontal sur mobile */}
      <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Colonne fixe (sticky) */}
              <th
                scope="col"
                className="sticky left-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
              >
                N° commande
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
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedOrders.length > 0 ? (
              filteredAndSortedOrders.flatMap((order) => [
                <tr key={order.id} className="hover:bg-gray-50">
                  {/* Cellule de la colonne fixe */}
                  <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium bg-inherit">
                    <Link
                      href={`/dashboard/customers/${order.customer_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.customers?.full_name || "Client inconnu"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.order_date), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[150px]">
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
                      onClick={() =>
                        setEditingOrderId(
                          editingOrderId === order.id ? null : order.id
                        )
                      }
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>,
                // Ligne pour le formulaire d'édition, qui apparaît en dessous
                editingOrderId === order.id && (
                  <tr key={`${order.id}-edit`}>
                    <td colSpan="7" className="p-0 bg-gray-50">
                      <OrderEditForm
                        order={order}
                        onCancel={() => setEditingOrderId(null)}
                      />
                    </td>
                  </tr>
                ),
              ])
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-12 px-4">
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
    </div>
  );
}
