"use server";

import { createClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ACTION TO RETRIEVE ALL USER CUSTOMERS
export async function getCustomers() {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) return { error: "Action non autorisée." };

  // We retrieve all clients linked to the logged in user ID
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur BDD (getCustomers):", error.message);
    return { error: "Impossible de récupérer les clients." };
  }

  return { customers: data };
}

// ACTION TO RETRIEVE A CUSTOMER'S DETAILS AND ORDERS
export async function getCustomerOrders(customerId) {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) return { error: "Action non autorisée." };

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
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) return { error: "Action non autorisée." };

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
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { success: false, error: { message: "User not authenticated." } };
  }

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
