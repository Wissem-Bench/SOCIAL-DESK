export default function DashboardSkeleton() {
  return (
    <>
      {/* Skeleton for KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-gray-200 h-24 rounded-lg animate-pulse"></div>
        <div className="bg-gray-200 h-24 rounded-lg animate-pulse"></div>
        <div className="bg-gray-200 h-24 rounded-lg animate-pulse"></div>
      </div>
      {/* Skeleton for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-gray-200 h-96 rounded-lg animate-pulse"></div>
        <div className="bg-gray-200 h-96 rounded-lg animate-pulse"></div>
      </div>
    </>
  );
}
