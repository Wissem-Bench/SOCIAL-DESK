"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";
import { randomUUID } from "crypto"; // Node.js built-in crypto module

// ACTION TO RETRIEVE ALL USER CUSTOMERS
export async function getCustomers({
  supabase,
  user,
  isArchived = false,
} = {}) {
  if (!supabase || !user) {
    ({ supabase, user } = await getSupabaseWithUser());
  }

  // We retrieve all clients linked to the logged in user ID
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", isArchived)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur BDD (getCustomers):", error.message);
    return { error: "Impossible de récupérer les clients." };
  }

  return { customers: data };
}

// ACTION TO RETRIEVE A CUSTOMER'S DETAILS AND ORDERS
export async function getCustomerOrders(customerId) {
  const { supabase, user } = await getSupabaseWithUser();

  // Powerful query that retrieves:
  // 1. Customer information
  // 2. All associated orders
  // 3. For each order, the items and product name.
  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      *,
      orders (
        id,
        order_number,
        order_date,
        total_amount,
        status,
        order_items (
          quantity,
          products ( name )
        )
      )
    `
    )
    .eq("id", customerId)
    .eq("user_id", user.id) // Security: we ensure that the client belongs to the user
    .order("order_number", { ascending: false, referencedTable: "orders" })
    .single(); // We expect only one result

  if (error) {
    console.error("Erreur BDD (getCustomerOrders):", error.message);
    return { error: "Impossible de récupérer les détails du client." };
  }

  return { customer: data };
}

// ACTION TO UPDATE ALL USER CUSTOMERS
export async function updateCustomer(customerId, formData) {
  const { supabase, user } = await getSupabaseWithUser();

  const customerData = {
    full_name: formData.get("full_name"),
    phone_number: formData.get("phone_number"),
    address: formData.get("address"),
  };

  try {
    const { error } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", customerId);

    if (error) throw error;

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { error: "Failed to update customer." };
  }
}

/**
 * Archives a customer by setting their 'is_archived' flag to true.
 * @param {string} customerId - The ID of the customer to archive.
 */
export async function archiveCustomer(customerId) {
  const { supabase, user } = await getSupabaseWithUser();

  try {
    const { error } = await supabase
      .from("customers")
      .update({ is_archived: true })
      .eq("id", customerId);

    if (error) throw error;

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    console.error("Error archiving customer:", error);
    return { error: "Failed to archive customer." };
  }
}

// very similar to getCustomerDetails, but tailored for the inbox context.
export async function getCustomerDetailsForInbox(customerId) {
  const { supabase, user } = await getSupabaseWithUser();

  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      *,
      orders ( id, order_number, order_date, total_amount, status )
    `
    )
    .eq("id", customerId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("getCustomerDetailsForInbox Error:", error);
    return { error: "Impossible de récupérer les détails du client." };
  }

  return { customer: data };
}

// ACTION TO MANUALLY CREATE A NEW CUSTOMER
export async function createManualCustomer(formData) {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) return { error: "Action non autorisée." };

  const fullName = formData.get("full_name")?.toString().trim();
  if (!fullName) {
    return { error: "Le nom complet est requis." };
  }

  const customerData = {
    user_id: user.id,
    full_name: fullName,
    phone_number: formData.get("phone_number")?.toString() || null,
    address: formData.get("address")?.toString() || null,
    platform: "manual",
    // We generate a random UUID for the platform_customer_id to satisfy the NOT NULL and UNIQUE constraints
    platform_customer_id: randomUUID(),
  };

  const { error } = await supabase.from("customers").insert(customerData);

  if (error) {
    console.error("Create Manual Customer Error:", error);
    return { error: "Impossible de créer le client." };
  }

  revalidatePath("/dashboard/customers");
  return { success: "Client ajouté avec succès." };
}

export async function addProspectAsCustomer(
  conversationId,
  platformCustomerId,
  platform,
  name
) {
  const { supabase, user } = await getSupabaseWithUser();

  // Step 1: Create the new customer record
  const { data: newCustomer, error: custError } = await supabase
    .from("customers")
    .insert({
      user_id: user.id,
      platform_customer_id: platformCustomerId,
      platform: platform,
      full_name: name,
    })
    .select()
    .single();

  if (custError) {
    // Handle case where customer might have been created in another tab
    if (custError.code === "23505") {
      return { error: "Ce client existe déjà." };
    }
    return { error: "Impossible de créer le client." };
  }

  // Step 2: Update the conversation to link it to the new customer
  // and clear the prospect_name
  const { error: convoError } = await supabase
    .from("conversations")
    .update({ customer_id: newCustomer.id, prospect_name: null })
    .eq("id", conversationId);

  if (convoError) {
    return { error: "Impossible de lier le client à la conversation." };
  }

  revalidatePath("/dashboard/inbox");
  return { success: true, customer: newCustomer };
}

// --- Restore an archived customer ---
export async function restoreCustomer(customerId) {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) return { error: "Action non autorisée." };

  const { error } = await supabase
    .from("customers")
    .update({ is_archived: false }) // Set the flag back to false
    .match({ id: customerId, user_id: user.id });

  if (error) {
    console.error("Restore Customer Error:", error);
    return { error: "Impossible de restaurer le client." };
  }

  revalidatePath("/dashboard/customers");
  return { success: "Client restauré avec succès." };
}
