import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "./server";

const getSupabase = cache(async () => {
  const cookieStore = await cookies();
  return createClient(cookieStore);
});

export async function getSupabaseWithUser(retryCount = 2) {
  const supabase = await getSupabase();
  const isDev = process.env.NODE_ENV === "development";

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    let user = null;
    let error = null;

    if (isDev) {
      // ✅ In dev mode → more tolerant with getSession
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      user = session?.user ?? null;
      error = sessionError;
    } else {
      // ✅ In production → stricter with getUser
      const {
        data: { user: fetchedUser },
        error: userError,
      } = await supabase.auth.getUser();
      user = fetchedUser;
      error = userError;
    }

    if (user && !error) {
      return { supabase, user };
    }

    if (attempt < retryCount) {
      console.warn(
        `Retrying to fetch user session (${attempt + 1}/${retryCount})...`
      );
      await new Promise((resolve) => setTimeout(resolve, isDev ? 500 : 200));
    }
  }

  throw new Error("Unable to fetch user after retries");
}
