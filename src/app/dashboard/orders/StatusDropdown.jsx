import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  updateOrderStatus,
  cancelOrderWithNote,
} from "@/app/lib/actions/orders";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

// --- COMPONENT FOR STATUS SELECTOR ---
export default function StatusDropdown({ order }) {
  const queryClient = useQueryClient();
  const [localStatus, setLocalStatus] = useState(order.status);

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

  // --- MUTATION FOR STATUS CHANGE ---
  const { mutate: updateStatusMutation, isPending } = useMutation({
    // The mutation function will decide which server action to call
    mutationFn: async ({ newStatus, note }) => {
      if (newStatus === "annulé") {
        return cancelOrderWithNote(order.id, note);
      }
      return updateOrderStatus(order.id, newStatus);
    },
    onMutate: () => {
      const toastId =
        confirmation.newStatus === "annulé"
          ? toast.loading("Annulation de commande...")
          : toast.loading("Mise à jour de statut de commande...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      // On success, invalidate all 'orders' queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      handleCloseModal();
      if (confirmation.newStatus === "annulé") {
        toast.success("Commande annulée !", { id: context.toastId });
      } else {
        toast.success("Statut modifié !", { id: context.toastId });
      }
    },
    onError: (error, variables, context) => {
      toast.error(`Erreur : ${error.message}`, { id: context.toastId });
    },
  });

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

  const handleSelectionChange = (e) => {
    const newStatus = e.target.value;
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
  const handleConfirm = (note) => {
    if (!confirmation.newStatus) return;
    updateStatusMutation({ newStatus: confirmation.newStatus, note: note });
  };

  const handleCloseModal = () => {
    // We reset the visual state of the dropdown in case of cancellation
    const select = document.getElementById(`status-select-${order.id}`);
    if (select) select.value = order.status;

    setError(null);
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
        isPending={isPending}
      />
      <select
        id={`status-select-${order.id}`}
        name="status"
        value={localStatus}
        onChange={handleSelectionChange}
        disabled={isPending}
        className={`capitalize block w-full py-1 text-sm border-gray-300 rounded-md shadow-sm text-center outline-none transition-colors duration-150 ${getStatusStyles(
          localStatus
        )}`}
        aria-label={`Statut de la commande ${order.order_number}`}
      >
        {/* 3. --- Map over the DYNAMIC list of available statuses --- */}
        {availableStatuses.map((status) => (
          <option key={status} value={status} className="bg-white text-black">
            {status.replace(/_/g, " ")}
            {status === "livré" ? " ✓" : ""}
          </option>
        ))}
      </select>
    </>
  );
}
