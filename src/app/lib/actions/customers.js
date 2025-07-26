"use server";

import { createClient } from "@/app/lib/supabase/server";

// ACTION POUR RÉCUPÉRER TOUS LES CLIENTS DE L'UTILISATEUR
export async function getCustomers() {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) return { error: "Action non autorisée." };

  // On récupère tous les clients liés à l'ID de l'utilisateur connecté
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

// ACTION POUR RÉCUPÉRER LE DÉTAIL D'UN CLIENT ET SES COMMANDES
export async function getCustomerDetails(customerId) {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) return { error: "Action non autorisée." };

  // Requête puissante qui récupère :
  // 1. Les infos du client
  // 2. Toutes ses commandes associées
  // 3. Pour chaque commande, les articles et le nom du produit.
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
    .eq("user_id", user.id) // Sécurité : on s'assure que le client appartient bien à l'utilisateur
    .single(); // On attend un seul résultat

  if (error) {
    console.error("Erreur BDD (getCustomerDetails):", error.message);
    return { error: "Impossible de récupérer les détails du client." };
  }

  return { customer: data };
}
