"use server";

import { createClient } from "@/app/lib/supabase/server";

export async function getConversationsFromDB() {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();

  if (!user) {
    return { error: "Action non autorisée." };
  }

  // This powerful query fetches conversations and, for each one,
  // it fetches the related customer's name and all related messages.
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      customers ( full_name ),
      messages ( * )
    `
    )
    .eq("user_id", user.id)
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("Get Conversations from DB Error:", error);
    return { error: "Impossible de charger les conversations." };
  }

  return { conversations: data };
}
