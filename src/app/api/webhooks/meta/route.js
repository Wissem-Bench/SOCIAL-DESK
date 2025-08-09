import { NextResponse } from "next/server";
import crypto from "crypto";
import { processWebhookEvent } from "@/app/lib/actions/webhooks";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

// Meta webhook verification (GET)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  } else {
    return new Response("Forbidden", { status: 403 });
  }
}

// Meta webhook events (POST)
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256") ?? "";

  // --- Signature verification ---
  const hmac = crypto.createHmac("sha256", process.env.META_APP_SECRET);
  hmac.update(body);
  const expectedSignature = `sha256=${hmac.digest("hex")}`;

  if (signature !== expectedSignature) {
    console.warn("Webhook signature verification failed!");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const data = JSON.parse(body);
    // We don't await this to respond quickly to Meta
    processWebhookEvent(supabase, data);
  } catch (e) {
    console.error("Webhook POST Error:", e);
  }

  return new NextResponse("EVENT_RECEIVED", { status: 200 });
}
