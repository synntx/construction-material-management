import { BasicItem, Project } from "@/lib/types";
import { memo } from "react";
import ItemTable from "./ItemTable";

interface ItemTableContainerProps {
  items: BasicItem[];
  handlePageChange: (page: number) => void;
  handleRowClick: (parentId: number, item: BasicItem) => void;
  handleSort: (field: string) => void;
  onItemDeleted: () => void;
  onItemUpdated: () => void;
  page: number;
  project: Project;
  projectId: string;
  refreshItems: () => void;
  sortField: string;
  sortOrder: string;
  totalPages: number;
}

const ItemTableContainer = memo(function ItemTableContainer({
  items,
  handlePageChange,
  handleRowClick,
  handleSort,
  page,
  project,
  refreshItems,
  sortField,
  sortOrder,
  totalPages,
}: ItemTableContainerProps) {
  if (!items) return <div>No items found</div>;

  return (
    <ItemTable
      handlePageChange={handlePageChange}
      handleRowClick={handleRowClick}
      handleSort={handleSort}
      items={items}
      page={page}
      project={project}
      refreshItems={refreshItems}
      sortField={sortField}
      sortOrder={sortOrder === "asc" ? "asc" : "desc"}
      totalPages={totalPages}
    />
  );
});

export default ItemTableContainer;
