"use client";

import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/lib/actions/categories";
import { Pencil, Trash2, XCircleIcon } from "lucide-react";
import SubmitButton from "@/app/components/ui/SubmitButton";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";

export default function CategoryManagerModal({ initialCategories, onClose }) {
  const queryClient = useQueryClient();

  // Local UI state for inline editing
  const [editingId, setEditingId] = useState(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    category: null,
  });

  // --- MUTATIONS ---
  const { mutate: createCategoryMutation, isPending: isCreating } = useMutation(
    {
      mutationFn: createCategory,
      onMutate: () => {
        const toastId = toast.loading("Création de catégorie...");
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        if (data.error) {
          // This is a handled error (e.g., duplicate category)
          toast.error(data.error, { id: context.toastId });
        } else {
          // This is a true success
          queryClient.invalidateQueries({ queryKey: ["categories"] });
          toast.success("Catégorie ajoutée !", { id: context.toastId });
        }
      },
      onError: (error, variables, context) => {
        toast.error(`Erreur : ${error.message}`, { id: context.toastId });
        console.error("Mutation Error:", error);
      },
    }
  );

  const { mutate: updateCategoryMutation, isPending: isUpdating } = useMutation(
    {
      mutationFn: updateCategory,
      onMutate: () => {
        const toastId = toast.loading("Mise à jour de catégorie...");
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast.success("catégorie mis à jour !", { id: context.toastId });
        setEditingId(null); // Exit edit mode
      },
      onError: (error, variables, context) => {
        toast.error(`Erreur : ${error.message}`, { id: context.toastId });
        console.error("Mutation Error:", error);
      },
    }
  );

  const { mutate: deleteCategoryMutation, isPending: isDeleting } = useMutation(
    {
      mutationFn: deleteCategory,
      onMutate: () => {
        const toastId = toast.loading("Suppression de catégorie...");
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast.success("Catégorie supprimée !", { id: context.toastId });
        setDeleteConfirmation({ isOpen: false, category: null });
      },
      onError: (error, variables, context) => {
        toast.error(`Erreur : ${error.message}`, { id: context.toastId });
        console.error("Mutation Error:", error);
      },
    }
  );

  // --- HANDLERS ---
  const handleCreate = (formData) => {
    createCategoryMutation(formData);
    const form = document.getElementById("new-cat-form");
    form.reset();
  };

  const handleUpdate = (formData) => {
    updateCategoryMutation(formData);
  };

  const handleDeleteClick = (category) => {
    setDeleteConfirmation({
      isOpen: true,
      category: category,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.category) return;

    const formData = new FormData();
    formData.append("id", deleteConfirmation.category.id);
    deleteCategoryMutation(formData);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Gérer les Catégories</h2>
            <button type="button" onClick={onClose}>
              <XCircleIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {/* Add new category form */}
          <form
            action={handleCreate}
            id="new-cat-form"
            className="flex gap-2 mb-4"
          >
            <input
              name="name"
              type="text"
              placeholder="Nouvelle catégorie..."
              className="flex-grow p-2 border rounded-md"
              required
            />
            <SubmitButton
              pendingText="Ajout..."
              isPending={isCreating}
              className={`px-4 py-2 rounded-md text-sm ${
                isCreating
                  ? "bg-gray-300 text-gray-500"
                  : "text-white bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Ajouter
            </SubmitButton>
          </form>

          {/* List of existing categories */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {initialCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
              >
                {editingId === cat.id ? (
                  <form action={handleUpdate} className="flex-grow flex gap-2">
                    <input type="hidden" name="id" value={cat.id} />
                    <input
                      name="name"
                      type="text"
                      defaultValue={cat.name}
                      autoFocus
                      className="flex-grow p-1 border rounded-md"
                    />
                    <SubmitButton
                      pendingText="..."
                      isPending={isUpdating}
                      className={`text-sm ${
                        isUpdating ? "text-gray-500" : "text-green-600"
                      }`}
                    >
                      OK
                    </SubmitButton>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-sm"
                    >
                      Annuler
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="text-gray-800">{cat.name}</span>
                    <div className="flex gap-3">
                      <button onClick={() => setEditingId(cat.id)}>
                        <Pencil
                          size={16}
                          className="text-gray-500 hover:text-yellow-600"
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat)}
                        disabled={isDeleting}
                      >
                        <Trash2
                          size={16}
                          className="text-gray-500 hover:text-red-600"
                        />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title="Supprimer la catégorie ?"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${deleteConfirmation.category?.name}" ? Les produits associés ne seront plus classés.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmation({ isOpen: false, category: null })}
        isPending={isDeleting}
      />
    </>
  );
}
