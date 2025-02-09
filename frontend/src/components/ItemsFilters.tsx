import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { SubType } from "@/lib/types";
import { Button } from "./ui/button";

interface ItemFiltersProps {
  onFilterChange: (filterName: string, value: string) => void;
  subType: string;
  minRate: string;
  maxRate: string;
  minLeadTime: string;
  maxLeadTime: string;
  onReset: () => void;
}

export function ItemFilters({
  onFilterChange,
  subType,
  minRate,
  maxRate,
  minLeadTime,
  maxLeadTime,
  onReset,
}: ItemFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 pl-1">
      <div className="flex items-center gap-2">
        <Select
          value={subType}
          onValueChange={(value) => onFilterChange("subType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.values(SubType).map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Min Rate"
          value={minRate}
          onChange={(e) => onFilterChange("minRate", e.target.value)}
          className="w-1/2"
        />
        <Input
          type="number"
          placeholder="Max Rate"
          value={maxRate}
          onChange={(e) => onFilterChange("maxRate", e.target.value)}
          className="w-1/2"
        />
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Min Lead Time"
          value={minLeadTime}
          onChange={(e) => onFilterChange("minLeadTime", e.target.value)}
          className="w-1/2"
        />
        <Input
          type="number"
          placeholder="Max Lead Time"
          value={maxLeadTime}
          onChange={(e) => onFilterChange("maxLeadTime", e.target.value)}
          className="w-1/2"
        />
      </div>
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
