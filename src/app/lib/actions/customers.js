"use server";

import { createClient } from "@/app/lib/supabase/server";

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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur BDD (getCustomers):", error.message);
    return { error: "Impossible de récupérer les clients." };
  }

  return { customers: data };
}

// ACTION TO RETRIEVE A CUSTOMER'S DETAILS AND ORDERS
export async function getCustomerDetails(customerId) {
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
    .single(); // We expect only one result

  if (error) {
    console.error("Erreur BDD (getCustomerDetails):", error.message);
    return { error: "Impossible de récupérer les détails du client." };
  }

  return { customer: data };
}
