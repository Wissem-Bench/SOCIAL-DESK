import { Suspense } from "react";
import DashboardSkeleton from "./DashboardSkeleton";
import DashboardCharts from "./DashboardCharts";
import {
  getAdvancedDashboardStats,
  getRecentActivity,
} from "@/app/lib/actions/dashboard";

export default async function DashboardPage() {
  // Fetch once from the server
  const [{ stats }, { activities }] = await Promise.all([
    getAdvancedDashboardStats(),
    getRecentActivity(),
  ]);

  return (
    <div className="p-4 md:p-8">
      <Suspense fallback={<DashboardSkeleton />}>
        {/* Pass all data to the client component */}
        <DashboardCharts allStats={stats} activities={activities} />
      </Suspense>
    </div>
  );
}
