"use server";

import { createClient } from "@/app/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  // We don't need to get the user here, as the RLS and the function's auth.uid() handle security.
  // The RPC will fail if the user is not authenticated.
  const { data, error } = await supabase.rpc("get_dashboard_stats");

  if (error) {
    console.error("Dashboard Stats RPC Error:", error);
    return { error: "Failed to load dashboard statistics." };
  }

  return { stats: data };
}
