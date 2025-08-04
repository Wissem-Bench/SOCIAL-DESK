"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil, Archive } from "lucide-react"; // npm install lucide-react
import { getCustomerOrders } from "@/app/lib/actions/customers";
import OrderStatusBadge from "@/app/dashboard/orders/OrderStatusBadge";
import CustomerPanel from "./CustomerPanel";
import ConfirmationModal from "@/app/dashboard/orders/ConfirmationModal";
import { archiveCustomer } from "@/app/lib/actions/customers";

// --- SUB-COMPONENT: CUSTOMER TOOLBAR ---
function CustomerToolbar({
  searchQuery,
  onSearchChange,
  platformFilter,
  onPlatformChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg mb-6 border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Bar */}
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700"
          >
            Rechercher (Nom, Tél...)
          </label>
          <input
            type="text"
            id="search"
            placeholder="Jean Dupont..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        {/* Platform Filter */}
        <div>
          <label
            htmlFor="platform-filter"
            className="block text-sm font-medium text-gray-700"
          >
            Plateforme
          </label>
          <select
            id="platform-filter"
            value={platformFilter}
            onChange={(e) => {
              console.log("e.target.value", e.target.value);
              onPlatformChange(e.target.value);
            }}
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm"
          >
            <option value="all">Toutes les plateformes</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>
        {/* Sort By */}
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
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm"
          >
            <option value="name_asc">Nom (A-Z)</option>
            <option value="name_desc">Nom (Z-A)</option>
            <option value="date_desc">Plus récent</option>
            <option value="date_asc">Plus ancien</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: EXPANDABLE ROW FOR ORDER HISTORY ---
function CustomerOrdersHistoryRow({ customerId }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch order history only when the row is expanded
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getCustomerOrders(customerId);
      console.log("result?.customer?.orders", result?.customer?.orders);
      if (result.error) {
        setError(result.error);
      } else {
        setOrders(result?.customer?.orders);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, [customerId]);

  const renderContent = () => {
    if (isLoading)
      return (
        <p className="text-sm text-gray-500 italic">
          Chargement de l'historique...
        </p>
      );
    if (error) return <p className="text-sm text-red-500">{error}</p>;
    if (orders.length === 0)
      return (
        <p className="text-sm text-gray-500 italic">
          Ce client n'a aucune commande.
        </p>
      );

    return (
      <ul className="space-y-2">
        {orders.map((order) => (
          <li
            key={order.id}
            className="flex justify-between items-center text-sm p-2 bg-white rounded-md hover:bg-gray-100"
          >
            <span>
              Commande{" "}
              <span className="font-bold text-blue-600">
                #{order.order_number}
              </span>{" "}
              -{" "}
              {format(new Date(order.order_date), "dd MMM yyyy", {
                locale: fr,
              })}
            </span>
            <div className="flex items-center gap-4">
              <span className="font-semibold">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "TND",
                }).format(order.total_amount)}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <tr>
      <td colSpan="5" className="p-0">
        <div className="p-4 bg-gray-50/70">
          <h4 className="text-sm font-bold text-gray-800 mb-2">
            Historique des commandes
          </h4>
          {renderContent()}
        </div>
      </td>
    </tr>
  );
}

// --- MAIN COMPONENT: CUSTOMER LIST ---
export default function CustomerList({ initialCustomers }) {
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);

  // State to manage the Edit/Create panel
  const [panelState, setPanelState] = useState({
    isOpen: false,
    customer: null,
  });

  // State to manage the archive confirmation modal
  const [archiveConfirmation, setArchiveConfirmation] = useState({
    isOpen: false,
    customer: null,
  });

  // States for toolbar controls
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  const handleRowClick = (customerId) => {
    setExpandedCustomerId((currentId) =>
      currentId === customerId ? null : customerId
    );
  };

  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...initialCustomers];

    // Search by name, phone or address
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(lowercasedQuery) ||
          c.phone_number?.toLowerCase().includes(lowercasedQuery) ||
          c.address?.toLowerCase().includes(lowercasedQuery)
      );
    }
    // Filter by platform
    if (platformFilter !== "all") {
      console.log("result", result);
      result = result.filter((c) => c.platform === platformFilter);
    }
    // Sort
    switch (sortBy) {
      case "name_asc":
        result.sort((a, b) => a.full_name.localeCompare(b.full_name));
        break;
      case "name_desc":
        result.sort((a, b) => b.full_name.localeCompare(a.full_name));
        break;
      case "date_asc":
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break; // date_desc
    }
    return result;
  }, [initialCustomers, searchQuery, platformFilter, sortBy]);

  const handleConfirmArchive = async () => {
    if (!archiveConfirmation.customer) return;
    await archiveCustomer(archiveConfirmation.customer.id);
    setArchiveConfirmation({ isOpen: false, customer: null });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
      </div>

      <CustomerToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        platformFilter={platformFilter}
        onPlatformChange={setPlatformFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
              >
                Client
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-full"
              >
                Adresse
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Plateforme
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
            {filteredAndSortedCustomers.length > 0 ? (
              filteredAndSortedCustomers.flatMap((customer) => [
                <tr
                  key={customer.id}
                  onClick={() => handleRowClick(customer.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium bg-inherit">
                    <div className="flex items-center">
                      <svg
                        className={`w-4 h-4 mr-3 text-gray-400 transition-transform duration-200 ${
                          expandedCustomerId === customer.id ? "rotate-90" : ""
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
                      {customer.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.phone_number || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.address || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {customer.platform}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() =>
                          setPanelState({ isOpen: true, customer: customer })
                        }
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-normal px-4 py-1 rounded-md shadow-sm transition"
                      >
                        <Pencil size={14} /> Modifier
                      </button>
                      <button
                        onClick={() =>
                          setArchiveConfirmation({
                            isOpen: true,
                            customer: customer,
                          })
                        }
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-normal px-4 py-1 rounded-md shadow-sm transition"
                      >
                        <Archive size={14} /> Archiver
                      </button>
                    </div>
                  </td>
                </tr>,
                expandedCustomerId === customer.id && (
                  <CustomerOrdersHistoryRow
                    key={`${customer.id}-history`}
                    customerId={customer.id}
                  />
                ),
              ])
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-12 px-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Aucun client ne correspond à vos critères
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Essayez d'ajuster vos filtres de recherche.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* RENDER THE MODALS/PANELS CONDITIONALLY */}
      {panelState.isOpen && (
        <CustomerPanel
          customerToEdit={panelState.customer}
          onClose={() => setPanelState({ isOpen: false, customer: null })}
        />
      )}

      <ConfirmationModal
        isOpen={archiveConfirmation.isOpen}
        title="Archiver le client ?"
        message={`Êtes-vous sûr de vouloir archiver "${archiveConfirmation.customer?.full_name}" ? Il n'apparaîtra plus dans la liste principale.`}
        onConfirm={handleConfirmArchive}
        onClose={() =>
          setArchiveConfirmation({ isOpen: false, customer: null })
        }
      />
    </>
  );
}
