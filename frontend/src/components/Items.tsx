"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useTransition,
} from "react";
import { AxiosError, AxiosResponse } from "axios";
import TableSkeleton from "@/skeletons/tableSkeleton";

import useFetchItems from "@/hooks/useFetchItems";
import api from "@/lib/apiClient";
import CreateItemModal from "./createItemModal";
import { BasicItem, Project } from "@/lib/types";
import { Input } from "./ui/input";
import ChildSidebar from "./childSidebar";
import { getFromCache, invalidateByCustomKey, setToCache } from "@/lib/cache";
import {
  childItemsReducer,
  CLEAR_CHILD_ITEMS,
  initialChildItemsState,
  SET_CHILD_ERROR,
  SET_CHILD_ITEMS,
  SET_CHILD_LOADING,
} from "@/state/itemReducer";
import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "@/lib/debounce";
import ItemTableContainer from "./ItemTableContainer";
import { ItemFilters } from "./ItemsFilters";

interface ItemsProps {
  project: Project;
  refreshImportedItems: () => void;
}

const debouncedSearch = debounce(
  (value: string, callback: (value: string) => void) => {
    console.log(
      "🔵 Debounced search executing at:",
      new Date().toISOString(),
      "with value:",
      value
    );
    callback(value);
  },
  300
);

