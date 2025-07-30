import { useState, useEffect } from "react";
import {
  updateOrderStatus,
  cancelOrderWithNote,
} from "@/app/lib/actions/orders";
import ConfirmationModal from "./ConfirmationModal";

// --- COMPONENT FOR STATUS SELECTOR ---
export default function StatusDropdown({ order }) {
  const [localStatus, setLocalStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: "",
    message: "",
    newStatus: null,
    isCancellation: false,
  });

  const [error, setError] = useState(null);

  // This useEffect ensures the component updates if the parent data changes
  useEffect(() => {
    setLocalStatus(order.status);
  }, [order.status]);

  // Define the allowed transitions (our state machine) ---
  const allowedTransitions = {
    nouveau: ["confirmé", "annulé"],
    confirmé: ["avec_livreur", "annulé"],
    avec_livreur: ["livré", "annulé"],
    livré: ["annulé"], // Represents a return
    annulé: [], // Final state, no possible transitions
  };

  // --- Determine which statuses are available for this specific order ---
  // It's always the current status, plus the allowed next steps.
  const availableStatuses = [
    order.status,
    ...(allowedTransitions[order.status] || []),
  ];

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

  const handleSelectionChange = async (e) => {
    const newStatus = e.target.value;
    setIsUpdating(true);
    if (newStatus === order.status) return;
    setError(null);
    const messages = {
      confirmé: {
        title: "Confirmer la commande ?",
        message:
          "La commande ne sera plus modifiable par la suite. Continuer ?",
      },
      avec_livreur: {
        title: "Marquer comme expédiée ?",
        message: "La commande passera au statut 'Avec livreur'.",
      },
      livré: {
        title: "Marquer comme livrée ?",
        message: "Ceci finalise le cycle de vente pour cette commande.",
      },
      annulé: {
        title: "Annuler la commande ?",
        message:
          "Le stock déduit sera réintégré. Cette action est irréversible. Confirmer l'annulation ?",
      },
    };
    setConfirmation({
      isOpen: true,
      newStatus: newStatus,
      isCancellation: newStatus === "annulé",
      ...(messages[newStatus] || {
        title: "Confirmer le changement ?",
        message: "Êtes-vous sûr de vouloir changer le statut ?",
      }),
    });
  };

  // This function is called when the user clicks "Yes" in the modal
  const handleConfirm = async (note) => {
    if (!confirmation.newStatus) return;

    setIsUpdating(true);
    setError(null);
    let result;
    if (confirmation.isCancellation) {
      result = await cancelOrderWithNote(order.id, note);
    } else {
      result = await updateOrderStatus(order.id, confirmation.newStatus);
    }

    if (result.error) {
      // Set the error message to be displayed in the modal
      setError(`Erreur: ${result.error}`);
    } else {
      // On success, close the modal. Revalidation will do the rest.
      handleCloseModal();
    }

    // setConfirmation({ isOpen: false, title: "", message: "", newStatus: null });
    setIsUpdating(false);
  };

  const handleCloseModal = () => {
    // // Reset the dropdown to its original value if the user cancels
    // const selectElement = document.querySelector(
    //   `select[name="status"][value="${localStatus}"]`
    // );
    // if (selectElement) selectElement.value = order.status;

    // setConfirmation({ isOpen: false, title: "", message: "", newStatus: null });
    setError(null); // Reset error when closing
    setConfirmation({
      isOpen: false,
      title: "",
      message: "",
      newStatus: null,
      isCancellation: false,
    });
  };

  // If the status is 'annulé', it's a final state. We display it as text.
  if (order.status === "annulé") {
    return (
      <span
        className={`capitalize block w-full py-1 text-sm border-gray-300 rounded-md shadow-sm text-center outline-none transition-colors duration-150 ${getStatusStyles(
          "annulé"
        )}`}
      >
        Annulé
      </span>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={handleConfirm}
        onClose={handleCloseModal}
        showNoteInput={confirmation.isCancellation}
        errorMessage={error}
      />
      <select
        name="status"
        value={localStatus}
        onChange={handleSelectionChange}
        disabled={isUpdating}
        className={`capitalize block w-full py-1 text-sm border-gray-300 rounded-md shadow-sm text-center outline-none transition-colors duration-150 ${getStatusStyles(
          localStatus
        )}`}
        aria-label={`Statut de la commande ${order.order_number}`}
      >
        {/* 3. --- Map over the DYNAMIC list of available statuses --- */}
        {availableStatuses.map((status) => (
          <option key={status} value={status} className="bg-white text-black">
            {status.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </>
  );
}
