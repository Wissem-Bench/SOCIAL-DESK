"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Archive } from "lucide-react";
import {
  getCustomers,
  archiveCustomer,
  restoreCustomer,
} from "@/app/lib/actions/customers";
import CustomerPanel from "./CustomerPanel";
import CustomerToolbar from "./CustomerToolbar";
import CustomerOrdersHistoryRow from "./CustomerOrdersHistoryRow";
import TableSkeleton from "../../components/ui/TableSkeleton";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";

// --- MAIN COMPONENT: CUSTOMER LIST ---
export default function CustomerList({ initialCustomers }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // --- UI STATE MANAGEMENT ---
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [panelState, setPanelState] = useState({
    isOpen: false,
    customer: null,
  });
  const [archiveConfirmation, setArchiveConfirmation] = useState({
    isOpen: false,
    customer: null,
  });
  // Client-side filters
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  const [mutatingCustomerId, setMutatingCustomerId] = useState(null);

  const currentView = searchParams.get("view") || "active";
  const queryKey = ["customers", { view: currentView }];

  // --- DATA FETCHING WITH REACT QUERY ---
  const {
    data: customers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKey,
    queryFn: () => getCustomers({ isArchived: currentView === "archived" }),
  });

  // --- MUTATIONS ---
  const { mutate: archiveCustomerMutation, isPending: isArchiving } =
    useMutation({
      mutationFn: archiveCustomer,
      onMutate: (customerId) => {
        setMutatingCustomerId(customerId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        setArchiveConfirmation({ isOpen: false, customer: null });
      },
      onError: (err) => alert(err.message),
      onSettled: () => {
        setMutatingCustomerId(null);
      },
    });

  const { mutate: restoreCustomerMutation, isPending: isRestoring } =
    useMutation({
      mutationFn: restoreCustomer,
      onMutate: (customerId) => {
        setMutatingCustomerId(customerId); // Set which customer is being restored
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
      },
      onError: (err) => alert(err.message),
      onSettled: () => {
        setMutatingCustomerId(null); // Reset after completion
      },
    });

  // --- HANDLERS ---
  const handleViewChange = (newView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`/dashboard/customers?${params.toString()}`);
  };

  const handleConfirmArchive = () => {
    if (!archiveConfirmation.customer) return;
    archiveCustomerMutation(archiveConfirmation.customer.id);
  };

  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers];

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
  }, [customers, searchQuery, platformFilter, sortBy]);

  const tableHeaders = [
    "Client",
    "Contact",
    "Adresse",
    "Plateforme",
    "Actions",
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
      </div>

      <CustomerToolbar
        view={currentView}
        onViewChange={handleViewChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        platformFilter={platformFilter}
        onPlatformChange={setPlatformFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        setPanelState={setPanelState}
      />

      <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow border">
        {isLoading ? (
          <TableSkeleton headers={tableHeaders} rowCount={5} />
        ) : isError ? (
          <p className="text-center p-12 text-red-500">
            Erreur: {error.message}
          </p>
        ) : (
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
                filteredAndSortedCustomers.flatMap((customer) => {
                  const isThisCustomerRestoring =
                    isRestoring && mutatingCustomerId === customer.id;

                  return [
                    <tr
                      key={customer.id}
                      onClick={() => handleRowClick(customer.id)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium bg-inherit">
                        <div className="flex items-center">
                          <svg
                            className={`w-4 h-4 mr-3 text-gray-400 transition-transform duration-200 ${
                              expandedCustomerId === customer.id
                                ? "rotate-90"
                                : ""
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
                          {/* --- CONDITIONAL ACTIONS --- */}
                          {currentView === "active" ? (
                            <>
                              <button
                                onClick={() =>
                                  setPanelState({
                                    isOpen: true,
                                    customer: customer,
                                  })
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
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                restoreCustomerMutation(customer.id)
                              }
                              disabled={isThisCustomerRestoring}
                              className="flex items-center gap-2  bg-green-600 hover:bg-green-700 text-white font-normal px-4 py-1 rounded-md shadow-sm transition disabled:text-gray-400"
                            >
                              {isThisCustomerRestoring
                                ? "en cours..."
                                : "Restaurer"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>,
                    expandedCustomerId === customer.id && (
                      <CustomerOrdersHistoryRow customerId={customer.id} />
                    ),
                  ];
                })
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
        )}
      </div>
      {/* RENDER THE MODALS/PANELS CONDITIONALLY */}
      {panelState.isOpen && (
        <CustomerPanel
          key={panelState.customer?.id || "new"}
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
        isPending={isArchiving}
      />
    </>
  );
}
