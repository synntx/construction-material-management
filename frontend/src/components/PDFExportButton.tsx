import { useState } from "react";
import { Button } from "./ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/apiClient";

interface PDFExportButtonProps {
  projectId: string;
}

const PDFExportButton = ({ projectId }: PDFExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await api.get(
        `/api/v1/projects/${projectId}/items/export/pdf`
      );

      const data = response.data;

      window.location.href = data.downloadUrl;
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export PDF"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
    >
      <FileDown className="mr-2 h-4 w-4" />
      {isExporting ? "Generating..." : "Export PDF"}
    </Button>
  );
};

export default PDFExportButton;
