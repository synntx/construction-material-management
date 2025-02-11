import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "@/lib/debounce";

export const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const updateQuery = (value: string) => {
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  const debouncedUpdate = useCallback(debounce(updateQuery, 500), [
    updateQuery,
  ]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      debouncedUpdate(value);
    },
    [debouncedUpdate]
  );

  useEffect(() => {
    const queryValue = searchParams.get("q") || "";
    if (searchTerm !== queryValue) {
      setSearchTerm(queryValue);
    }
  }, [searchParams]);


  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Search projects or items..."
        value={searchTerm}
        onChange={handleChange}
        className="pl-10"
      />
    </div>
  );
};
