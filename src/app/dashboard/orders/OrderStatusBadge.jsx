export default function OrderStatusBadge({ status }) {
  const statusStyles = {
    nouveau: "bg-blue-100 text-blue-800",
    confirmé: "bg-green-100 text-green-800",
    avec_livreur: "bg-yellow-100 text-yellow-800",
    livré: "bg-gray-100 text-gray-800",
    annulé: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        statusStyles[status] || "bg-gray-100"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
