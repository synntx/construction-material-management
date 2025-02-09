import { BasicItem, Project } from "@/lib/types";
import ItemTableHeader from "./ItemTableHeader";
import ItemTableRow from "./ItemTableRow";

type ItemTableProps = {
  sortField: string;
  sortOrder: "asc" | "desc";
  handleSort: (field: string) => void;
  handleRowClick: (parentId: number, item: BasicItem) => void;
  project: Project;
  items: BasicItem[];
  handlePageChange: (newPage: number) => void;
  page: number;
  totalPages: number;
  refreshItems: () => void;
};

const ItemTable = ({
  handleRowClick,
  handleSort,
  sortField,
  sortOrder,
  project,
  items,
  handlePageChange,
  page,
  totalPages,
  refreshItems,
}: ItemTableProps) => {
  return (
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
  );
};
export default ItemTable;
