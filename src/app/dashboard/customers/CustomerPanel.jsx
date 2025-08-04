"use client";

import { XCircleIcon } from "@heroicons/react/20/solid";
import { updateCustomer } from "@/app/lib/actions/customers"; // We will create this action

export default function CustomerPanel({ customerToEdit, onClose }) {
  // Bind the customer ID to the server action
  const updateCustomerWithId = updateCustomer.bind(null, customerToEdit.id);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
        <form
          action={async (formData) => {
            await updateCustomerWithId(formData);
            onClose();
          }}
          className="h-full flex flex-col bg-white shadow-xl w-full"
        >
          {/* --- PANEL HEADER --- */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Modifier le Client
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Mettez à jour les informations de {customerToEdit.full_name}.
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
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nom complet
                </label>
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  defaultValue={customerToEdit.full_name}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone_number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  id="phone_number"
                  defaultValue={customerToEdit.phone_number || ""}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Adresse
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows="3"
                  defaultValue={customerToEdit.address || ""}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                ></textarea>
              </div>
              {/* Platform (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plateforme d'origine
                </label>
                <p className="mt-1 text-sm text-gray-500 capitalize p-2 bg-gray-100 rounded-md">
                  {customerToEdit.platform}
                </p>
              </div>
            </div>
          </div>

          {/* --- PANEL FOOTER --- */}
          <div className="flex-shrink-0 p-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
