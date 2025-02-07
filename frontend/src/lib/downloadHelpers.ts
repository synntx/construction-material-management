import { useFileDownload } from "@/hooks/export";

export const useDownloadExcel = () => {
  const { downloadState, downloadFile } = useFileDownload();

  const downloadExcel = async (projectId: string) => {
    await downloadFile(
      `/api/v1/projects/${projectId}/items/export/excel`,
      `items-${projectId}.xlsx`,
      "excel"
    );
  };

  return {
    downloadExcel,
    isLoading: downloadState.isLoading,
    error: downloadState.error,
  };
};

export const useDownloadCSV = () => {
  const { downloadState, downloadFile } = useFileDownload();

  const downloadCSV = async (projectId: string) => {
    await downloadFile(
      `/api/v1/projects/${projectId}/items/export`,
      `items-${projectId}.csv`,
      "csv"
    );
  };

  return {
    downloadCSV,
    isLoading: downloadState.isLoading,
    error: downloadState.error,
  };
};
