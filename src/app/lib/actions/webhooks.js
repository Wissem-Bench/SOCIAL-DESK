"use server";

import { createClient } from "@/app/lib/supabase/server";

// This is the core processing logic
async function handleMessage(messageEvent) {
  const supabase = createClient();

  // Ignore messages sent by the page itself
  if (messageEvent.message && messageEvent.message.is_echo) {
    return;
  }

  const pageId = messageEvent.recipient.id;
  const customerPlatformId = messageEvent.sender.id;

  // 1. Find which of our users this message belongs to.
  // We need to query social_connections to link the Page ID back to a user in our system.
  // Note: 'platform_user_id' in social_connections should store the USER's Facebook ID,
  // not the Page ID. We'll need a way to link a Page to a User.
  // For now, let's assume we find a user. THIS PART WILL NEED REFINEMENT.

  // Let's find the user who has this page connected. This is a placeholder for now.
  // A better schema would be to store connected pages in social_connections.
  // For now, let's just log it to prove we can parse it.

  console.log(`--- New Message Received ---`);
  console.log(`From: ${customerPlatformId}`);
  console.log(`To Page: ${pageId}`);
  console.log(`Content: ${messageEvent.message.text}`);
  console.log(`--------------------------`);

  // The logic to save to DB will be activated once the user<->page link is solid.
}

export async function processWebhookEvent(payload) {
  console.log("Processing webhook event...");

  // Handle REAL events from Meta
  if (payload.object === "page" && payload.entry) {
    for (const entry of payload.entry) {
      for (const event of entry.messaging) {
        await handleMessage(event);
      }
    }
  }
  // Handle TEST events from the Meta dashboard
  else if (payload.field === "messages" && payload.value) {
    console.log("This is a TEST event from Meta dashboard.");
    const testEvent = {
      sender: { id: payload.value.sender.id },
      recipient: { id: payload.value.recipient.id },
      timestamp: payload.value.timestamp * 1000, // Convert to ms
      message: {
        mid: payload.value.message.mid,
        text: payload.value.message.text,
        is_echo: false,
      },
    };
    await handleMessage(testEvent);
  }
}
