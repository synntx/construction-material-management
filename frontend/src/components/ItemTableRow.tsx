import React, { memo } from "react";
import { ItemActions } from "./ItemActions";
import { BasicItem } from "@/lib/types";

interface ItemTableRowProps {
  item: BasicItem;
  handleRowClick: (parentId: number, item: BasicItem) => void;
  projectId: string;
  onItemUpdated: () => void;
  onItemDeleted: () => void;
}

const ItemTableRow: React.FC<ItemTableRowProps> = memo(
  ({
    item,
    handleRowClick,
    projectId,
    onItemUpdated,
    onItemDeleted,
  }) => {
    return (
      <tr
        key={item.id}
        className="hover:bg-muted/10 cursor-pointer animate-reveal opacity-0 blur-sm transition-all duration-200"
        onClick={() => handleRowClick(item.id, item)}
        style={{
          animationFillMode: "forwards",
        }}
      >
        <td className="px-2 py-4 text-sm">{item.code}</td>
        <td className="px-2 py-4 text-sm">{item.name}</td>
        <td className="px-2 py-4 text-sm">{item.unit}</td>
        <td className="px-2 py-4 text-sm">{item.rate}</td>
        <td className="px-3 py-4 text-sm">{item.avgLeadTime} days</td>
        <td className="px-2 py-4 text-sm">{item.subType}</td>
        <td className="px-2 py-4 text-sm">
          <ItemActions
            item={item}
            projectId={projectId}
            onItemUpdated={onItemUpdated}
            onItemDeleted={onItemDeleted}
          />
        </td>
      </tr>
    );
  }
);

ItemTableRow.displayName = "ItemTableRow";

export default ItemTableRow;