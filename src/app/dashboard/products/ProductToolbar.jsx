export default function ProductToolbar({
  view,
  onViewChange,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  stockFilter,
  onStockChange,
  sortBy,
  onSortChange,
  categories,
  setIsArrivalModalOpen,
  setIsCategoryModalOpen,
  setIsPanelOpen,
  setPanelState,
}) {
  const viewOptions = [
    { key: "active", label: "Produits Actifs" },
    { key: "archived", label: "Produits Archivés" },
  ];
  return (
    <div className="p-4 bg-gray-50 rounded-lg mb-6 border">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b pb-4 mb-4">
        <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg">
          {viewOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => onViewChange(option.key)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                view === option.key
                  ? "bg-white text-gray-800 shadow"
                  : // Small adjustment for better contrast on hover
                    "text-gray-600 hover:bg-gray-300/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="content-end">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            Gérer les catégories
          </button>
          <button
            onClick={() => setIsArrivalModalOpen(true)}
            className="px-3 py-2 mx-3 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Enregistrer un Arrivage
          </button>
          <button
            onClick={() => (
              setIsPanelOpen(true),
              setPanelState({ mode: "create", product: null })
            )}
            className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            + Ajouter un Produit
          </button>
        </div>
      </div>
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
