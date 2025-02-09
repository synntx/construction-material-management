import RightArrowIcon from "@/icons/rightArrowIcon";
import { BasicItem, Project } from "@/lib/types";
import TableSkeleton from "@/skeletons/tableSkeleton";
import { AxiosError } from "axios";
import { X } from "lucide-react";

type ChildSidebar = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  childLoading: boolean;
  childItems: BasicItem[];
  childError: AxiosError | null;
  selectedItem: BasicItem | null;
  project: Project;
};

const ChildSidebar = ({
  sidebarOpen,
  toggleSidebar,
  childLoading,
  childItems,
  selectedItem,
  project,
  childError,
}: ChildSidebar) => {
  return (
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
      ) : childError ? (
        <div className="text-sm text-center py-10 text-red-500">
          Error loading child items: {childError.message}
        </div>
      ) : childItems.length > 0 ? (
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full divide-y divide-muted/50">
            <thead className="bg-secondary">
              <tr>
                {["code", "name", "unit", "rate", "avgLeadTime", "subType"].map(
                  (field) => (
                    <th
                      key={field}
                      className="px-2 py-3.5 text-left text-sm font-semibold"
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </th>
                  )
                )}
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
  );
};
export default ChildSidebar;
