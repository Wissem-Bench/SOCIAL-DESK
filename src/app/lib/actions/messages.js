"use server";

import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";
import { revalidatePath } from "next/cache";

export async function sendMessage(formData) {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) throw new Error("Action non autorisée.");

  const messageText = formData.get("messageText");
  const conversationId = formData.get("conversationId");

  if (!messageText || !conversationId) {
    throw new Error("Données manquantes pour envoyer le message.");
  }

  // Step 1: Fetch the conversation to get the user_id and customer's platform ID.
  const { data: conversationData, error: convoError } = await supabase
    .from("conversations")
    .select("user_id, platform_conversation_id")
    .eq("id", conversationId)
    .single();

  if (convoError || !conversationData) {
    console.error(
      "SendMessage Error: Could not find conversation.",
      convoError
    );
    throw new Error("Conversation introuvable.");
  }

  // Step 2: Use the user_id from the conversation to get the social connection details.
  const { data: connectionData, error: connError } = await supabase
    .from("social_connections")
    .select("page_access_token, platform_page_id")
    .eq("user_id", conversationData.user_id)
    .single();

  if (connError || !connectionData || !connectionData.page_access_token) {
    console.error(
      "SendMessage Error: Could not find valid social connection.",
      connError
    );
    throw new Error("Connexion Meta invalide ou jeton de page manquant.");
  }

  const pageAccessToken = connectionData.page_access_token;
  const pageId = connectionData.platform_page_id;
  const customerPlatformId = conversationData.platform_conversation_id;

  // 2. Send the message via Meta Graph API
  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: customerPlatformId },
      message: { text: messageText },
      // --- THESE TWO LINES ARE THE FIX ---
      messaging_type: "MESSAGE_TAG", // We specify we're using a tag
      tag: "HUMAN_AGENT", // We use the human agent tag
    }),
  });

  const responseData = await response.json();

  if (!response.ok || responseData.error) {
    console.error("Meta API Error:", responseData.error);
    return {
      error: `Impossible d'envoyer le message: ${responseData.error.message}`,
    };
  }

  // 3. Save the sent message to our own database
  const { error: dbError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    platform_message_id: responseData.message_id, // Get the ID from Meta's response
    sender_id: pageId,
    recipient_id: customerPlatformId,
    content: messageText,
    sent_at: new Date(),
    sender_type: "vendeur", // The message is from us
  });

  if (dbError) {
    console.error("DB Save Error after sending message:", dbError);
    // The message was sent but not saved, this needs monitoring
    return {
      error: "Le message a été envoyé mais n'a pas pu être sauvegardé.",
    };
  }

  revalidatePath("/dashboard/inbox");
  return { success: true };
}
