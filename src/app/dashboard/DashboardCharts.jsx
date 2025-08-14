"use client";

import { useState } from "react";
import RevenueChart from "./charts/RevenueChart";
import PlatformChart from "./charts/PlatformChart";
import TopProductsChart from "./charts/TopProductsChart";
import ActivityFeed from "./charts/ActivityFeed";
import ConnectMetaCard from "@/app/meta/ConnectMetaCard";
import PeriodSelector from "./PeriodSelector";

// Helper for currency formatting
const currencyFormatter = (number) =>
  typeof number === "number"
    ? new Intl.NumberFormat("fr-TN", {
        style: "currency",
        currency: "TND",
      }).format(number)
    : "N/A";

function KpiCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function DashboardCharts({ allStats, activities }) {
  const [selectedPeriod, setSelectedPeriod] = useState("last_30_days");

  // Choose the right dataset instantly without fetching
  const stats = allStats[selectedPeriod];

  if (!stats) return null;

  if (stats.count === 0) {
    return <ConnectMetaCard />;
  }

  return (
    <>
      {/* Period Switcher */}
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      {/* KPI CARDS */}
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

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">
            Évolution du Chiffre d'Affaires
          </h3>
          <RevenueChart data={stats.revenue_time_series} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">
            Activité Récente
          </h3>
          <ActivityFeed activities={activities} />
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Ventes par Plateforme
            </h3>
            <PlatformChart data={stats.sales_by_platform} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Produits les Plus Vendus
            </h3>
            <TopProductsChart data={stats.top_products} />
          </div>
        </div>
      </div>
    </>
  );
}
