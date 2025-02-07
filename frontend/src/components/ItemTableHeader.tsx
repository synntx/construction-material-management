import React from "react";

interface ItemTableHeaderProps {
  sortField: string;
  sortOrder: "asc" | "desc";
  handleSort: (field: string) => void;
}

const ItemTableHeader: React.FC<ItemTableHeaderProps> = ({
  sortField,
  sortOrder,
  handleSort,
}) => {
  const headers = [
    "code",
    "name",
    "unit",
    "rate",
    "avgLeadTime",
    "subType",
    "actions",
  ];

  return (
    <thead className="bg-secondary">
      <tr>
        {headers.map((field) => (
          <th
            key={field}
            className="px-2 py-3.5 text-left text-sm font-semibold cursor-pointer"
            onClick={() => handleSort(field)}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortField === field ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default ItemTableHeader;
