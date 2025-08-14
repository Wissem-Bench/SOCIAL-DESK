import "server-only"; // Ensures this code only runs on the server
import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

// This creates a single, cached instance of the Supabase client and user session per request.
export const getSupabaseWithUser = cache(async (retryCount = 2) => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user && !error) {
      return { supabase, user };
    }
    if (attempt < retryCount) {
      console.warn(
        `Retrying to fetch user session (${attempt + 1}/${retryCount})...`
      );
      await new Promise((resolve) => setTimeout(resolve, 200)); // short retry delay
    }
  }
  throw new Error("Unable to fetch user after retries");
});
