import React from "react";

const TableSkeleton = ({ rows = 5 }) => {
  const columns = ["code", "name", "unit", "rate", "avgLeadTime", "subType"];

  return (
    <div className="overflow-x-auto rounded-lg animate-pulse">
      <table className="min-w-full divide-y divide-muted/50">
        <thead className="bg-secondary">
          <tr>
            {columns.map((field) => (
              <th
                key={field}
                className="px-2 py-3.5 text-left text-sm font-semibold"
              >
                <div className="h-4 bg-gray-300 rounded w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y ">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((field) => (
                <td key={field} className="px-2 py-4 text-sm bg-zinc-700">
                  <div className="h-4 bg-gray-500 rounded w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
