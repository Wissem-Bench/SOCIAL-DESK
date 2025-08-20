"use server";

import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";
import { revalidatePath } from "next/cache";

// ACTION TO RETRIEVE ALL USER ORDERS
export async function getOrdersForUser({ supabase, user, filters = {} }) {
  // a query that retrieves orders and associated customer information,
  // for each order, the items and associated product information.
  let query = supabase
    .from("orders")
    .select(
      `*, customers ( full_name ), order_items ( quantity, products ( name ) )`
    )
    .eq("user_id", user.id);

  // Apply filters
  if (filters.search) {
    query = query.ilike("customers.full_name", `%${filters.search}%`); // Search by customer name
  }
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.client && filters.client !== "all") {
    query = query.eq("customer_id", filters.client);
  }

  // Apply sorting
  const [sortField, sortOrder] = (filters.sort || "order_number_desc").split(
    "_"
  );
  if (sortField && sortOrder) {
    query = query.order(sortField, { ascending: sortOrder === "asc" });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erreur BDD getOrdersForUser:", error);
    throw new Error("Impossible de récupérer les commandes.");
  }
  return data;
}

// CREATE ORDER FROM CONVERSATION
export async function createOrderFromConversation(customerDetails, orderItems) {
  const { supabase, user } = await getSupabaseWithUser();

  if (!customerDetails || !orderItems || orderItems.length === 0) {
    throw new Error("Données de commande invalides.");
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
    throw new Error("Impossible de créer la commande.");
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/inbox");

  return { success: "Commande créée avec succès !", orderId: newOrderId };
}

// ACTION TO UPDATE ORDER STATUS
export async function updateOrderStatus(orderId, newStatus) {
  const { supabase, user } = await getSupabaseWithUser();

  // We call the PostgreSQL function that update order status and adjust stock simultaneously
  const { error } = await supabase.rpc("update_order_status_and_stock", {
    order_id_to_update: orderId,
    new_status: newStatus,
  });

  if (error) {
    console.error("Erreur RPC:", error.message);
    throw new Error("Impossible de mettre à jour le statut.");
  }

  revalidatePath("/dashboard/orders");
  return { success: "Statut mis à jour." };
}

/**
 * Updates an entire order including its line items within a single transaction.
 * This function calls a PostgreSQL function in Supabase to ensure atomicity.
 * @param {string} orderId - The UUID of the order to update.
 * @param {object} data - The object containing all the new order data.
 * @returns {Promise<{success: boolean, error: object | null}>}
 */
export async function updateFullOrder({ orderId, data }) {
  const { supabase, user } = await getSupabaseWithUser();

  // Prepare the payload for the RPC (Remote Procedure Call)
  const payload = {
    p_order_id: orderId,
    p_user_id: user.id, // Pass user id for security check inside the PG function
    p_customer_id: data.customer_id,
    p_notes: data.notes,
    p_delivery_service: data.delivery_service,
    p_tracking_number: data.tracking_number,
    p_items: data.items, // The array of items is passed as JSON
  };

  // Call the PostgreSQL function using rpc()
  const { error: rpcError } = await supabase.rpc(
    "handle_order_update",
    payload
  );

  if (rpcError) {
    console.error("updateFullOrder: RPC Error:", rpcError);
    throw new Error("Impossible de mettre à jour la commande.");
  }

  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function createFullOrder(data) {
  const { supabase, user } = await getSupabaseWithUser();

  const delivery_service = data.delivery_service || "";
  const tracking_number = data.tracking_number || "";
  const payload = {
    p_user_id: user.id,
    p_customer_id: data.customer_id,
    p_notes: data.notes,
    p_delivery_service: delivery_service,
    p_tracking_number: tracking_number,
    p_items: data.items,
  };

  const { data: newOrderId, error: rpcError } = await supabase.rpc(
    "handle_order_create",
    payload
  );

  if (rpcError) {
    console.error("createFullOrder: RPC Error:", rpcError);
    return { success: false, error: { message: rpcError.message } };
  }

  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/orders");
  return { newOrderId };
}

// ACTION TO CANCEL AN ORDER AND ADD A NOTE
export async function cancelOrderWithNote(orderId, cancellationNote) {
  const { supabase, user } = await getSupabaseWithUser();

  // First, call the existing RPC to update status and restock inventory
  const { error: rpcError } = await supabase.rpc(
    "update_order_status_and_stock",
    {
      order_id_to_update: orderId,
      new_status: "annulé",
    }
  );

  if (rpcError) {
    console.error("RPC Error on cancel:", rpcError);
    throw new Error("Impossible de changer le statut.");
  }

  // If status update is successful, append the cancellation note
  if (cancellationNote) {
    // Fetch the current note
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("notes")
      .eq("id", orderId)
      .single();

    if (fetchError) {
      console.error("Fetch note error:", fetchError);
      throw new Error("Impossible de récupérer la note existante.");
    }

    // Create the new note by appending
    const newNote = currentOrder.notes
      ? `${currentOrder.notes}\n--- Annulation ---\n${cancellationNote}`
      : `--- Annulation ---\n${cancellationNote}`;

    const { error: updateError } = await supabase
      .from("orders")
      .update({ notes: newNote })
      .eq("id", orderId);

    if (updateError) {
      console.error("Note update error:", updateError);
      throw new Error("Impossible de sauvegarder la note d'annulation.");
    }
  }

  revalidatePath("/dashboard/orders");
  return { success: "Commande annulée avec succès." };
}
