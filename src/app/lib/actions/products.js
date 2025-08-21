"use server";

import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";
import { revalidatePath } from "next/cache";

// ACTION TO GET PRODUCTS FROM THE LOGGED IN USER
export async function getProductsForUser({
  supabase,
  user,
  isArchived = false,
} = {}) {
  if (!supabase || !user) {
    ({ supabase, user } = await getSupabaseWithUser());
  }
  const { data, error } = await supabase
    .from("products")
    .select(
      `
    *,
    categories (
      id,
      name,
      user_id
    )
  `
    )
    .eq("user_id", user.id)
    .eq("is_archived", isArchived)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get Products Error:", error);
    throw new Error("Impossible de charger les produits.");
  }

  return data;
}

// ACTION TO ADD A PRODUCT
export async function addProduct(formData) {
  const { supabase, user } = await getSupabaseWithUser();

  const productData = {
    name: formData.get("name"),
    purchase_price: parseFloat(formData.get("purchase_price")) || null,
    selling_price: parseFloat(formData.get("selling_price")) || null,
    stock_quantity: parseInt(formData.get("stock_quantity"), 10),
    category_id: formData.get("category_id") || null,
    user_id: user.id,
  };

  if (
    !productData.name ||
    !productData.selling_price ||
    productData.stock_quantity === null
  ) {
    throw new Error("Veuillez remplir les champs obligatoires.");
  }

  const { error } = await supabase
    .from("products")
    .insert(productData)
    .select("*, categories ( id, name )")
    .single();

  if (error) {
    console.error("Erreur d'ajout:", error.message);
    throw new Error("Une erreur est survenue lors de l'ajout du produit.");
  }

  // refresh the product page to show the new addition
  revalidatePath("/dashboard/products");
  return { success: "Produit ajouté avec succès !" };
}

// ACTION TO UPDATE A PRODUCT
export async function updateProduct({ id, formData }) {
  const { supabase, user } = await getSupabaseWithUser();

  const productData = {
    name: formData.get("name"),
    selling_price: parseFloat(formData.get("selling_price")),
    purchase_price: parseFloat(formData.get("purchase_price")) || null,
    category_id: formData.get("category_id") || null,
  };

  if (!productData.name || !productData.selling_price) {
    throw new Error("Le nom et le prix de vente sont obligatoires.");
  }

  const { error } = await supabase
    .from("products")
    .update(productData)
    .match({ id: id, user_id: user.id });

  if (error) {
    console.error("Update Product Error:", error.message);
    return {
      error: "Une erreur est survenue lors de la modification du produit.",
    };
  }

  revalidatePath("/dashboard/products");
  return { success: "Produit modifié avec succès !" };
}

// ACTION TO MANUALLY ADJUST STOCK AND LOG THE MOVEMENT
export async function adjustStockQuantity(formData) {
  const { supabase, user } = await getSupabaseWithUser();

  const data = {
    productId: formData.get("productId"),
    newQuantity: parseInt(formData.get("newQuantity"), 10),
    reason: formData.get("reason"),
  };

  if (isNaN(data.newQuantity) || data.newQuantity < 0) {
    throw new Error("La quantité doit être un nombre positif.");
  }
  if (!data.reason) {
    data.reason = "Correction inventaire";
  }

  const { error } = await supabase.rpc("handle_stock_adjustment", {
    p_product_id: data.productId,
    p_new_quantity: data.newQuantity,
    p_reason: data.reason,
    p_user_id: user.id,
  });

  if (error) {
    console.error("Stock Adjustment RPC Error:", error);
    throw new Error("Impossible d'ajuster le stock.");
  }

  revalidatePath("/dashboard/products");
  return { success: "Stock ajusté avec succès." };
}

// --- ACTION TO RESTORE AN ARCHIVED PRODUCT ---
export async function restoreProduct(productId) {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) throw new Error("Action non autorisée.");

  const { error } = await supabase
    .from("products")
    .update({ is_archived: false })
    .match({ id: productId, user_id: user.id });

  if (error) {
    console.error("Restore Product Error:", error);
    throw new Error("Impossible de restaurer le produit.");
  }

  revalidatePath("/dashboard/products");
  return { success: "Produit restauré." };
}

// ACTION TO RECORD A BULK STOCK ARRIVAL
export async function recordStockArrival(data) {
  const { supabase, user } = await getSupabaseWithUser();

  const reason = data.reason;

  if (!reason || !data.items || data.items.length === 0) {
    throw new Error("La raison et au moins un produit sont requis.");
  }

  // The payload for our RPC function
  const payload = {
    p_user_id: user.id,
    p_reason: reason,
    p_items: data.items, // The array of items is passed as JSON
  };

  const { error } = await supabase.rpc("handle_stock_arrival", payload);

  if (error) {
    console.error("Stock Arrival RPC Error:", error);
    throw new Error("Impossible d'enregistrer l'arrivage.");
  }

  revalidatePath("/dashboard/products");
  return { success: "Arrivage enregistré avec succès." };
}

// ACTION TO ARCHIVE A PRODUCT
export async function archiveProduct(productId) {
  const { supabase, user } = await getSupabaseWithUser();

  const { error } = await supabase
    .from("products")
    .update({ is_archived: true })
    .match({ id: productId, user_id: user.id });

  if (error) {
    console.error("Archive Product Error:", error);
    throw new Error("Impossible d'archiver le produit.");
  }

  revalidatePath("/dashboard/products");
  return { success: "Produit archivé avec succès." };
}

// --- Get stock movements for a specific product ---
export async function getStockMovements(productId) {
  const { supabase, user } = await getSupabaseWithUser();

  // Security check: Ensure the product belongs to the user before fetching its history
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, stock_quantity")
    .eq("id", productId)
    .eq("user_id", user.id)
    .single();

  if (productError || !product) {
    throw new Error("Produit introuvable ou accès non autorisé.");
  }

  // Fetch all movements for this product, newest first
  const { data, error } = await supabase.rpc(
    "get_stock_movements_with_history",
    {
      p_product_id: productId,
      p_current_stock: product.stock_quantity,
    }
  );

  if (error) {
    console.error("Get Stock Movements Error:", error);
    throw new Error("Impossible de charger l'historique du stock.");
  }

  return data;
}
