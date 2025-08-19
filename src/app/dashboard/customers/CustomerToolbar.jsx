export default function CustomerToolbar({
  searchQuery,
  onSearchChange,
  platformFilter,
  onPlatformChange,
  sortBy,
  onSortChange,
  view,
  onViewChange,
  setPanelState,
}) {
  const viewOptions = [
    { key: "active", label: "Clients Actifs" },
    { key: "archived", label: "Clients Archivés" },
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

        <button
          onClick={() => setPanelState({ isOpen: true, customer: null })}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + Ajouter un client
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Bar */}
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700"
          >
            Rechercher
          </label>
          <input
            type="text"
            id="search"
            placeholder="Nom, Tél, Adresse..."
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
              onPlatformChange(e.target.value);
            }}
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm"
          >
            <option value="all">Toutes les plateformes</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="manual">Manuel</option>
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
            <option value="date_desc">Plus récent</option>
            <option value="date_asc">Plus ancien</option>
            <option value="name_asc">Nom (A-Z)</option>
            <option value="name_desc">Nom (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
