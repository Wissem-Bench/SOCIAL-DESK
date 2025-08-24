import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";

export async function getAuthenticatedUserProfile() {
  const { supabase, user } = await getSupabaseWithUser();

  if (!user) throw new Error("Action non autorisée.");

  // We retrieve the public profile corresponding to the ID of the authenticated user
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single(); // .single() to retrieve only one record

  if (error) {
    throw new Error("Erreur BDD (getAuthenticatedUserProfile)");
  }

  return profile;
}
