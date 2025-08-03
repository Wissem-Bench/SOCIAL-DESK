"use client";

import { useState, useMemo, useEffect } from "react";
import { archiveProduct, getStockMovements } from "@/app/lib/actions/products";
import ConfirmationModal from "../orders/ConfirmationModal";
import StockAdjustmentModal from "./StockAdjustmentModal";
import ProductPanel from "./ProductPanel";
import StockArrivalModal from "./StockArrivalModal";
import { Pencil, Archive } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// --- SOUS-COMPOSANT : BARRE D'OUTILS POUR LES PRODUITS ---
function ProductToolbar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  stockFilter,
  onStockChange,
  sortBy,
  onSortChange,
  categories,
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
            Rechercher un produit
          </label>
          <input
            type="text"
            id="search"
            placeholder="Nom du produit..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        {/* 2. Filtre par catégorie */}
        <div>
          <label
            htmlFor="category-filter"
            className="block text-sm font-medium text-gray-700"
          >
            Catégorie
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => {
              onCategoryChange(e.target.value);
            }}
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {/* 3. Filtre par statut de stock */}
        <div>
          <label
            htmlFor="stock-filter"
            className="block text-sm font-medium text-gray-700"
          >
            Stock
          </label>
          <select
            id="stock-filter"
            value={stockFilter}
            onChange={(e) => onStockChange(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm"
          >
            <option value="all">Tous</option>
            <option value="in_stock">En stock</option>
            <option value="low_stock">Stock faible</option>
            <option value="out_of_stock">En rupture</option>
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
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm"
          >
            <option value="name_asc">Nom (A-Z)</option>
            <option value="name_desc">Nom (Z-A)</option>
            <option value="price_desc">Prix (plus élevé)</option>
            <option value="price_asc">Prix (moins élevé)</option>
            <option value="stock_desc">Stock (plus élevé)</option>
            <option value="stock_asc">Stock (moins élevé)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANT : LIGNE DE DÉTAILS POUR L'HISTORIQUE ---
function ProductHistoryRow({ product }) {
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch movements when the component is mounted (i.e., when the row is expanded)
    const fetchMovements = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getStockMovements(product.id);
      if (result.error) {
        setError(result.error);
      } else {
        setMovements(result.movements);
      }
      setIsLoading(false);
    };

    fetchMovements();
  }, [product.id]); // Dependency array ensures it re-fetches if the product ID changes

  const renderContent = () => {
    if (isLoading) {
      return (
        <p className="text-sm text-gray-500 italic">
          Chargement de l'historique...
        </p>
      );
    }
    if (error) {
      return <p className="text-sm text-red-500">{error}</p>;
    }
    if (movements.length === 0) {
      return (
        <p className="text-sm text-gray-500 italic">
          Aucun mouvement de stock enregistré pour ce produit.
        </p>
      );
    }
    return (
      <table className="min-w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="py-2 px-3 text-left font-medium text-gray-600">
              Date
            </th>
            <th className="py-2 px-3 text-center font-medium text-gray-600">
              Quantité
            </th>
            <th className="py-2 px-3 text-left font-medium text-gray-600">
              Raison
            </th>
          </tr>
        </thead>
        <tbody>
          {movements.map((move) => (
            <tr key={move.id} className="border-b last:border-b-0">
              <td className="py-2 px-3 text-gray-500">
                {format(new Date(move.created_at), "dd/MM/yyyy HH:mm", {
                  locale: fr,
                })}
              </td>
              <td
                className={`py-2 px-3 text-center font-bold ${
                  move.change_quantity > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {move.change_quantity > 0
                  ? `+${move.change_quantity}`
                  : move.change_quantity}
              </td>
              <td className="py-2 px-3 text-gray-700">{move.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <tr>
      <td colSpan="6" className="p-0">
        <div className="p-4 bg-gray-50/70">
          <h4 className="text-sm font-bold text-gray-800 mb-2">
            Historique des Mouvements de Stock
          </h4>
          {renderContent()}
        </div>
      </td>
    </tr>
  );
}

// --- COMPOSANT PRINCIPAL : LA NOUVELLE LISTE DE PRODUITS ---
export default function ProductList({ initialProducts, categories }) {
  const [expandedProductId, setExpandedProductId] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelState, setPanelState] = useState({ mode: null, product: null });

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

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

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
  }, [initialProducts, searchQuery, categoryFilter, stockFilter, sortBy]);

  const getStockClass = (quantity) => {
    if (quantity === 0) return "text-red-600 font-bold";
    if (quantity <= 5) return "text-yellow-600 font-semibold";
    return "text-gray-800";
  };

  const handleConfirmArchive = async () => {
    if (!archiveConfirmation.productToArchive) return;

    const result = await archiveProduct(
      archiveConfirmation.productToArchive.id
    );
    if (result.error) {
      alert(result.error); // need a more sophisticated notification
    }

    // Close the modal
    setArchiveConfirmation({ isOpen: false, productToArchive: null });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Gestion de Stock</h1>
        <div className="content-end">
          <button
            onClick={() => setIsArrivalModalOpen(true)}
            className="px-3 py-2 mx-3 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Enregistrer un Arrivage
          </button>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            + Ajouter un Produit
          </button>
        </div>
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
      />

      <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow border">
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
              filteredAndSortedProducts.flatMap((product) => [
                <tr
                  key={product.id}
                  onClick={() => handleRowClick(product.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium bg-inherit">
                    <div className="flex items-center">
                      <svg
                        className={`w-4 h-4 mr-3 text-gray-400 transition-transform duration-200 ${
                          expandedProductId === product.id ? "rotate-90" : ""
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
                        className={`${getStockClass(product.stock_quantity)}`}
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
                        className="text-xs text-blue-600 hover:underline"
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
                      <button
                        onClick={() => {
                          setIsPanelOpen(true);
                          setPanelState({ mode: "edit", product: product });
                        }}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-normal px-4 py-1 rounded-md shadow-sm transition"
                      >
                        <Pencil size={14} />
                        Modifier
                      </button>
                      <form
                        action={async () => {
                          await archiveProduct(product.id);
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setArchiveConfirmation({
                              isOpen: true,
                              productToArchive: product,
                            })
                          }
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-normal px-4 py-1 rounded-md shadow-sm transition"
                        >
                          <Archive size={14} />
                          Archiver
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>,
                expandedProductId === product.id && (
                  <ProductHistoryRow
                    key={`${product.id}-history`}
                    product={product}
                  />
                ),
              ])
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
      </div>
      {isPanelOpen && (
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
        title="Archiver le produit ?"
        message={`Êtes-vous sûr de vouloir archiver le produit "${archiveConfirmation.productToArchive?.name}" ? Il n'apparaîtra plus dans les listes mais son historique sera conservé.`}
        onConfirm={handleConfirmArchive}
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
          products={initialProducts}
          onClose={() => setIsArrivalModalOpen(false)}
        />
      )}
    </>
  );
}