export default function Items({ project, refreshImportedItems }: ItemsProps) {
  const [items, setItems] = useState<BasicItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 10;

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, startTransition] = useTransition();

  const [selectedItem, setSelectedItem] = useState<BasicItem | null>(null);
  const [childState, dispatchChild] = useReducer(
    childItemsReducer,
    initialChildItemsState
  );

  const searchParams = useSearchParams();
  const router = useRouter();

  const sortField = searchParams.get("sortBy") || "code";
  const sortOrder = searchParams.get("order") === "desc" ? "desc" : "asc";
  const page = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(searchQuery);

  const { childItems, childLoading, childError } = childState;
  const CHILD_ITEMS_CACHE_KEY = "childItems";

  const [filters, setFilters] = useState({
    subType: searchParams.get("subType") || "all",
    minRate: searchParams.get("minRate") || "",
    maxRate: searchParams.get("maxRate") || "",
    minLeadTime: searchParams.get("minLeadTime") || "",
    maxLeadTime: searchParams.get("maxLeadTime") || "",
  });

  const updateUrlParams = useCallback(
    (newParams: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (key === "subType" && value === "all") {
          params.delete(key);
        } else if (value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      subType: "all",
      minRate: "",
      maxRate: "",
      minLeadTime: "",
      maxLeadTime: "",
    });
    updateUrlParams({
      subType: "all",
      minRate: "",
      maxRate: "",
      minLeadTime: "",
      maxLeadTime: "",
      page: 1,
    });
  }, [updateUrlParams]);

  const handleFilterChange = useCallback(
    (filterName: string, value: string) => {
      setFilters((prev) => ({ ...prev, [filterName]: value }));
      updateUrlParams({ [filterName]: value, page: 1 });
    },
    [updateUrlParams]
  );

  const itemsUrl = `/api/v1/projects/${project.id}/items?${new URLSearchParams(
    Object.entries({
      q: searchQuery,
      sortBy: sortField,
      order: sortOrder,
      page: String(page),
      limit: String(limit),
      ...filters,
    })
      .filter(([key, value]) => {
        return !(key === "subType" && value === "all");
      })
      .map(([key, value]) => [key, String(value)])
  )}`;

  const {
    data: fetchedItemsData,
    loading: itemsLoading,
    error: itemsError,
    fetchData: fetchItems,
  } = useFetchItems<{ items: BasicItem[]; totalPages: number }>(itemsUrl);

  useEffect(() => {
    console.log("🔴 Fetching items with searchQuery:", searchQuery);
    fetchItems();
  }, [
    fetchItems,
    itemsUrl,
    sortField,
    sortOrder,
    page,
    limit,
    refreshImportedItems,
    searchQuery,
  ]);

  useEffect(() => {
    if (fetchedItemsData?.items) {
      console.log(
        "⚪ Received new items data, count:",
        fetchedItemsData.items.length
      );
      setItems(fetchedItemsData.items);
      setTotalPages(fetchedItemsData.totalPages || 1);
    }
  }, [fetchedItemsData]);

  const handleSort = useCallback(
    (field: string) => {
      updateUrlParams({
        sortBy: field,
        order: field === sortField && sortOrder === "asc" ? "desc" : "asc",
      });
    },
    [sortField, sortOrder, updateUrlParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateUrlParams({ page: newPage });
    },
    [updateUrlParams]
  );

  const handleSearch = useCallback(
    (value: string) => {
      console.log("🟢 handleSearch called with:", value);
      updateUrlParams({ q: value, page: 1 });
    },
    [updateUrlParams]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      console.log("🟡 handleChange called with:", value);
      setSearchTerm(value);
      debouncedSearch(value, handleSearch);
    },
    [handleSearch]
  );

  const onItemChange = useCallback(() => {
    invalidateByCustomKey(CHILD_ITEMS_CACHE_KEY);
  }, []);

  const toggleSidebar = () => {
    startTransition(() => {
      setSidebarOpen(!sidebarOpen);
    });
  };

  const handleRowClick = useCallback(
    async (parentId: number, item: BasicItem) => {
      if (!parentId) return;
      setSelectedItem(item);
      toggleSidebar();

      const childItemsUrl = `/api/v1/projects/${project.id}/citems/${parentId}?page=${page}&limit=${limit}`;
      const cacheKey = childItemsUrl;

      const cachedChildItems = getFromCache<BasicItem[]>(cacheKey);
      if (cachedChildItems) {
        dispatchChild({ type: SET_CHILD_ITEMS, payload: cachedChildItems });
        return;
      }

      dispatchChild({ type: CLEAR_CHILD_ITEMS });
      dispatchChild({ type: SET_CHILD_LOADING, payload: true });

      try {
        const response: AxiosResponse<BasicItem[]> = await api.get(cacheKey);
        const fetchedChildItems = response.data;

        setToCache(cacheKey, fetchedChildItems, CHILD_ITEMS_CACHE_KEY);
        dispatchChild({ type: SET_CHILD_ITEMS, payload: response.data });
      } catch (err) {
        console.error("Error fetching child items", err);
        dispatchChild({ type: SET_CHILD_ERROR, payload: err as AxiosError }); // Trust me! I know this is an AxiosError
      }
    },
    [project.id, page, limit, toggleSidebar]
  );

  const refreshItems = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    onItemChange();
  }, [onItemChange]);

  const tableProps = useMemo(
    () => ({
      items,
      handlePageChange,
      handleRowClick,
      handleSort,
      onItemDeleted: refreshItems,
      onItemUpdated: refreshItems,
      page,
      project,
      projectId: project.id,
      refreshItems,
      sortField,
      sortOrder,
      totalPages,
    }),
    [
      items,
      handlePageChange,
      handleRowClick,
      handleSort,
      refreshItems,
      page,
      project,
      sortField,
      sortOrder,
      totalPages,
    ]
  );
  return (
    <div className="relative pt-2">
      <div className="mb-4 flex justify-between items-center flex-col sm:flex-row gap-2 sm:gap-0">
        <div className="flex gap-4 sm:gap-12 items-center w-full sm:w-auto justify-between sm:justify-start">
          <h2 className="text-lg font-semibold">Items</h2>
          <Input
            placeholder="search using code or name"
            className="max-w-full sm:max-w-lg h-8 w-full sm:w-auto"
            value={searchTerm}
            onChange={handleChange}
          />
        </div>
        <div className="flex justify-end w-full sm:w-auto">
          <CreateItemModal
            projectId={project.id}
            onItemCreated={refreshItems}
          />
        </div>
      </div>

      <ItemFilters
        onFilterChange={handleFilterChange}
        {...filters}
        onReset={handleResetFilters}
      />

      {itemsLoading ? (
        <div className="mt-4">
          <TableSkeleton rows={8} />
        </div>
      ) : itemsError ? (
        <div className="p-4 text-red-500">
          Error loading items.
          <button
            onClick={fetchItems}
            className="ml-2 text-blue-500 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <ItemTableContainer {...tableProps} />
      )}

      <ChildSidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        childLoading={childLoading}
        childItems={childItems}
        selectedItem={selectedItem}
        childError={childError}
        project={project}
      />
    </div>
  );
}
