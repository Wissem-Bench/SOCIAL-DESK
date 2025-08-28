"use client";

export default function DashboardError({ error, reset }) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="text-center p-8">
      <h2 className="text-xl font-bold text-red-600">
        Quelque chose s'est mal passé !
      </h2>
      <div className="mt-4 flex items-center justify-center gap-x-4">
        {/* The "soft" re-render button from Next.js */}
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Réessayer
        </button>
        {/* The "hard" page refresh button */}
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Rafraîchir la page
        </button>
      </div>
    </div>
  );
}
