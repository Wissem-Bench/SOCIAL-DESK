import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("User:", user);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Bienvenue sur votre Dashboard !</h1>
      <p className="mt-4">
        Vous êtes connecté en tant que : <strong>{user.email}</strong>
      </p>
      <p className="mt-2">Votre ID utilisateur est : {user.id}</p>

      <div className="mt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
