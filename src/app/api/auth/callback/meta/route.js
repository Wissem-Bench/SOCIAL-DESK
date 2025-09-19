import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  // --- get the userAccessToken ---
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    // Redirect with error if no code is provided
    return NextResponse.redirect(
      new URL("/dashboard?error=meta_auth_failed", request.url)
    );
  }

  const clientId = process.env.NEXT_PUBLIC_META_CLIENT_ID;
  const clientSecret = process.env.META_APP_SECRET; // kept secret on the server !
  const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI;

  try {
    // --- Step 1: Exchange code for a user access token ---
    console.log(
      "__ step 1 : `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`"
    );
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`
    );
    console.log("__ 1st fetch succeeded");

    const tokenData = await tokenResponse.json();
    console.log("__ tokenData", tokenData);

    if (tokenData.error) {
      console.error("Meta Token Error:", tokenData.error);
      throw new Error(tokenData.error.message);
    }

    // For now, we're storing The short-lived token, it must be exchanged for a long-lived token.
    const userAccessToken = tokenData.access_token;

    // --- Step 2: Get the user's platform ID ---
    const meResponse = await fetch(
      `https://graph.facebook.com/me?access_token=${userAccessToken}`
    );
    console.log("__ meResponse", meResponse);
    const meData = await meResponse.json();
    console.log("__ meData", meData);
    const platformUserId = meData.id;

    // --- Step 3: Get the user's managed pages to find the Page ID AND Page Access Token ---
    const pagesResponse = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`
    );
    console.log("__ pageResponse", pageResponse);
    const pagesData = await pagesResponse.json();
    console.log("__ pagesData", pagesData);
    if (!pagesData.data || pagesData.data.length === 0)
      throw new Error("No pages found.");

    const page = pagesData.data[0];
    const pageId = page.id;
    const pageAccessToken = page.access_token;

    // --- Step 4: Get the Supabase user ---
    const auth = supabase.auth;
    const {
      data: { user },
      error: userError,
    } = await auth.getUser();
    console.log("__ data", data);

    if (userError || !user) {
      throw new Error("Could not find an authenticated Supabase user.");
    }

    // --- Step 5: Upsert the connection with all IDs ---
    // If a connection for this user and platform doesn't exist, it creates one.
    // If it already exists, it updates it (with a new token).
    const { error: upsertError } = await supabase
      .from("social_connections")
      .upsert(
        {
          user_id: user.id,
          platform: "facebook", // The process is the same for Instagram, Meta handles them together here.
          access_token: userAccessToken, // Don't forget to encrypt this token in production!
          page_access_token: pageAccessToken, // The Page's own token
          platform_user_id: platformUserId,
          platform_page_id: pageId, // This is the page's ID
        },
        {
          onConflict: "user_id, platform", // Tells which unique constraint to check
        }
      );
    console.log("__ error", error);

    if (upsertError) {
      throw upsertError;
    }

    // Redirect to homepage with success message
    return NextResponse.redirect(
      new URL("/dashboard?success=meta_connected", request.url)
    );
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=meta_connection_failed", request.url)
    );
  }
}
