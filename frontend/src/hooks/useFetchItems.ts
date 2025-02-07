import { useCallback, useState } from "react";
import api from "@/lib/apiClient";
import { AxiosResponse, isAxiosError } from "axios";

type FetchItemsResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchData: () => Promise<void>;
};

function useFetchItems<T>(url: string): FetchItemsResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<T> = await api.get(url);
      setData(response.data);
    } catch (err) {
      console.error("Error fetching items:", err);
      if (isAxiosError(err)) {
        setError(err);
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error, fetchData };
}

export default useFetchItems;
