"use server";

import { createClient } from "@/app/lib/supabase/server";

export async function checkMetaConnection() {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  const connectionResult = await supabase
    .from("social_connections")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count, error: connectionError } = connectionResult;

  if (connectionError) {
    console.error("Meta Connection Error:", connectionError);
  }
  return count;
}

export async function getAdvancedDashboardStats(period = "last_30_days") {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  const connectionResult = await supabase
    .from("social_connections")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count, error: connectionError } = connectionResult;

  console.log("count", count);

  if (connectionError) {
    console.error("Connection Error:", connectionError);
  }

  const { data, error } = await supabase.rpc("get_advanced_dashboard_stats", {
    p_period: period,
  });

  if (error) {
    console.error("Advanced Dashboard Stats RPC Error:", error);
    return { error: "Failed to load advanced dashboard statistics." };
  }

  return { stats: { ...data, count } };
}

export async function getRecentActivity() {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Action non autorisée." };
  }

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
