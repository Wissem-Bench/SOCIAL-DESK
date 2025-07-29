// COMPONENT FOR THE TOOLBAR (FILTERS, SORTING, SEARCH)
export default function OrderToolbar({
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
        {/* 1. Search bar */}
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
        {/* 2. Filter by status */}
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
        {/* 3. Filter by customer */}
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
        {/* 4. Sorting */}
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
