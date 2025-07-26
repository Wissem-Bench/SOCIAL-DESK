import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import ConnectMetaCard from "@/app/meta/ConnectMetaCard";
import { getDashboardStats } from "@/app/lib/actions/dashboard";
import { getUserData } from "@/app/lib/actions/users";
import StatCard from "./StatCard";
import { ClientPageRoot } from "next/dist/client/components/client-page";

// Simple SVG icons for the cards
const RevenueIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"
    />
  </svg>
);
const OrdersIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);
const CustomersIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197"
    />
  </svg>
);

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const auth_user = await getUserData(user.id);
  // console.log(auth_user.users.full_name);

  // Check if a Meta connection exists for this user
  // { head: true } is an optimization to not retrieve any data, just check its existence.
  const [connectionResult, statsResult] = await Promise.all([
    supabase
      .from("social_connections")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    getDashboardStats(),
  ]);

  const { count, error: connectionError } = connectionResult;
  const { stats, error: statsError } = statsResult;

  if (connectionError || statsError) {
    console.error("Dashboard Error:", connectionError || statsError);
    return <div>Une erreur est survenue lors du chargement du dashboard.</div>;
  }

  if (count === 0) {
    return <ConnectMetaCard />;
  }

  // --- Main Dashboard Content ---
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de Bord
            </h1>
            <p className="text-gray-600">Bienvenue, {auth_user.full_name} !</p>
          </div>
          <LogoutButton />
        </div>

        {/* === STATS CARDS SECTION === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Revenu (ce mois-ci)"
            value={`${stats.monthly_revenue || 0} TND`}
            icon={RevenueIcon}
          />
          <StatCard
            title="Commandes (ce mois-ci)"
            value={stats.monthly_orders_count || 0}
            icon={OrdersIcon}
          />
          <StatCard
            title="Nombre total de clients"
            value={stats.total_customers_count || 0}
            icon={CustomersIcon}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* === NAVIGATION LINKS SECTION === */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Accès Rapides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/dashboard/inbox"
                className="block p-6 bg-purple-100 hover:bg-purple-200 rounded-lg text-center text-purple-800 font-semibold transition"
              >
                Consulter la Messagerie
              </Link>
              <Link
                href="/dashboard/orders"
                className="block p-6 bg-green-100 hover:bg-green-200 rounded-lg text-center text-green-800 font-semibold transition"
              >
                Gérer les Commandes
              </Link>
              <Link
                href="/dashboard/products"
                className="block p-6 bg-blue-100 hover:bg-blue-200 rounded-lg text-center text-blue-800 font-semibold transition"
              >
                Gérer les Produits
              </Link>
              <Link
                href="/dashboard/customers"
                className="block p-6 bg-orange-100 hover:bg-orange-200 rounded-lg text-center text-orange-800 font-semibold transition"
              >
                Voir les Clients
              </Link>
            </div>
          </div>

          {/* === LOW STOCK PRODUCTS SECTION === */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Stock Faible (≤ 5)
            </h2>
            <div className="bg-white p-4 rounded-lg shadow">
              {stats.low_stock_products &&
              stats.low_stock_products.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {stats.low_stock_products.map((product) => (
                    <li
                      key={product.id}
                      className="py-3 flex justify-between items-center text-sm"
                    >
                      <Link
                        href="/dashboard/products"
                        className="text-gray-800 hover:text-blue-600"
                      >
                        {product.name}
                      </Link>
                      <span className="font-bold text-red-500">
                        {product.stock_quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucun produit à faible stock. Excellent travail !
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
