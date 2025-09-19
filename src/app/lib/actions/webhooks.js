"use server";

async function handleNewMessage(supabase, messageEvent) {
  // Ignore messages sent by the page itself (echoes)
  if (messageEvent.message && messageEvent.message.is_echo) {
    return;
  }

  const pageId = messageEvent.recipient.id;
  const customerPlatformId = messageEvent.sender.id;

  // 1. Find our user AND the page_access_token linked to this page ID
  const { data: connection, error: connError } = await supabase
    .from("social_connections")
    .select("user_id, page_access_token")
    .eq("platform_page_id", pageId)
    .single();

  if (connError || !connection) {
    /* ... */ return;
  }

  const userId = connection.user_id;
  const pageAccessToken = connection.page_access_token; // <-- We get the token here

  if (!pageAccessToken) {
    console.error(
      `Webhook: Missing page_access_token for page ${pageId}. Please re-authenticate.`
    );
    return;
  }

  // 2. Fetch the prospect's name from Meta API
  let prospectName = `Prospect ${customerPlatformId.substring(0, 4)}`; // Fallback
  try {
    const response = await fetch(
      `https://graph.facebook.com/${customerPlatformId}?fields=name&access_token=${pageAccessToken}`
    );
    const profileData = await response.json();
    if (response.ok && profileData.name) {
      prospectName = profileData.name;
    }
  } catch (e) {
    console.error("Failed to fetch prospect name", e);
  }

  // 3. Check if this prospect is already a customer
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", userId)
    .eq("platform_customer_id", customerPlatformId)
    .single();

  // 4. Find or create the conversation thread
  const { data: conversation, error: convoError } = await supabase
    .from("conversations")
    .upsert(
      {
        user_id: userId,
        customer_id: existingCustomer?.id || null, // Link to customer if they exist
        platform: "facebook",
        platform_conversation_id: customerPlatformId,
        prospect_name: existingCustomer ? null : prospectName, // Store name ONLY if they are not a customer
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

  // 5. Insert the new message, avoiding duplicates
  const { error: msgError } = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    platform_message_id: messageEvent.message.mid,
    sender_id: customerPlatformId,
    recipient_id: pageId,
    content: messageEvent.message.text,
    sent_at: new Date(messageEvent.timestamp),
    sender_type: "client",
  });

  if (msgError && msgError.code !== "23505") {
    console.error("Webhook: Error inserting message:", msgError);
  }
}

// --- NEW FEATURE to specifically manage Instagram messages ---
async function handleInstagramMessage(supabase, messageEvent) {
  console.log("Received an Instagram message:", messageEvent);
  if (messageEvent.message && messageEvent.message.is_echo) {
    console.log("Ignoring echo message");
    return; // Ignore echoes
  }

  const igAccountId = messageEvent.recipient.id; // Instagram Professional Account ID
  const customerIgId = messageEvent.sender.id; // Instagram-Scoped User ID (IGSID)

  // 1. Find our user based on the IG Account ID
  // NOTE: We might need to store `platform_account_id` in social_connections
  // For now, let's assume we find the connection via the linked page ID.
  // This part may need refinement based on your DB schema.
  const { data: connection, error: connError } = await supabase
    .from("social_connections")
    .select("user_id, page_access_token")
    .eq("platform_page_id", igAccountId) // Assuming page ID is linked
    .single();

  if (connError || !connection) {
    console.error(
      `Webhook IG: Could not find connection for IG Account ${igAccountId}`
    );
    return;
  }

  const userId = connection.user_id;

  // The rest of the logic is very similar:
  // 2. Fetch prospect name
  // 3. Check for existing customer
  // 4. Upsert conversation with platform: 'instagram'
  // 5. Insert message
  console.log(`Received an Instagram message from ${customerIgId}`);
  // Pour l'instant, on se contente de logger pour confirmer la réception.
  // Nous implémenterons la logique complète après.
}

export async function processWebhookEvent(supabase, payload) {
  console.log("Received webhook payload:", JSON.stringify(payload, null, 2));
  if (payload.object === "page" && payload.entry) {
    // This is a Messenger event
    for (const entry of payload.entry) {
      for (const event of entry.messaging) {
        if (event.message) {
          await handleNewMessage(supabase, event);
        }
      }
    }
  } else if (payload.object === "instagram") {
    // This is an Instagram event
    console.log("Processing Instagram event...");
    for (const entry of payload.entry) {
      for (const event of entry.messaging) {
        if (event.message) {
          await handleInstagramMessage(supabase, event);
        }
      }
    }
  }
}
