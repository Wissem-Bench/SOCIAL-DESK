"use server";

import { createClient } from "@/app/lib/supabase/server";
import { AuthApiError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function signInWithCredentials(credentials) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    // If it's a known authentication error, return it as data
    if (error instanceof AuthApiError) {
      return { error: { message: error.message, status: error.status } };
    }
    // For any other unexpected error, throw it
    throw error;
  }

  return { success: true };
}

export async function signUpUser(formData) {
  const supabase = await createClient();

  const { email, password, fullName } = formData;

  // Step 1: Check if the user already exists in our public profiles
  const { data: existingUser, error: checkError } = await supabase
    .from("profiles")
    .select("email")
    .eq("email", email)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 = no rows found
    console.error("Error checking for existing user:", checkError);
    throw new Error(
      "Un problème est survenu lors de la vérification de l'e-mail."
    );
  }

  if (existingUser) {
    // This is a "handled" error, we throw a specific message
    throw new Error("Cette adresse e-mail est déjà utilisée.");
  }

  // Step 2: If the user does not exist, proceed with Supabase auth.signUp
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (signUpError) {
    // This could be a Supabase-specific error (e.g., weak password policy)
    throw signUpError;
  }

  return { success: true };
}

export async function signOutUser() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign Out Error:", error);
    // Even if signout fails, we try to redirect to login
    throw new Error("Impossible de se déconnecter. Veuillez réessayer.");
  }

  // On successful sign out, redirect the user to the login page
  return redirect("/login");
}
