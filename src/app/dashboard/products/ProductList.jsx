"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductsForUser,
  archiveProduct,
  restoreProduct,
} from "@/app/lib/actions/products";
import { getCategories } from "@/app/lib/actions/categories";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import TableSkeleton from "../../components/ui/TableSkeleton";
import ProductToolbar from "./ProductToolbar";
import ProductHistoryRow from "./ProductHistoryRow";
import StockAdjustmentModal from "./StockAdjustmentModal";
import ProductPanel from "./ProductPanel";
import StockArrivalModal from "./StockArrivalModal";
import CategoryManagerModal from "./CategoryManagerModal";
import { Pencil, Archive } from "lucide-react";

export default function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const currentView = searchParams.get("view") || "active";
  const queryKey = ["products", { view: currentView }]; // Define a unique key for this query

  const [mutatingProductId, setMutatingProductId] = useState(null);

  const [expandedProductId, setExpandedProductId] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelState, setPanelState] = useState({ mode: null, product: null });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [adjustmentModal, setAdjustmentModal] = useState({
    isOpen: false,
    product: null,
  });

  const [isArrivalModalOpen, setIsArrivalModalOpen] = useState(false);

  const [archiveConfirmation, setArchiveConfirmation] = useState({
    isOpen: false,
    productToArchive: null,
  });

  // États pour les contrôles
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");

  const handleRowClick = (productId) => {
    setExpandedProductId((currentId) =>
      currentId === productId ? null : productId
    );
  };

  // --- PRODUCTS FETCHING ---
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
    error: productsError,
  } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      getProductsForUser({ isArchived: currentView === "archived" }),
  });

  // --- CATEGORIES FETCHING ---
  const {
    data: categories = [], // Default to an empty array
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"], // Unique key for this data
    queryFn: () => getCategories().then((res) => res.categories), // The function that fetches the data
  });

  const isInitialLoading = isLoadingProducts || isLoadingCategories;
  const isError = isProductsError || isCategoriesError;
  const error = productsError || categoriesError;

  // --- MUTATIONS ---
  const { mutate: archiveProductMutation, isPending: isArchiving } =
    useMutation({
      mutationFn: archiveProduct,
      onMutate: (productId) => {
        setMutatingProductId(productId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        setArchiveConfirmation({ isOpen: false, productToArchive: null });
      },
      onError: (err) => {
        alert(err.message);
      },
      onSettled: () => {
        setMutatingProductId(null);
      },
    });

  const { mutate: restoreProductMutation, isPending: isRestoring } =
    useMutation({
      mutationFn: restoreProduct,
      onMutate: (productId) => {
        setMutatingProductId(productId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      },
      onError: (err) => {
        alert(err.message);
      },
      onSettled: () => {
        setMutatingProductId(null);
      },
    });

  // --- HANDLERS ---
  const handleViewChange = (newView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`/dashboard/products?${params.toString()}`);
  };

  const handleConfirmArchive = () => {
    if (!archiveConfirmation.productToArchive) return;
    archiveProductMutation(archiveConfirmation.productToArchive.id);
  };

  const handleRestore = (productId) => {
    restoreProductMutation(productId);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Recherche
    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Filtre par catégorie
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.categories?.id === categoryFilter);
    }
    // Filtre par stock
    if (stockFilter !== "all") {
      if (stockFilter === "in_stock")
        result = result.filter((p) => p.stock_quantity > 5);
      if (stockFilter === "low_stock")
        result = result.filter(
          (p) => p.stock_quantity > 0 && p.stock_quantity <= 5
        );
      if (stockFilter === "out_of_stock")
        result = result.filter((p) => p.stock_quantity === 0);
    }
    // Tri
    switch (sortBy) {
      case "name_desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price_desc":
        result.sort((a, b) => b.selling_price - a.selling_price);
        break;
      case "price_asc":
        result.sort((a, b) => a.selling_price - b.selling_price);
        break;
      case "stock_desc":
        result.sort((a, b) => b.stock_quantity - a.stock_quantity);
        break;
      case "stock_asc":
        result.sort((a, b) => a.stock_quantity - b.stock_quantity);
        break;
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return result;
  }, [products, searchQuery, categoryFilter, stockFilter, sortBy]);

  const getStockClass = (quantity) => {
    if (quantity === 0) return "text-red-600 font-bold";
    if (quantity <= 5) return "text-yellow-600 font-semibold";
    return "text-gray-800";
  };

  const tableHeaders = [
    "Produit",
    "Catégorie",
    "Prix d'achat",
    "Prix de vente",
    "Quantité en Stock",
    "Actions",
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Gestion de Stock</h1>
      </div>
      <ProductToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        stockFilter={stockFilter}
        onStockChange={setStockFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        view={currentView}
        onViewChange={handleViewChange}
        setIsArrivalModalOpen={setIsArrivalModalOpen}
        setIsCategoryModalOpen={setIsCategoryModalOpen}
        setIsPanelOpen={setIsPanelOpen}
        setPanelState={setPanelState}
      />

      <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow border">
        {isInitialLoading ? (
          <TableSkeleton headers={tableHeaders} rowCount={10} />
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
                  Produit
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Catégorie
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Prix d'achat
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Prix de vente
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quantité en Stock
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
              {filteredAndSortedProducts.length > 0 ? (
                filteredAndSortedProducts.flatMap((product) => {
                  const isThisProductArchiving =
                    isArchiving && mutatingProductId === product.id;
                  const isThisProductRestoring =
                    isRestoring && mutatingProductId === product.id;
                  return [
                    <tr
                      key={product.id}
                      onClick={() => handleRowClick(product.id)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium bg-inherit">
                        <div className="flex items-center">
                          <svg
                            className={`w-4 h-4 mr-3 text-gray-400 transition-transform duration-200 ${
                              expandedProductId === product.id
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
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.categories?.name || "Non classé"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "TND",
                        }).format(product.purchase_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "TND",
                        }).format(product.selling_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col items-start">
                          <span
                            className={`${getStockClass(
                              product.stock_quantity
                            )}`}
                          >
                            {product.stock_quantity} unités
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row expansion
                              setAdjustmentModal({
                                isOpen: true,
                                product: product,
                              });
                            }}
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            Ajuster
                          </button>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-4">
                          {currentView === "active" ? (
                            <>
                              <button
                                onClick={() => {
                                  setIsPanelOpen(true);
                                  setPanelState({
                                    mode: "edit",
                                    product: product,
                                  });
                                }}
                                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-normal px-4 py-1 rounded-md shadow-sm transition"
                              >
                                <Pencil size={14} />
                                Modifier
                              </button>
                              <button
                                onClick={() =>
                                  setArchiveConfirmation({
                                    isOpen: true,
                                    productToArchive: product,
                                  })
                                }
                                disabled={isThisProductArchiving}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-normal px-4 py-1 rounded-md shadow-sm transition"
                              >
                                <Archive size={14} /> Archiver
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestore(product.id)}
                                disabled={isThisProductRestoring}
                                className="flex items-center gap-2 text-green-600 hover:text-green-900 font-medium disabled:text-gray-400"
                              >
                                {isThisProductRestoring
                                  ? "en cours..."
                                  : "Restaurer"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>,
                    expandedProductId === product.id && (
                      <ProductHistoryRow
                        key={`${product.id}-history`}
                        product={product}
                      />
                    ),
                  ];
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 px-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Aucun produit ne correspond à vos critères
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Essayez d'ajuster vos filtres ou d'ajouter un nouveau
                      produit.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {panelState.mode && (
        <ProductPanel
          key={panelState.product?.id || "create"} // A key ensures the component re-mounts correctly
          productToEdit={panelState.product}
          initialCategories={categories}
          onClose={() => {
            setPanelState({ mode: null, product: null });
            setIsPanelOpen(false);
          }}
        />
      )}
      {/* Reusable Confirmation Modal for archiving */}
      <ConfirmationModal
        isOpen={archiveConfirmation.isOpen}
        isPending={isArchiving}
        title="Archiver le produit ?"
        message={`Êtes-vous sûr de vouloir archiver le produit "${archiveConfirmation.productToArchive?.name}" ? Il n'apparaîtra plus dans les listes mais son historique sera conservé.`}
        onConfirm={() =>
          handleConfirmArchive(archiveConfirmation.productToArchive?.id)
        }
        onClose={() =>
          setArchiveConfirmation({ isOpen: false, productToArchive: null })
        }
      />
      {adjustmentModal.isOpen && (
        <StockAdjustmentModal
          product={adjustmentModal.product}
          onClose={() => setAdjustmentModal({ isOpen: false, product: null })}
        />
      )}
      {isArrivalModalOpen && (
        <StockArrivalModal
          products={products}
          onClose={() => setIsArrivalModalOpen(false)}
        />
      )}
      {isCategoryModalOpen && (
        <CategoryManagerModal
          initialCategories={categories}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      )}
    </>
  );
}
