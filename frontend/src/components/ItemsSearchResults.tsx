"use client";

import { useState, useEffect } from "react";
import api from "@/lib/apiClient";
import { BasicItem } from "@/lib/types";

export function ItemsSearchResults({ query }: { query: string }) {
  const [items, setItems] = useState<BasicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/v1/items/search", {
          params: { q: query, page, limit: 10 },
        });
        setItems(response.data.formattedItems);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [query, page]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Code", "Name", "Unit", "Rate", "Lead Time", "Type"].map(
              (header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap">{item.code}</td>
              <td className="px-6 py-4">{item.name}</td>
              <td className="px-6 py-4">{item.unit}</td>
              <td className="px-6 py-4">{item.rate}</td>
              <td className="px-6 py-4">{item.avgLeadTime} days</td>
              <td className="px-6 py-4">{item.subType}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
