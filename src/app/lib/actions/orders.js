"use server";

import { createClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ACTION TO RETRIEVE ALL USER ORDERS
export async function getOrdersForUser() {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté." };
  }

  // a query that retrieves orders and associated customer information,
  // for each order, the items and associated product information.
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customers ( full_name ),
      order_items (
        quantity,
        products ( name, price )
      )
    `
    )
    .eq("user_id", user.id)
    .order("order_date", { ascending: false });

  if (error) {
    console.error("Erreur BDD:", error.message);
    return { error: "Impossible de récupérer les commandes." };
  }

  return { orders: data };
}

// ACTION TO UPDATE ORDER STATUS
export async function updateOrderStatus(orderId, newStatus) {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Action non autorisée." };
  }

  // We call the PostgreSQL function that update order status and adjust stock simultaneously
  const { error } = await supabase.rpc("update_order_status_and_stock", {
    order_id_to_update: orderId,
    new_status: newStatus,
  });

  if (error) {
    console.error("Erreur RPC:", error.message);
    return { error: "Impossible de mettre à jour le statut." };
  }

  revalidatePath("/dashboard/orders");
  return { success: "Statut mis à jour." };
}
