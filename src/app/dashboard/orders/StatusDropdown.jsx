import { useState } from "react";
import { updateOrderStatus } from "@/app/lib/actions/orders";

// --- COMPONENT FOR STATUS SELECTOR ---
export default function StatusDropdown({ order, statuses }) {
  const [localStatus, setLocalStatus] = useState(order.status);
  const getStatusStyles = (status) => {
    const styles = {
      nouveau: "bg-blue-100 text-blue-800",
      confirmé: "bg-green-100 text-green-800",
      avec_livreur: "bg-yellow-100 text-yellow-800",
      livré: "bg-gray-200 text-gray-800",
      annulé: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  // Synchronize local state with props
  const [currentColorClass, setCurrentColorClass] = useState(
    getStatusStyles(order.status)
  );

  const handleSelectionChange = async (e) => {
    const newStatus = e.target.value;
    const previousStatus = localStatus;
    setLocalStatus(newStatus);
    setCurrentColorClass(getStatusStyles(newStatus));

    try {
      await updateOrderStatus(order.id, newStatus);
    } catch (error) {
      setLocalStatus(previousStatus);
      setCurrentColorClass(getStatusStyles(previousStatus));
    }
  };

  return (
    <select
      name="status"
      value={localStatus} // Controlled by the props
      onChange={handleSelectionChange}
      className={`capitalize block w-25 pl-3 pr-3 py-1 text-sm border-0 rounded-lg shadow-sm text-center outline-none transition-colors duration-150 ${currentColorClass}`}
      aria-label={`Statut de la commande ${order.order_number}`}
    >
      {statuses.map((status) => (
        <option key={status} value={status} className="bg-white text-black">
          {status.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}
