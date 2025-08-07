import { NextResponse } from "next/server";

// Meta webhook verification (GET)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully.");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Meta webhook events (POST)
export async function POST(request) {
  // Checkpoint 1: POST Request First Checkpoint
  console.log("--- META WEBHOOK: POST REQUEST RECEIVED ---");
  try {
    const rawBody = await request.text(); // VERY IMPORTANT: Do NOT use .json() here
    console.log("📩 Received Meta Webhook POST:", rawBody);

    // Optional: You can verify the X-Hub-Signature here if needed

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("❌ Error reading POST body:", error);
    return new NextResponse("Error processing webhook", { status: 500 });
  }
}
