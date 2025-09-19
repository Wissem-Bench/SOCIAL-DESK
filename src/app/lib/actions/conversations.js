"use server";

import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";

export async function getConversationsFromDB(filters = {}) {
  const { supabase, user } = await getSupabaseWithUser();

  // All the complex query logic is inside the PostgreSQL function.
  const { data, error } = await supabase.rpc("get_filtered_conversations", {
    p_user_id: user.id,
    p_platform: filters.platform || "all",
    p_status: filters.status || "all",
    p_order_status: filters.orderStatus || "all",
  });

  if (error) {
    console.error("RPC get_filtered_conversations Error:", error);
    throw new Error("Impossible de charger les conversations.");
  }

  // The RPC function returns an array of JSON objects.
  return { conversations: data };
}
