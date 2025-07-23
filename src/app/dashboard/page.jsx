import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import ConnectMetaCard from "@/app/meta/ConnectMetaCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Check if a Meta connection exists for this user
  // We don't select any data ('id'), we just want the account.
  // { head: true } is an optimization to not retrieve any data, just check its existence.
  const { count, error: connectionError } = await supabase
    .from("social_connections")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (connectionError) {
    console.error("Erreur de vérification de la connexion:", connectionError);
    return <div>Une erreur est survenue. Veuillez réessayer.</div>;
  }

  // 3. Conditional rendering based on the presence of a connection (count > 0)
  if (count === 0) {
    // If the count is 0, no connection exists. The Card is displayed.
    return <ConnectMetaCard />;
  }

  // --- If we get here, the user is successfully connected to Meta ---
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Bienvenue sur votre Dashboard !</h1>
      <p className="m-2">
        Vous êtes connecté en tant que : <strong>{user.email}</strong>
      </p>
      <p className="mt-2 text-green-600 font-semibold">
        ✅ Votre compte Meta est bien connecté.
      </p>

      <div className="grid gap-4 md:grid-cols-2 mt-8 mb-8">
        <Link
          href="/dashboard/products"
          className="block p-4 bg-blue-100 hover:bg-blue-200 rounded text-center text-blue-700 font-medium transition"
        >
          Gérer mes produits
        </Link>
        <Link
          href="/dashboard/orders"
          className="block p-4 bg-green-100 hover:bg-green-200 rounded text-center text-green-700 font-medium transition"
        >
          Gérer mes ordres
        </Link>
      </div>

      <div className="mt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
