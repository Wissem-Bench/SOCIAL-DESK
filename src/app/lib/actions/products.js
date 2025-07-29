"use server";

import { createClient, createClientAsync } from "@/app/lib/supabase/server";
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
    .select("*")
    .eq("user_id", user.id)
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

  const { name, price, stock_quantity } = Object.fromEntries(
    formData.entries()
  );

  if (!name || !price || stock_quantity === null) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  const { error } = await supabase.from("products").insert({
    name,
    price: parseFloat(price),
    stock_quantity: parseInt(stock_quantity, 10),
    user_id: user.id,
  });

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
    return redirect("/login");
  }

  const { name, price, stock_quantity } = Object.fromEntries(
    formData.entries()
  );

  if (!name || !price || stock_quantity === null) {
    return { error: "Les champs ne peuvent pas être vides." };
  }

  const { error } = await supabase
    .from("products")
    .update({
      name,
      price: parseFloat(price),
      stock_quantity: parseInt(stock_quantity, 10),
    })
    .match({ id: productId, user_id: user.id });

  if (error) {
    console.error("Erreur de mise à jour:", error.message);
    return { error: "Impossible de mettre à jour le produit." };
  }

  revalidatePath("/dashboard/products");
  return { success: "Produit mis à jour !" };
}

// ACTION TO UPDATE ONLY THE STOCK QUANTITY OF A PRODUCT
export async function updateStockQuantity(productId, newQuantity) {
  // the new quantity should be a non-negative number
  const quantity = Math.max(0, Number(newQuantity));

  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Unauthorized action." };
  }

  const { error } = await supabase
    .from("products")
    .update({ stock_quantity: quantity })
    .match({ id: productId, user_id: user.id });

  if (error) {
    console.error("Stock Update Error:", error.message);
    return { error: "Failed to update stock." };
  }

  revalidatePath("/dashboard/products");
  return { success: "Stock updated." };
}

// ACTION TO DELETE A PRODUCT
export async function deleteProduct(productId) {
  const supabase = await createClient();

  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // We check that the product belongs to the user before deleting
  const { error } = await supabase
    .from("products")
    .delete()
    .match({ id: productId, user_id: user.id });

  if (error) {
    console.error("Erreur de suppression:", error.message);
    return { error: "Impossible de supprimer le produit." };
  }

  revalidatePath("/dashboard/products");
  return { success: "Produit supprimé." };
}
