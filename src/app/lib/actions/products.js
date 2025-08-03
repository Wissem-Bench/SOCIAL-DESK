"use server";

import { createClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ACTION TO GET PRODUCTS FROM THE LOGGED IN USER
export async function getProductsForUser() {
  const supabase = await createClient();

  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté pour voir vos produits." };
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
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur de BDD:", error.message);
    return { error: "Impossible de récupérer les produits." };
  }

  return { products: data };
}

// ACTION TO ADD A PRODUCT
export async function addProduct(formData) {
  const supabase = await createClient();
  const auth = supabase.auth;

  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return redirect("/login");
  }

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
    return { error: "Veuillez remplir les champs obligatoires." };
  }

  const { error } = await supabase.from("products").insert(productData);

  if (error) {
    console.error("Erreur d'ajout:", error.message);
    return { error: "Une erreur est survenue lors de l'ajout du produit." };
  }

  // refresh the product page to show the new addition
  revalidatePath("/dashboard/products");
  return { success: "Produit ajouté avec succès !" };
}

// ACTION TO UPDATE A PRODUCT
export async function updateProduct(productId, formData) {
  const supabase = await createClient();
  let auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Action non autorisée." };
  }

  const productData = {
    name: formData.get("name"),
    selling_price: parseFloat(formData.get("selling_price")),
    purchase_price: parseFloat(formData.get("purchase_price")) || null,
    category_id: formData.get("category_id") || null,
  };

  if (!productData.name || !productData.selling_price) {
    return { error: "Le nom et le prix de vente sont obligatoires." };
  }

  const { error } = await supabase
    .from("products")
    .update(productData)
    .match({ id: productId, user_id: user.id });

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
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Action non autorisée." };
  }

  const data = {
    productId: formData.get("productId"),
    newQuantity: parseInt(formData.get("newQuantity"), 10),
    reason: formData.get("reason"),
  };

  if (isNaN(data.newQuantity) || data.newQuantity < 0) {
    return { error: "La quantité doit être un nombre positif." };
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
    return { error: "Impossible d'ajuster le stock." };
  }

  revalidatePath("/dashboard/products");
  return { success: "Stock ajusté avec succès." };
}

// ACTION TO RECORD A BULK STOCK ARRIVAL
export async function recordStockArrival(data) {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Action non autorisée." };
  }

  const reason = data.res;

  if (!reason || !data.items || data.items.length === 0) {
    console.log("data", data);
    return { error: "La raison et au moins un produit sont requis." };
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
    return { error: "Impossible d'enregistrer l'arrivage." };
  }

  revalidatePath("/dashboard/products");
  return { success: "Arrivage enregistré avec succès." };
}

// ACTION TO ARCHIVE A PRODUCT
export async function archiveProduct(productId) {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Action non autorisée." };
  }

  const { error } = await supabase
    .from("products")
    .update({ is_archived: true })
    .match({ id: productId, user_id: user.id });

  if (error) {
    console.error("Archive Product Error:", error);
    return { error: "Impossible d'archiver le produit." };
  }

  revalidatePath("/dashboard/products");
  return { success: "Produit archivé avec succès." };
}

// ACTION TO GET CATEGORIES
export async function getCategories() {
  const supabase = await createClient();

  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté pour voir vos categories." };
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch enum values:", error.message);
    return { error: "Failed to fetch enum values" };
  }

  return { categories: data, error };
}

// --- ACTION TO CREATE NEW CATEGORY ---
export async function createCategory(formData) {
  const categoryName = formData.get("name");
  if (!categoryName) return { error: "Category name is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized." };

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
    return { error: "Failed to create category." };
  }

  revalidatePath("/dashboard/products");
  return { category: data };
}

// --- Get stock movements for a specific product ---
export async function getStockMovements(productId) {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Action non autorisée." };
  }

  // Security check: Ensure the product belongs to the user before fetching its history
  const { data: productData, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("user_id", user.id)
    .single();

  if (productError || !productData) {
    return { error: "Produit introuvable ou accès non autorisé." };
  }

  // Fetch all movements for this product, newest first
  const { data, error } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get Stock Movements Error:", error);
    return { error: "Impossible de charger l'historique du stock." };
  }

  return { movements: data };
}
