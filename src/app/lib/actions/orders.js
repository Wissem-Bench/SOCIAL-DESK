"use server";

import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";
import { revalidatePath } from "next/cache";

// ACTION TO RETRIEVE ALL USER ORDERS
export async function getOrdersForUser(filters = {}) {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) throw new Error("Action non autorisée.");

  let query = supabase
    .from("orders")
    .select(
      `id, order_number, order_date, total_amount, status, delivery_service, tracking_number, customer_id, notes,
       customers ( id, full_name ),
       order_items ( quantity, products ( id, name ) )`
    )
    .eq("user_id", user.id);

  // --- SEARCH BY ORDER NUMBER ---
  // Apply filters
  if (filters.search) {
    console.log("filters.search", filters.search);
    query = query.eq("order_number", filters.search);
  }

  // --- FILTERS ---
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.client && filters.client !== "all") {
    query = query.eq("customer_id", filters.client);
  }

  // --- SORTING ---
  // On accepte tes valeurs actuelles de l’UI et on les mappe vers les colonnes réelles
  const sortMap = {
    order_number_asc: ["order_number", true],
    order_number_desc: ["order_number", false],
    date_asc: ["order_date", true], // <— UI envoie "date_*"
    date_desc: ["order_date", false],
    amount_asc: ["total_amount", true], // <— UI envoie "amount_*"
    amount_desc: ["total_amount", false],

    // on accepte aussi les versions explicites si jamais tu changes l’UI plus tard
    order_date_asc: ["order_date", true],
    order_date_desc: ["order_date", false],
    total_amount_asc: ["total_amount", true],
    total_amount_desc: ["total_amount", false],
  };

  const sortKey = filters.sort || "order_number_desc";
  const mapping = sortMap[sortKey];
  if (mapping) {
    const [col, asc] = mapping;
    query = query.order(col, { ascending: asc });
  }

  const { data, error } = await query;
  if (error) {
    console.error("Erreur BDD getOrdersForUser:", error);
    throw new Error("Impossible de récupérer les commandes.");
  }
  return data;
}

// ACTION TO GET THE DETAILED ITEMS FOR A SINGLE ORDER
export async function getOrderDetails(orderId) {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) throw new Error("Action non autorisée.");

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      notes,
      order_items (
        quantity,
        selling_price,
        products ( name )
      )
    `
    )
    .eq("id", orderId)
    .eq("user_id", user.id) // Security check
    .single();

  if (error) {
    console.error("Get Order Details Error:", error);
    throw new Error("Impossible de charger les détails de la commande.");
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
