import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore
            .getAll()
            .map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            try {
              cookieStore.set(cookie);
            } catch (e) {
              // Ignore if used from Server Component
            }
          }
        },
      },
    }
  );
}
