"use server";

import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";

// A helper function to retrieve the user's Meta login
async function getMetaConnection() {
  const { supabase, user } = await getSupabaseWithUser();

  const { data: connection, error } = await supabase
    .from("social_connections")
    .select("access_token")
    .eq("user_id", user.id)
    .eq("platform", "facebook") // We assume a 'facebook' connection for now
    .single();

  if (error || !connection) throw new Error("Connexion Meta introuvable.");

  return connection;
}

// The main action to retrieve conversations
export async function getConversations() {
  try {
    const { access_token: userAccessToken } = await getMetaConnection();

    // Step 1: Get User Managed Pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`
    );
    const pagesData = await pagesResponse.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return {
        conversations: [],
        error: "Aucune page Facebook/Instagram connectée trouvée.",
      };
    }

    // For now, we take the first page of the list
    const page = pagesData.data[0];
    const pageAccessToken = page.access_token;

    // Step 2: Retrieve the conversations from this page with the messages
    // We request the participants and the messages (with their details) in a single request
    const convosResponse = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}/conversations?platform=messenger&fields=participants,messages{message,from,created_time}&access_token=${pageAccessToken}`
    );
    const convosData = await convosResponse.json();

    if (convosData.error) throw new Error(convosData.error.message);

    return { conversations: convosData.data || [] };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des conversations Meta:",
      error.message
    );
    return { conversations: [], error: error.message };
  }
}
