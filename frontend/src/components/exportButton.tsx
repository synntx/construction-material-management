// components/ExportButtons.tsx
import { Button } from "@/components/ui/button";
import { useDownloadCSV, useDownloadExcel } from "@/lib/downloadHelpers";
import { Loader2 } from "lucide-react"; 

interface ExportButtonsProps {
  projectId: string;
}

export const ExcelExportButton: React.FC<ExportButtonsProps> = ({ projectId }) => {
  const { downloadExcel, isLoading, error } = useDownloadExcel();

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => downloadExcel(projectId)}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Downloading..." : "Export to Excel"}
      </Button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const CSVExportButton: React.FC<ExportButtonsProps> = ({ projectId }) => {
  const { downloadCSV, isLoading, error } = useDownloadCSV();

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => downloadCSV(projectId)}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Downloading..." : "Export to CSV"}
      </Button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};