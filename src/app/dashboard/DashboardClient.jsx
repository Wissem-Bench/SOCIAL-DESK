"use client";

import { useState } from "react";
import PeriodSelector from "./PeriodSelector";
import DashboardCharts from "./DashboardCharts";
import ConnectMetaCard from "@/app/meta/ConnectMetaCard";

export default function DashboardClient({ stats, activities }) {
  const [selectedPeriod, setSelectedPeriod] = useState("last_30_days");

  if (stats?.count === 0) {
    return <ConnectMetaCard />;
  }

  const currentData = stats[selectedPeriod];

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

      <DashboardCharts stats={currentData} activities={activities} />
    </div>
  );
}
