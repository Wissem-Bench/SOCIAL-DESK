"use server";

import { createClient } from "@/app/lib/supabase/server";

// ACTION TO RETRIEVE USER DATA
export async function getUserData(_id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", _id)
    .single();

  if (error) {
    console.error("Erreur BDD:", error.message);
    return { error: "Impossible de récupérer les commandes." };
  }

  return data;
}
