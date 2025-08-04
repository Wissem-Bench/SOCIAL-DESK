import { NextResponse } from "next/server";
import crypto from "crypto";

// This function handles the one-time webhook verification request from Meta.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Check the mode and token sent are correct
  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    // Respond with 200 OK and challenge token from the request
    console.log("Webhook verified successfully!");
    return new NextResponse(challenge, { status: 200 });
  } else {
    // Responds with '403 Forbidden' if verify tokens do not match
    console.error("Webhook verification failed.");
    return new NextResponse("Forbidden", { status: 403 });
  }
}

// This function handles incoming updates from Meta (e.g., new messages).
export async function POST(request) {
  console.log("__HERE__");
  const body = await request.text(); // Get raw body for signature verification
  const signature = request.headers.get("x-hub-signature-256") ?? "";

  // 1. --- Verify the request signature for security ---
  const hmac = crypto.createHmac("sha256", process.env.META_APP_SECRET);
  hmac.update(body);
  const expectedSignature = `sha256=${hmac.digest("hex")}`;

  if (signature !== expectedSignature) {
    console.warn("Webhook signature verification failed!");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  // 2. --- Process the webhook event ---
  // For now, we will just log the incoming data to confirm it's working.
  // In the next step, we will save this to our database.
  console.log(
    "Received webhook event:",
    JSON.stringify(JSON.parse(body), null, 2)
  );

  // 3. --- Respond with 200 OK ---
  // It's crucial to respond quickly, otherwise Meta will retry the request.
  return new NextResponse("EVENT_RECEIVED", { status: 200 });
}
