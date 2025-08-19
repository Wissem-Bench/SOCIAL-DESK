"use client";

export default function TableSkeleton({ headers, rowCount = 5 }) {
  const skeletonRows = Array.from({ length: rowCount });
  const columnCount = headers.length;
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              scope="col"
              // Add special styling for the first column to match your design
              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                index === 0 ? "sticky left-0 z-10 bg-gray-50" : ""
              }`}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200 animate-pulse">
        {skeletonRows.map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columnCount }).map((_, colIndex) => (
              <td
                key={colIndex}
                // Add special styling for the first column
                className={`px-6 py-4 ${
                  colIndex === 0 ? "sticky left-0 bg-white" : ""
                }`}
              >
                <div className="h-4 bg-gray-200 rounded"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
