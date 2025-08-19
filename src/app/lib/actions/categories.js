"use server";

import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";
import { revalidatePath } from "next/cache";

// ACTION TO GET CATEGORIES
export async function getCategories() {
  const { supabase, user } = await getSupabaseWithUser();

  if (!user) return { error: "Action non autorisée." };

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch category values");
  }

  return { categories: data, error };
}

// --- ACTION TO CREATE NEW CATEGORY ---
export async function createCategory(formData) {
  const categoryName = formData.get("name");
  if (!categoryName) return { error: "Category name is required." };

  const { supabase, user } = await getSupabaseWithUser();

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: categoryName.trim(), user_id: user.id })
    .select()
    .single();

  if (error) {
    // Handles duplicate category names gracefully
    if (error.code === "23505") {
      return { error: `La categorie "${categoryName}" existe déjà.` };
    }
    console.error("Create Category Error:", error);
    throw new Error("Failed to create category.");
  }

  revalidatePath("/dashboard/products");
  return { category: data };
}

// --- ACTION TO UPDATE CATEGORY ---
export async function updateCategory(formData) {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) return { error: "Action non autorisée." };

  const categoryId = formData.get("id");
  const newName = formData.get("name")?.toString().trim();

  if (!newName || !categoryId) return { error: "Données invalides." };

  const { data, error } = await supabase
    .from("categories")
    .update({ name: newName })
    .match({ id: categoryId, user_id: user.id })
    .select()
    .single();

  if (error) {
    throw new Error("Impossible de modifier la catégorie.");
  }

  revalidatePath("/dashboard/products");
  return { category: data };
}

// --- ACTION TO DELETE A CATEGORY ---
export async function deleteCategory(formData) {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) return { error: "Action non autorisée." };

  const categoryId = formData.get("id");
  if (!categoryId) return { error: "ID de catégorie manquant." };

  const { error } = await supabase
    .from("categories")
    .delete()
    .match({ id: categoryId, user_id: user.id });

  if (error) {
    throw new Error("Impossible de supprimer la catégorie.");
  }

  revalidatePath("/dashboard/products");
  return { success: true, deletedId: categoryId };
}
