"use client";

import { useState, useEffect } from "react";
import {
  getAdvancedDashboardStats,
  getRecentActivity,
} from "@/app/lib/actions/dashboard";
// import DashboardContent from "./DashboardContent";
import RevenueChart from "./charts/RevenueChart";
import PlatformChart from "./charts/PlatformChart";
import TopProductsChart from "./charts/TopProductsChart";
import PeriodSelector from "./PeriodSelector";
import ActivityFeed from "./charts/ActivityFeed";

// Helper to format numbers as currency (TND)
const currencyFormatter = (number) => {
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
  })
    .format(number)
    .toString();
};

function KpiCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("last_30_days");

  useEffect(() => {
    fetchDashboardData(selectedPeriod);
  }, [selectedPeriod]);

  const fetchDashboardData = async (period) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch stats and activities in parallel
      const [statsResult, activityResult] = await Promise.all([
        getAdvancedDashboardStats(period),
        getRecentActivity(), // Activity feed is independent of the period for now
      ]);

      if (statsResult.error) throw new Error(statsResult.error);
      if (activityResult.error) throw new Error(activityResult.error);

      setStats(statsResult.stats);
      setActivities(activityResult.activities);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (error || !stats) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-red-700">Erreur</h3>
          <p className="mt-2 text-gray-600">
            Impossible de charger les données du tableau de bord.
          </p>
          <p className="mt-2 text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="mt-2 text-gray-600">Aperçu de votre activité.</p>
        </div>
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      {/* --- KPI CARDS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <KpiCard
          title="Chiffre d'Affaires"
          value={currencyFormatter(stats.kpis.total_revenue)}
        />
        <KpiCard title="Commandes" value={stats.kpis.total_orders} />
        <KpiCard
          title="Panier Moyen"
          value={currencyFormatter(stats.kpis.average_order_value)}
        />
      </div>
      {isLoading || !stats ? (
        <p>Chargement des données...</p> // Replace with a nice skeleton loader later
      ) : (
        <>
          {/* --- CHARTS & ACTIVITY FEED SECTION --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">
                Évolution du Chiffre d'Affaires
              </h3>
              <RevenueChart data={stats.revenue_time_series} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Activité Récente</h3>
              <ActivityFeed activities={activities} />
            </div>

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Ventes par Plateforme</h3>
                <PlatformChart data={stats.sales_by_platform} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold">
                  Produits les Plus Vendus
                </h3>
                <TopProductsChart data={stats.top_products} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
