"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { XCircleIcon } from "@heroicons/react/20/solid";
import {
  updateCustomer,
  createManualCustomer,
} from "@/app/lib/actions/customers"; // We will create this action
import SubmitButton from "@/app/components/ui/SubmitButton";

export default function CustomerPanel({ customerToEdit, onClose }) {
  const queryClient = useQueryClient();
  const isEditMode = !!customerToEdit;

  const { mutate: createCustomerMutation, isPending: isCreating } = useMutation(
    {
      mutationFn: createManualCustomer,
      onMutate: () => {
        const toastId = toast.loading("Ajout de client...");
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        toast.success("Client mis à jour !", { id: context.toastId });
        onClose();
      },
      onError: (error, variables, context) => {
        toast.error(`Erreur : ${error.message}`, { id: context.toastId });
      },
    }
  );

  const { mutate: updateCustomerMutation, isPending: isUpdating } = useMutation(
    {
      mutationFn: updateCustomer,
      onMutate: () => {
        const toastId = toast.loading("Mise à jour du client...");
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        toast.success("Client mis à jour !", { id: context.toastId });
        onClose();
      },
      onError: (error, variables, context) => {
        toast.error(`Erreur : ${error.message}`, { id: context.toastId });
      },
    }
  );

  const handleFormAction = (formData) => {
    if (isEditMode) {
      updateCustomerMutation({ id: customerToEdit.id, formData: formData });
    } else {
      createCustomerMutation(formData);
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
        <form
          action={handleFormAction}
          className="h-full flex flex-col bg-white shadow-xl w-full"
        >
          {/* --- PANEL HEADER --- */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {isEditMode
                    ? "Modifier le Client"
                    : "Ajouter un Nouveau Client"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {isEditMode
                    ? `Mettez à jour les informations de ${customerToEdit.full_name}.`
                    : "Créez une nouvelle fiche pour un contact externe."}
                </p>
              </div>
              <button
                type="button"
                className="p-1 rounded-md text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* --- FORM BODY --- */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="full_name"
                  id="fullName"
                  defaultValue={customerToEdit?.full_name || ""}
                  className="mt-1 block w-full p-2 border rounded-md"
                  required
                />
              </div>
              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium"
                >
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  id="phoneNumber"
                  defaultValue={customerToEdit?.phone_number || ""}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
              </div>
              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium">
                  Adresse
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows="3"
                  defaultValue={customerToEdit?.address || ""}
                  className="mt-1 block w-full p-2 border rounded-md"
                ></textarea>
              </div>
              {/* Platform (read-only) */}
              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plateforme d'origine
                  </label>
                  <p className="mt-1 text-sm text-gray-500 capitalize p-2 bg-gray-100 rounded-md">
                    {customerToEdit.platform}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* --- PANEL FOOTER --- */}
          <div className="flex-shrink-0 p-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
            >
              Annuler
            </button>
            <SubmitButton
              pendingText="Sauvegarde..."
              isPending={isPending}
              className={`px-4 py-2 rounded-md text-sm ${
                isPending
                  ? "bg-gray-300 text-gray-500"
                  : "text-white bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isEditMode ? "Enregistrer" : "Créer le client"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
