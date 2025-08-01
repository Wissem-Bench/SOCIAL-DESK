import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
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
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Meta Token Error:", tokenData.error);
      throw new Error(tokenData.error.message);
    }

    // For now, we're storing The short-lived token, it must be exchanged for a long-lived token.
    const userAccessToken = tokenData.access_token;

    // --- Obtain the user's ID on the platform ---
    // Using the user token, we ask Meta "Who is this user?" to obtain their ID.
    const meResponse = await fetch(
      `https://graph.facebook.com/me?access_token=${userAccessToken}`
    );
    const meData = await meResponse.json();
    const platformUserId = meData.id;

    if (!platformUserId) {
      throw new Error("Could not fetch user ID from Meta.");
    }

    // --- Store information in social_connections ---
    const auth = supabase.auth;
    const {
      data: { user },
      error: userError,
    } = await auth.getUser();

    if (userError || !user) {
      throw new Error("Could not find an authenticated Supabase user.");
    }

    // If a connection for this user and platform doesn't exist, it creates one.
    // If it already exists, it updates it (with a new token).
    const { error: upsertError } = await supabase
      .from("social_connections")
      .upsert(
        {
          user_id: user.id,
          platform: "facebook", // Note: The process is the same for Instagram, Meta handles them together here.
          access_token: userAccessToken, // Don't forget to encrypt this token in production!
          platform_user_id: platformUserId,
        },
        {
          onConflict: "user_id, platform", // Tells which unique constraint to check
        }
      );

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
