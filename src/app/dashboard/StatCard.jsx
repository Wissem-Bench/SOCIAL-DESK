export default function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
