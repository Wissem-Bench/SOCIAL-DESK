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
      order_number, 
      delivery_service,
      tracking_number,
      notes,
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

// CREATE ORDER FROM CONVERSATION
export async function createOrderFromConversation(customerDetails, orderItems) {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) return { error: "Action non autorisée." };

  if (!customerDetails || !orderItems || orderItems.length === 0) {
    return { error: "Données de commande invalides." };
  }

  const { error, data: newOrderId } = await supabase.rpc(
    "create_order_from_conversation",
    {
      p_user_id: user.id,
      p_customer_platform_id: customerDetails.id,
      p_customer_name: customerDetails.name,
      p_platform: "facebook", // To be dynamic later
      p_order_items: orderItems,
    }
  );

  if (error) {
    console.error("Erreur RPC create_order:", error);
    return { error: "Impossible de créer la commande." };
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/inbox");

  return { success: "Commande créée avec succès !", orderId: newOrderId };
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

// ACTION TO UPDATE ORDER DELIVERY DETAILS AND NOTES
export async function updateOrderDetails(orderId, formData) {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Action non autorisée." };
  }

  // Extract data from the form
  const orderDetails = {
    delivery_service: formData.get("delivery_service"),
    tracking_number: formData.get("tracking_number"),
    notes: formData.get("notes"),
  };

  // Update the specific order in the database
  const { error } = await supabase
    .from("orders")
    .update(orderDetails)
    .match({ id: orderId, user_id: user.id });

  if (error) {
    console.error("Order Details Update Error:", error);
    return { error: "Impossible de mettre à jour les détails de la commande." };
  }

  revalidatePath("/dashboard/orders");
  return { success: "Détails de la commande mis à jour." };
}
