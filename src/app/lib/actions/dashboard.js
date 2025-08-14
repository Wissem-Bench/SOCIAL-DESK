"use server";
import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";

export async function checkMetaConnection() {
  const { supabase, user } = await getSupabaseWithUser();

  if (!user) {
    return { error: "Vous devez être connecté." };
  }
  const { count, error } = await supabase
    .from("social_connections")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) {
    console.error("Meta Connection Error:", error);
    return 0;
  }
  return count;
}

export async function getAdvancedDashboardStats({ supabase, user }) {
  const connectionResult = await supabase
    .from("social_connections")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count, error: connectionError } = connectionResult;

  if (connectionError) {
    console.error("Connection Error:", connectionError);
  }

  const { data, error } = await supabase.rpc("get_advanced_dashboard_stats");

  if (error) {
    console.error("Advanced Dashboard Stats RPC Error:", error);
    return { error: "Failed to load advanced dashboard statistics." };
  }

  return { stats: { ...data, count } };
}

export async function getRecentActivity({ supabase, user }) {
  // Fetch the 5 most recent orders with their customer's name
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      total_amount,
      order_number,
      customers ( full_name )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Recent Activity Error:", error);
    return { error: "Impossible de charger l'activité récente." };
  }

  // We can format the data here to be ready for the UI
  const formattedActivity = data.map((item) => ({
    type: "NOUVELLE COMMANDE",
    title: `Commande #${item.order_number} de ${
      item.customers?.full_name || "un client"
    }`,
    subtitle: `${new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(item.total_amount)}`,
    timestamp: item.created_at,
  }));

  return { activities: formattedActivity };
}
