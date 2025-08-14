import { Suspense } from "react";
import DashboardSkeleton from "./DashboardSkeleton";
import DashboardCharts from "./DashboardCharts";
import {
  getAdvancedDashboardStats,
  getRecentActivity,
} from "@/app/lib/actions/dashboard";
import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";

export default async function DashboardPage() {
  const { supabase, user } = await getSupabaseWithUser();
  // Fetch once from the server
  const [{ stats }, { activities }] = await Promise.all([
    getAdvancedDashboardStats({ supabase, user }), // now returns both periods
    getRecentActivity({ supabase, user }),
  ]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="mt-2 text-gray-600">Aperçu de votre activité.</p>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        {/* Pass all data to the client component */}
        <DashboardCharts allStats={stats} activities={activities} />
      </Suspense>
    </div>
  );
}
