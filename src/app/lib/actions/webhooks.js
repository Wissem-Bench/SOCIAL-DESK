"use server";

async function handleNewMessage(supabase, messageEvent) {
  // Ignore messages sent by the page itself (echoes)
  if (messageEvent.message && messageEvent.message.is_echo) {
    return;
  }

  const pageId = messageEvent.recipient.id;
  const customerPlatformId = messageEvent.sender.id;

  // 1. --- Find our user AND the required Page Access Token ---
  const { data: connection, error: connError } = await supabase
    .from("social_connections")
    .select("user_id, access_token") // Select the token as well
    .eq("platform_page_id", pageId)
    .single();

  if (connError || !connection || !connection.access_token) {
    console.error(
      `[FAIL] No connection or access_token found for Page ID ${pageId}. Check social_connections table. Error:`,
      connError
    );
    return;
  }
  const userId = connection.user_id;
  const pageAccessToken = connection.access_token;

  // 2. --- NEW: Fetch customer's real name from Meta API ---
  let customerName = `Client ${customerPlatformId.substring(0, 4)}`; // Fallback name
  let customerProfilePic = null; // Optional: To store profile picture URL

  try {
    const apiVersion = "v20.0"; // It's good practice to version your API calls
    const fields = "name,profile_pic";
    const url = `https://graph.facebook.com/${apiVersion}/${customerPlatformId}?fields=${fields}&access_token=${pageAccessToken}`;

    const response = await fetch(url);
    const profileData = await response.json();

    if (response.ok && profileData.name) {
      customerName = profileData.name;
      customerProfilePic = profileData.profile_pic;
      console.log(
        `[SUCCESS] Fetched name for customer ${customerPlatformId}: ${customerName}`
      );
    } else {
      // Log Meta's error response if the fetch was not successful
      console.warn(
        `[WARN] Could not fetch name for customer ${customerPlatformId}. API response:`,
        profileData.error || profileData
      );
    }
  } catch (apiError) {
    console.error(
      `[FAIL] API call to Meta failed for customer ${customerPlatformId}.`,
      apiError
    );
  }

  // 3. --- Find or create the customer profile using the REAL name ---
  const { data: customer, error: custError } = await supabase
    .from("customers")
    .upsert(
      {
        user_id: userId,
        platform_customer_id: customerPlatformId,
        platform: "facebook",
        full_name: customerName,
        // profile_pic_url: customerProfilePic // <-- METS CETTE LIGNE EN COMMENTAIRE
      },
      { onConflict: "user_id, platform_customer_id, platform" }
    )
    .select()
    .single();

  if (custError) {
    console.error(`[FAIL] Could not upsert customer.`, custError);
    return;
  }

  // 4. Find or create the conversation thread
  const { data: conversation, error: convoError } = await supabase
    .from("conversations")
    .upsert(
      {
        user_id: userId,
        customer_id: customer.id,
        platform: "facebook",
        platform_conversation_id: customerPlatformId,
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
}
