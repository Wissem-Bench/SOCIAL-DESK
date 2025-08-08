"use server";

import { createClient } from "@/app/lib/supabase/server";

async function handleNewMessage(messageEvent) {
  // Ignore messages sent by the page itself (echoes)
  if (messageEvent.message && messageEvent.message.is_echo) {
    console.log("Webhook: Ignoring echo message.");
    return;
  }

  const supabase = createClient();
  const pageId = messageEvent.recipient.id;
  const customerPlatformId = messageEvent.sender.id;

  // 1. Find which of our users this message belongs to, using the Page ID
  const { data: connection, error: connError } = await supabase
    .from("social_connections")
    .select("user_id")
    .eq("platform_page_id", pageId)
    .single();

  if (connError || !connection) {
    console.error(
      "Webhook: Could not find user for page ID:",
      pageId,
      connError
    );
    return;
  }
  const userId = connection.user_id;

  // 2. Find or create the customer profile
  const { data: customer, error: custError } = await supabase
    .from("customers")
    .upsert(
      {
        user_id: userId,
        platform_customer_id: customerPlatformId,
        platform: "facebook",
        full_name: `Client ${customerPlatformId.substring(0, 4)}`, // Placeholder name
      },
      { onConflict: "user_id, platform_customer_id, platform" }
    )
    .select()
    .single();

  if (custError) {
    console.error("Webhook: Error upserting customer:", custError);
    return;
  }

  // 3. Find or create the conversation thread
  const { data: conversation, error: convoError } = await supabase
    .from("conversations")
    .upsert(
      {
        user_id: userId,
        customer_id: customer.id,
        platform: "facebook",
        platform_conversation_id: customerPlatformId, // The conversation ID is the customer's ID for DMs
        status: "non lu",
        last_message_at: new Date(messageEvent.timestamp),
      },
      { onConflict: "user_id, platform, platform_conversation_id" }
    )
    .select()
    .single();

  if (convoError) {
    console.error("Webhook: Error upserting conversation:", convoError);
    return;
  }

  // 4. Insert the new message, avoiding duplicates
  const { error: msgError } = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    platform_message_id: messageEvent.message.mid,
    sender_id: customerPlatformId,
    recipient_id: pageId,
    content: messageEvent.message.text,
    sent_at: new Date(messageEvent.timestamp),
    sender_type: "client",
  });

  // Ignore duplicate message errors (code 23505), as Meta can send events more than once
  if (msgError && msgError.code !== "23505") {
    console.error("Webhook: Error inserting message:", msgError);
  } else {
    console.log(
      `Successfully processed message ${messageEvent.message.mid} for conversation ${conversation.id}`
    );
  }
}

export async function processWebhookEvent(payload) {
  if (payload.object === "page" && payload.entry) {
    for (const entry of payload.entry) {
      for (const event of entry.messaging) {
        if (event.message) {
          await handleNewMessage(event);
        }
      }
    }
  }
}
