"use client";

export default function InboxToolbar({ filters, onFilterChange }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="p-4 border-b bg-white flex flex-nowrap gap-4">
      {/* Search (for later) */}
      <input
        type="text"
        placeholder="Rechercher..."
        className="flex-1 p-2 border rounded-md min-w-0"
        disabled
      />

      <select
        name="platform"
        value={filters.platform}
        onChange={handleInputChange}
        className="flex-1 p-2 border rounded-md bg-white min-w-0"
      >
        <option value="all">Toutes les plateformes</option>
        <option value="facebook">Facebook</option>
        <option value="instagram">Instagram</option>
      </select>

      <select
        name="status"
        value={filters.status}
        onChange={handleInputChange}
        className="flex-1 p-2 border rounded-md bg-white min-w-0"
      >
        <option value="all">Tous les statuts</option>
        <option value="non lu">Non lus</option>
        <option value="lu">Lus</option>
        <option value="archivé">Archivés</option>
      </select>
      <select
        name="orderStatus"
        value={filters.orderStatus}
        onChange={handleInputChange}
        className="flex-1 p-2 border rounded-md bg-white min-w-0"
      >
        <option value="all">Tous les statuts</option>
        <option value="nouveaux">nouveaux</option>
        <option value="confirmé">confirmé</option>
        <option value="avec_livreur">avec livreur</option>
        <option value="livré">livré</option>
        <option value="annulé">annulé</option>
      </select>
    </div>
  );
}
