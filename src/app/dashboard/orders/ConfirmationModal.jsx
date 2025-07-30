"use client";

import { useState } from "react";
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  showNoteInput = false,
  errorMessage = null,
}) {
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Pass the note back to the parent component
    onConfirm(note);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      aria-modal="true"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600 break-words whitespace-pre-line">
          {message}
        </p>

        {/* Conditionally render the note input */}
        {showNoteInput && (
          <div className="mt-4">
            <label
              htmlFor="cancellation_note"
              className="block text-sm font-medium text-gray-700"
            >
              Raison de l'annulation (optionnel)
            </label>
            <textarea
              id="cancellation_note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              className="mt-1 block w-full p-2 border rounded-md"
              placeholder="Ex: Demande du client, erreur de stock..."
            />
          </div>
        )}

        {/* Conditionally render the error message */}
        {errorMessage && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            Ne pas annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
          >
            Oui, confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
