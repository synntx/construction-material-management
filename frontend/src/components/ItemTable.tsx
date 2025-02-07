"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { AxiosResponse } from "axios";
import { X } from "lucide-react";
import RightArrowIcon from "@/icons/rightArrowIcon";
import TableSkeleton from "@/skeletons/tableSkeleton";

import useFetchItems from "@/hooks/useFetchItems";
import ItemTableHeader from "./ItemTableHeader";
import ItemTableRow from "./ItemTableRow";
import api from "@/lib/apiClient";
import CreateItemModal from "./createItemModal";
import { BasicItem, Project } from "@/lib/types";

interface ItemTableProps {
  project: Project;
  refreshImportedItems: () => void;
}

export default function ItemTable({
  project,
  refreshImportedItems,
}: ItemTableProps) {
  const [items, setItems] = useState<BasicItem[]>([]);
  const [sortField, setSortField] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit] = useState<number>(10);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, startTransition] = useTransition();

  const [selectedItem, setSelectedItem] = useState<BasicItem | null>(null);
  const [childItems, setChildItems] = useState<BasicItem[]>([]);
  const [childLoading, setChildLoading] = useState<boolean>(false);

  const [, setHoveredItemId] = useState<number | null>(null);
  const [prefetchedChildItems, setPrefetchedChildItems] = useState<{
    [itemId: number]: BasicItem[];
  }>({});
  const [prefetchLoading, setPrefetchLoading] = useState<{
    [itemId: number]: boolean;
  }>({});

  const itemsUrl = `/api/v1/projects/${project.id}/items?sortBy=${sortField}&order=${sortOrder}&page=${page}&limit=${limit}`;

  const {
    data: fetchedItemsData,
    loading: itemsLoading,
    error: itemsError,
    fetchData: fetchItems,
  } = useFetchItems<{ items: BasicItem[]; totalPages: number }>(itemsUrl);

  //  fetchItems is useCallback, so it won't cause infinite loop
  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshImportedItems]);

  useEffect(() => {
    if (fetchedItemsData?.items) {
      setItems(fetchedItemsData.items);
      setTotalPages(fetchedItemsData.totalPages || 1);
    }
  }, [fetchedItemsData]);

  const handleSort = (field: string) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const prefetchChildItemsData = async (parentId: number) => {
    if (prefetchLoading[parentId] || prefetchedChildItems[parentId]) {
      return;
    }

    setPrefetchLoading((prev) => ({ ...prev, [parentId]: true }));

    try {
      const response: AxiosResponse<BasicItem[]> = await api.get(
        `/api/v1/projects/${project.id}/citems/${parentId}`
      );
      setPrefetchedChildItems((prev) => ({
        ...prev,
        [parentId]: response.data,
      }));
    } catch (err) {
      console.error("Error prefetching child items", err);
    } finally {
      setPrefetchLoading((prev) => ({ ...prev, [parentId]: false }));
    }
  };

  const handleRowClick = async (parentId: number, item: BasicItem) => {
    if (!parentId) return;
    setSelectedItem(item);
    toggleSidebar();
    setChildItems([]);

    if (prefetchedChildItems[parentId]) {
      setChildItems(prefetchedChildItems[parentId]);
    } else {
      setChildLoading(true);
      try {
        const response: AxiosResponse<BasicItem[]> = await api.get(
          `/api/v1/projects/${project.id}/citems/${parentId}`
        );
        setChildItems(response.data);
      } catch (err) {
        console.error("Error fetching child items", err);
      } finally {
        setChildLoading(false);
      }
    }
  };

  const toggleSidebar = () => {
    startTransition(() => {
      setSidebarOpen(!sidebarOpen);
    });
  };

  const refreshItems = useCallback(() => {
    setPage(1);
    fetchItems();
  }, [fetchItems]);

  if (itemsLoading)
    return (
      <div className="">
        <TableSkeleton rows={10} />
      </div>
    );

  if (!items) return <div className="p-4 text-center">No Items found</div>;

  if (itemsError)
    return (
      <div className="p-4 text-red-500">
        Error loading items.
        <button
          onClick={fetchItems}
          className="ml-2 text-blue-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="relative">
      <div className="mb-4 flex justify-between items-center">
        {" "}
        <h2 className="text-lg font-semibold">Items</h2>
        <CreateItemModal projectId={project.id} onItemCreated={refreshItems} />
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-muted/50 border border-border/50">
          <ItemTableHeader
            sortField={sortField}
            sortOrder={sortOrder}
            handleSort={handleSort}
          />
          <tbody className="divide-y bg-white">
            {items.length > 0 ? (
              items.map((item) => (
                <ItemTableRow
                  projectId={project.id}
                  onItemDeleted={refreshItems}
                  onItemUpdated={refreshItems}
                  key={item.id}
                  item={item}
                  handleRowClick={handleRowClick}
                  onMouseEnter={() => {
                    setHoveredItemId(item.id);
                    prefetchChildItemsData(item.id);
                  }}
                  onMouseLeave={() => setHoveredItemId(null)}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-2 py-4 text-center text-sm text-gray-500"
                >
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm text-gray-600 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm text-gray-600 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 md:w-1/2 w-full h-full bg-white shadow-lg p-4 z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center my-4">
          <button
            className="p-2 hover:bg-secondary rounded transition duration-150 ease-in-out"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          <nav className="ml-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              <li>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {project?.name}
                  </span>
                </div>
              </li>

              {selectedItem && (
                <li>
                  <div className="flex items-center">
                    <RightArrowIcon />
                    <span className="text-sm font-medium text-gray-700">
                      {selectedItem.name}
                    </span>
                  </div>
                </li>
              )}
            </ol>
          </nav>
        </div>

        {childLoading ? (
          <TableSkeleton rows={5} />
        ) : childItems.length > 0 ? (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-muted/50">
              <thead className="bg-secondary">
                <tr>
                  {[
                    "code",
                    "name",
                    "unit",
                    "rate",
                    "avgLeadTime",
                    "subType",
                  ].map((field) => (
                    <th
                      key={field}
                      className="px-2 py-3.5 text-left text-sm font-semibold"
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {childItems.map((child) => (
                  <tr key={child.id}>
                    <td className="px-2 py-4 text-sm">{child.code}</td>
                    <td className="px-2 py-4 text-sm">{child.name}</td>
                    <td className="px-2 py-4 text-sm">{child.unit}</td>
                    <td className="px-2 py-4 text-sm">{child.rate}</td>
                    <td className="px-3 py-4 text-sm">
                      {child.avgLeadTime} days
                    </td>
                    <td className="px-2 py-4 text-sm">{child.subType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-center py-10 text-gray-500">
            No child items found.
          </div>
        )}
      </div>
    </div>
  );
}
