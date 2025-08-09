"use server";

async function handleNewMessage(supabase, messageEvent) {
  // Ignore messages sent by the page itself (echoes)
  if (messageEvent.message && messageEvent.message.is_echo) {
    console.log("Webhook: Ignoring echo message.");
    return;
  }

  const pageId = messageEvent.recipient.id;
  const customerPlatformId = messageEvent.sender.id;

  console.log(
    `[Checkpoint 1] Processing message from ${customerPlatformId} to Page ${pageId}`
  );

  // 1. Find which of our users this message belongs to, using the Page ID
  console.log(
    `[Checkpoint 2] Searching for user connected to Page ID: ${pageId}...`
  );

  let connection = null,
    connError = null;

  try {
    const { data, error } = await supabase
      .from("social_connections")
      .select("user_id")
      .eq("platform_page_id", pageId)
      .single();

    if (error) {
      console.error("Supabase query error:", error);
      connError = error;
    } else {
      connection = data;
      console.log("Connection found:", connection);
      throw new Error("Connection found, proceeding with user ID.");
    }
  } catch (err) {
    console.error("Unexpected error during Supabase query:", err);
  }

  if (connError || !connection) {
    console.error(
      `[FAIL] No user found for Page ID ${pageId}. Check social_connections table. Error:`,
      connError
    );
    console.error(
      "Webhook: Could not find user for page ID:",
      pageId,
      connError
    );
    return;
  }
  const userId = connection.user_id;
  console.log(`[Checkpoint 3] Found User ID: ${userId}`);

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
    console.error(`[FAIL] Could not upsert customer.`, custError);
    return;
  }
  console.log(`[Checkpoint 5] Customer OK. DB ID: ${customer.id}`);

  // 3. Find or create the conversation thread
  console.log(`[Checkpoint 6] Upserting conversation...`);
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
  console.log(`[Checkpoint 7] Conversation OK. DB ID: ${conversation.id}`);

  // 4. Insert the new message, avoiding duplicates
  console.log(
    `[Checkpoint 8] Inserting message with platform ID: ${messageEvent.message.mid}`
  );
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
    console.log(
      `[SUCCESS] Message ${messageEvent.message.mid} processed successfully.`
    );
  }
}

export async function processWebhookEvent(supabase, payload) {
  if (payload.object === "page" && payload.entry) {
    for (const entry of payload.entry) {
      for (const event of entry.messaging) {
        if (event.message) {
          await handleNewMessage(supabase, event);
        }
      }
    }
  }
  console.log("[END] processWebhookEvent function finished.");
}
