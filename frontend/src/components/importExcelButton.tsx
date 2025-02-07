import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, LoaderPinwheel } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/apiClient";
import { isAxiosError } from "axios";
import { cn } from "@/lib/utils";

interface ImportExcelButtonProps {
  projectId: string;
  onImportSuccess?: () => void;
}

export const ImportExcelButton: React.FC<ImportExcelButtonProps> = ({
  projectId,
  onImportSuccess,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  useEffect(() => {
    if (isDragging) {
      setIsOverlayVisible(true);
    } else {
      const timeout = setTimeout(() => {
        setIsOverlayVisible(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isDragging]);

  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragEnter = (e: DragEvent) => {
      preventDefaults(e);
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      preventDefaults(e);
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      preventDefaults(e);
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        await handleImport(file);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", preventDefaults);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", preventDefaults);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [projectId]);

  const handleImport = async (file: File) => {
    const isExcel =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.name.endsWith(".xlsx");

    if (!isExcel) {
      toast.error("Please upload an Excel file (.xlsx)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const response = await api.post(
        `/api/v1/projects/${projectId}/items/import/excel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { successCount, errors } = response.data;

      if (errors.length > 0) {
        console.error("Import errors:", errors);
        toast.error(
          `Import completed with ${errors.length} errors. Check console for details.`
        );
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} items`);
        onImportSuccess?.();
      }
    } catch (error) {
      console.error("Import error:", error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error importing items");
      } else {
        toast.error("An unexpected error occurred while importing");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center transition-all duration-300",
          "pointer-events-none",
          isOverlayVisible ? "visible" : "invisible",
          isDragging ? "bg-black/80 opacity-100" : "opacity-0"
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center transform transition-transform duration-300",
            isDragging ? "scale-100" : "scale-95"
          )}
        >
          <Upload className="w-12 h-12 text-blue-500 mb-2" />
          <p className="text-xl  text-blue-500">Drop Excel file here</p>
        </div>
      </div>

      <div className="relative">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileSelect}
          className="hidden"
          id="excel-file-input"
        />
        <label htmlFor="excel-file-input">
          <Button
            variant="ghost"
            disabled={isUploading}
            className="flex items-center gap-2 cursor-pointer"
            asChild
          >
            <span>
              {isUploading ? (
                <>
                  <LoaderPinwheel className="h-4 w-4 animate-spin" />
                  <span className="hidden md:block">Importing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span className="hidden md:block">Import Excel</span>
                </>
              )}
            </span>
          </Button>
        </label>
      </div>
    </>
  );
};
