"use client";

export default function PeriodSelector({ selectedPeriod, onPeriodChange }) {
  const periods = [
    { key: "last_7_days", label: "7 derniers jours" },
    { key: "last_30_days", label: "30 derniers jours" },
  ];

  return (
    <div className="flex justify-end">
      <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg">
        {periods.map((period) => (
          <button
            key={period.key}
            onClick={() => onPeriodChange(period.key)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              selectedPeriod === period.key
                ? "bg-white text-gray-800 shadow"
                : "text-gray-600 hover:bg-gray-300"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}
