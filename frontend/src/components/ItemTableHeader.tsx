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
            onClick={field !== "actions" ? () => handleSort(field) : undefined}
            className={`
              px-2 py-3.5 text-left text-sm font-semibold cursor-pointer
              animate-reveal opacity-0 blur-xl transition-all duration-200
              ${field !== "actions" && "hover:bg-muted/10"}
            `}
            style={{
              animationFillMode: "forwards",
            }}
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
