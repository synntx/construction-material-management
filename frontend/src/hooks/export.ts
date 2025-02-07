import { useState } from "react";
import api from "@/lib/apiClient";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface DownloadState {
  isLoading: boolean;
  error: string | null;
}

export const useFileDownload = () => {
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isLoading: false,
    error: null,
  });

  const downloadFile = async (
    apiEndpoint: string,
    fileName: string,
    fileType: "excel" | "csv"
  ) => {
    setDownloadState({ isLoading: true, error: null });

    try {
      const response = await api.get(apiEndpoint, {
        responseType: "blob",
      });

      // Check if the server responded with a JSON error message.
      // We expect file data (blob) for successful downloads, not JSON.
      const contentType = response.headers["content-type"];
      if (contentType?.includes("application/json")) {
        const reader = new FileReader();
        // 2. -> triggered after the reading is complete
        // set up the onload even handler
        reader.onload = () => {
          // as our server returns errors in json format so we parse the string using JSON.parse()
          const errorMessage = JSON.parse(reader.result as string);
          throw new Error(errorMessage.message);
        };
        // 1. -> Reads the data
        // reader.readAsText reads the response.data (which is blob data) as Text/String
        // once the reading is complete the onload event handeler of reader is triggered
        reader.readAsText(response.data);
        // return early to prevent the code from proceeding to file download logic
        return;
      }

      // Blob is a browser API for representing raw binary data
      const blob = new Blob([response.data], {
        // set the MIME type , important for the browser to understand
        // what kind of file it is and  how to handle it
        type:
          fileType === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv",
      });

      // programmatically triggering the file download in the user's browser
      // creates a temp. URL that point to blob object in memory.
      // this allows browser to access the data in the Blob field as if it were a file.
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      // temporary adds the link to the document body, necessary for
      // .click() method to work on  some browsers
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${fileType.toUpperCase()} file downloaded successfully!`);
      setDownloadState({ isLoading: false, error: null });
    } catch (error) {
      console.error(`Error downloading ${fileType} file:`, error);
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || `Error downloading ${fileType} file`
        : `An unexpected error occurred while downloading ${fileType} file`;

      toast.error(errorMessage);
      setDownloadState({ isLoading: false, error: errorMessage });
    }
  };

  return {
    downloadState,
    downloadFile,
  };
};
