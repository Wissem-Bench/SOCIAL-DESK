import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const auth = supabase.auth;
  const {
    data: { user },
  } = await auth.getUser();
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
      <Link
        href="/dashboard/products"
        className="text-blue-500 hover:underline"
      >
        Gérer mes produits
      </Link>
      <div className="mt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
